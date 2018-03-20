import { Canvas } from "./Canvas";
import quantize from "quantize";

export class Palette {
  constructor(source, options) {
    this.options = options || {};
    this.source = source;
    this.update();
  }
  update() {
    const canvas = new Canvas({
      width: this.source.width,
      height: this.source.height
    });
    canvas.ctx.drawImage(this.source.node || this.source, 0, 0);
    const imgdata = canvas.ctx.getImageData(
      0,
      0,
      this.source.width,
      this.source.height
    );
    const rgbas = [];
    for (let i = 0, ii = imgdata.data.length; i < ii; i += 4) {
      // ignore semi-transparent pixels
      if (imgdata.data[i + 3] < 170) {
        continue;
      }
      rgbas.push([
        imgdata.data[i + 0],
        imgdata.data[i + 1],
        imgdata.data[i + 2]
      ]);
    }
    this.colorMap = quantize(rgbas, this.options.maxColors || 8);
    this.palette = this.colorMap.palette();
  }
  getColors() {
    return this.palette;
  }
  getColorIndex(rgb) {
    let c = this.map(rgb);
    for (let i = 0; i < this.palette.length; i++) {
      if (
        this.palette[i][0] === c[0] &&
        this.palette[i][1] === c[1] &&
        this.palette[i][2] === c[2]
      ) {
        return i;
      }
    }
    return -1;
  }
  map(rgb) {
    return this.colorMap.map(rgb);
  }
}
