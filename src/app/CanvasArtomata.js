import { Palette } from "./Palette";
import { rgbToHsv, rgbToHex } from "../lib/gfx.js";

const MAX_PATH_HISTORY = 10;

export class VelocityBrush {
  constructor(color) {
    // This is the vector that defines this automaton
    // In the sense of this application, it is the array with 3 elements Hue, Saturation, and Value
    this.color = color;
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.path = [];
    this.isPressed = false;
  }
  update() {
    this.path.push({ x: this.position.x, y: this.position.y });
    if (this.path.length > MAX_PATH_HISTORY) {
      this.path.shift();
    }
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  get angle() {
    return Math.atan2(this.velocity.y, this.velocity.x);
  }
  get magnitude() {
    return Math.sqrt(
      this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
    );
  }
}

// 3D Array representing palette index for the pixel color at x,y coords
export class CanvasPalettePixels {
  constructor(canvas, palette) {
    let w = (this.width = canvas.width);
    let h = (this.height = canvas.height);
    let imageData = canvas.getContext("2d").getImageData(0, 0, w, h);
    let i;
    this.pixels = [];
    for (let x = 0; x < w; x++) {
      this.pixels.push([]);
      for (let y = 0; y < h; y++) {
        i = (y * w + x) << 2;
        // [color, isVisited]
        this.pixels[x].push([
          palette.getColorIndex([
            imageData.data[i + 0],
            imageData.data[i + 1],
            imageData.data[i + 2]
          ]),
          !(imageData.data[i + 3] === 255) // only opaque pixels should be marked as visited=false
        ]);
      }
    }
  }
}

class BrushRender {
  static LINE = options => ctx => (brush, index) => {
    if (!brush.isPressed) {
      return;
    }
    let c = brush.color;
    ctx.strokeStyle =
      "rgba(" + c.join() + ", " + (options.opacity || 0.5) + ")";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(brush.position.x, brush.position.y);
    ctx.lineTo(
      brush.position.x + brush.velocity.x,
      brush.position.y + brush.velocity.y
    );
    ctx.stroke();
  };
  static CIRCLE = options => ctx => (brush, index) => {
    if (!brush.isPressed) {
      return;
    }
    let c = brush.color;
    ctx.fillStyle = "rgba(" + c.join() + ", " + (options.opacity || 0.5) + ")";
    ctx.beginPath();
    ctx.arc(
      brush.position.x,
      brush.position.y,
      options.radius || 5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  };
  static FACTORY = options => {
    let renderer = options && options.type;
    switch (renderer) {
      case "circle":
        return BrushRender.CIRCLE(options);
      case "line":
      default:
        return BrushRender.LINE(options);
    }
  };
}

class BrushMove {
  static COLOR_MAGNET = (field, options) => (brush, index) => {
    options = options || {};
    const { sampleSize = 4, turnAngle = Math.PI / 2 } = options;
    let theta = brush.angle;
    let radius = brush.magnitude;
    let angle = theta - turnAngle / 2;
    let maxAngle = theta + turnAngle / 2;
    let incAngle = turnAngle / sampleSize;
    let didMove = false;
    brush.isPressed = false;
    let validCoords = [];
    for (let a = angle; a < maxAngle; a += incAngle) {
      let x = brush.position.x + Math.round(radius * Math.cos(a));
      let y = brush.position.y + Math.round(radius * Math.sin(a));
      if (x < 0 || x >= field.width || y < 0 || y >= field.height) {
        continue;
      }

      let pixel = field.pixels[x][y];
      let isVisited = pixel[1];
      if (!isVisited && pixel[0] === index) {
        validCoords.push({ x, y });
      }
    }
    if (validCoords.length) {
      let px = validCoords[Math.floor(validCoords.length * Math.random())];
      brush.velocity.x = px.x - brush.position.x;
      brush.velocity.y = px.y - brush.position.y;
      field.pixels[px.x][px.y][1] = true;
      brush.isPressed = true;
    } else {
      brush.isPressed = false;
    }
    let px = brush.position.x + brush.velocity.x;
    let py = brush.position.y + brush.velocity.y;
    if (px < 0 || px >= field.width) {
      brush.velocity.x *= -1;
    }
    if (py < 0 || py > field.height) {
      brush.velocity.y *= -1;
    }
    brush.update();
  };
}

export class CanvasArtomata {
  constructor(
    canvas,
    { maxColors, maxVelocity, minVelocity, renderOptions, moveOptions }
  ) {
    canvas = canvas.node || canvas;
    posterizeCanvas(canvas, { maxColors });
    this.palette = new Palette(canvas, { maxColors });
    this.field = new CanvasPalettePixels(canvas, this.palette);
    let colors = this.palette.getColors();
    maxVelocity = maxVelocity || 5;
    minVelocity = minVelocity || 3;
    this.brushes = colors.map(rgb => {
      let brush = new VelocityBrush(rgb);
      brush.position.x = (Math.random() * canvas.width) | 0;
      brush.position.y = (Math.random() * canvas.height) | 0;

      brush.velocity.x =
        (Math.random() * (maxVelocity - minVelocity) + minVelocity) | 0;
      brush.velocity.y =
        (Math.random() * (maxVelocity - minVelocity) + minVelocity) | 0;
      return brush;
    });
    this.renderBrush = BrushRender.FACTORY(renderOptions);
    this.moveBrush = BrushMove.COLOR_MAGNET(this.field, moveOptions);
  }
  update() {
    this.brushes.forEach(this.moveBrush);
  }
  render(ctx) {
    const renderBrush = this.renderBrush(ctx);
    const rectSize = 20;
    this.brushes.forEach((brush, index) => {
      renderBrush(brush, index);

      ctx.fillStyle = rgbToHex(brush.color);
      ctx.fillRect(index * rectSize, 0, rectSize, rectSize);
    });
  }
}

export function posterizeCanvas(canvas, { maxColors }) {
  canvas = canvas.node || canvas;
  let palette = new Palette(canvas, { maxColors });
  let w = canvas.width;
  let h = canvas.height;
  let ctx = canvas.getContext("2d");
  let imageData = ctx.getImageData(0, 0, w, h);
  let rgb;
  for (let i = 0; i < imageData.data.length; i += 4) {
    rgb = palette.map([
      imageData.data[i + 0],
      imageData.data[i + 1],
      imageData.data[i + 2]
    ]);
    imageData.data[i + 0] = rgb[0];
    imageData.data[i + 1] = rgb[1];
    imageData.data[i + 2] = rgb[2];
  }
  ctx.putImageData(imageData, 0, 0);
}
