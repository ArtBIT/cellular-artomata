import Canvas from "./Canvas";
export class BitmapData {
  constructor(canvas) {
    if (canvas.ctx) {
      this.ctx = canvas.ctx;
    } else {
      this.ctx = canvas.getContext("2d");
    }
    this.imageData = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );
  }
  getPixel(x, y) {
    const data = this.imageData.data;
    const idx = (y * this.imageData.width + x) << 2;
    return [data[i + 0], data[i + 1], data[i + 2], data[i + 3]];
  }
  setPixel(x, y, rgba) {
    const i = (y * this.imageData.width + x) << 2;
    const data = this.imageData.data;
    data[i + 0] = rgba[0];
    data[i + 1] = rgba[1];
    data[i + 2] = rgba[2];
    data[i + 3] = rgba[3];
  }
}
