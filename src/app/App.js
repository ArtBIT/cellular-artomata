import * as dom from "../lib/dom";
import { Canvas } from "./Canvas";
import { Dropzone } from "./Dropzone";
import { Engine } from "./Engine";
import { Logger } from "./Logger";
import { CanvasArtomata } from "./CanvasArtomata";
import { Rect, rgbToHex } from "../lib/gfx";

export class App {
  constructor({ parent, ...config }) {
    this.config = config || {};
    Logger.enable(this.config.debug);
    this.node = dom.get(parent);
    this.dropzone = new Dropzone({
      parent: this.node,
      onDrop: this.onDropImage
    });
    this.engine = new Engine();
    this.engine.addTask(this.update);
    this.engine.addTask(this.render);
    this.bindEvents();
  }
  update = () => {
    this.artomata.update();
  };
  render = () => {
    this.artomata.render(this.canvas.ctx);
    Logger.log("render");
  };
  bindEvents() {
    dom.get("#start").addEventListener("click", this.start);
    dom.get("#reset").addEventListener("click", this.reset);
  }
  start = () => {
    Logger.log("Starting app loop.");
    this.engine.start();
  };
  reset = () => {
    Logger.log("Stopping app loop.");
    this.engine.stop();
    this.canvas.destroy();
    this.dropzone.show();
  };
  onDropImage = img => {
    Logger.log("New image loaded.");
    let rect = new Rect(img.width, img.height);
    rect.resizeToFit(this.node.offsetWidth, this.node.offsetHeight);
    this.canvas = new Canvas({
      parent: this.node,
      width: rect.width,
      height: rect.height
    });
    this.canvas.render(img, "scale");
    this.artomata = new CanvasArtomata(this.canvas, {
      maxColors: 16,
      maxVelocity: 10,
      renderOptions: {
        type: "circle",
        radius: 10
      }
    });
    this.drawPalette(
      this.artomata.palette.getColors(),
      this.canvas.ctx,
      0,
      0,
      20
    );
  };
  drawPalette(palette, ctx, x, y, rectSize) {
    ctx.save();
    ctx.translate(x, y);
    for (var i = 0, len = palette.length; i < len; i++) {
      ctx.fillStyle = rgbToHex(palette[i]);
      ctx.fillRect(i * rectSize, 0, rectSize, rectSize);
    }
    ctx.restore();
  }
}
