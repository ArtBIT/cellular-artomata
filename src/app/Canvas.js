import * as dom from "../lib/dom";
import getImage from "../lib/gfx";

export class Canvas {
  static create(options) {
    return new Canvas(options);
  }
  static fromImage(img, scaling) {
    let canvas = new Canvas({ width: img.width, height: img.height });
    canvas.render(img);
    return canvas;
  }
  static async fromImageSourceAsync(src) {
    const img = await getImage(src, true);
    return Canvas.fromImage(img);
  }
  constructor({ parent, ...options }) {
    this.options = options || {};
    const width = this.options.width || "100%";
    const height = this.options.height || "100%";
    this.node = dom.create("canvas", {
      width: width,
      height: height
    });
    this.node.width = width;
    this.node.height = height;
    parent && this.appendTo(parent);
    this.ctx = this.node.getContext("2d");
  }
  destroy() {
    dom.destroy(this.node);
  }
  appendTo(element) {
    dom.append(this.node, element);
  }
  fill(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.node.width, this.node.height);
  }
  render(source, scaling) {
    if (source.node) {
      source = source.node;
    }
    scaling = scaling || "clip";

    const width = this.node.width;
    const height = this.node.height;

    switch (scaling) {
      case "clip":
        this.ctx.drawImage(source, 0, 0, width, height, 0, 0, width, height);
        break;
      case "cover":
        var src_ratio = source.width / source.height;
        var dest_ratio = width / height;
        var dx, dy, dwidth, dheight;
        if (src_ratio > dest_ratio) {
          dheight = height;
          dwidth = dheight * src_ratio;
          dx = (width - dwidth) / 2;
          dy = 0;
        } else {
          dwidth = width;
          dheight = dwidth / src_ratio;
          dx = 0;
          dy = (height - dheight) / 2;
        }
        this.ctx.drawImage(
          source,
          0,
          0,
          source.width,
          source.height,
          dx,
          dy,
          dwidth,
          dheight
        );
        break;
      case "contain":
        var src_ratio = source.width / source.height;
        var dest_ratio = width / height;
        var dx, dy, dwidth, dheight;
        if (src_ratio < dest_ratio) {
          dheight = height;
          dwidth = dheight * src_ratio;
          dx = (width - dwidth) / 2;
          dy = 0;
        } else {
          dwidth = width;
          dheight = dwidth / src_ratio;
          dx = 0;
          dy = (height - dheight) / 2;
        }
        this.ctx.drawImage(
          source,
          0,
          0,
          source.width,
          source.height,
          dx,
          dy,
          dwidth,
          dheight
        );
        break;
      default:
        // stretch
        this.ctx.drawImage(source, 0, 0, width, height);
        break;
    }
  }
  get width() {
    return this.node.width;
  }
  set width(width) {
    this.node.width = width;
    this.node.style.width = width;
  }
  get height() {
    return this.node.height;
  }
  set height(height) {
    this.node.height = height;
    this.node.style.height = height;
  }
}
