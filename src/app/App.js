import * as dom from "../lib/dom";
import { Canvas } from "./Canvas";
import { Dropzone } from "./Dropzone";
import { Engine } from "./Engine";
import { Logger } from "./Logger";
import { CanvasArtomata, posterizeCanvas } from "./CanvasArtomata";
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
      maxColors: 8,
      maxVelocity: 10,
      minVelocity: 5,
      turnAngle: Math.PI,
      renderOptions: {
        type: "circle",
        radius: 10,
        opacity: 0.4
      }
    });
  };
}
