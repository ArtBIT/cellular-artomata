import * as dom from "../lib/dom";

export class Dropzone {
  constructor({ parent, ...options }) {
    this.options = options || {};

    this.node = dom.create("div", {
      innerHTML: "<h2>Drop Image Here</h2>",
      style: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        background: "#333",
        zIndex: 100,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    });
    parent && this.appendTo(parent);
    this.bindEvents();
  }
  appendTo(element) {
    dom.append(this.node, element);
  }
  captureDrag = e => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy"; // Show the copy icon when dragging over.
  };
  handleDrop = e => {
    e.stopPropagation();
    e.preventDefault();
    let files = e.dataTransfer.files;
    let callback = this.options.onDrop;
    for (let i = 0, ii = files.length; i < ii; i++) {
      let file = files[i];
      if (file.type.match(/image.*/)) {
        let reader = new FileReader();
        reader.onload = function(ev) {
          // finished reading file data.
          if (callback) {
            let img = new Image();
            img.onload = function() {
              callback(this, e);
            };
            img.src = ev.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    }
    this.hide();
  };
  onWindowDragEnter = e => {
    this.show();
  };
  bindEvents() {
    this.node.addEventListener("dragenter", this.captureDrag);
    this.node.addEventListener("dragover", this.captureDrag);
    this.node.addEventListener("drop", this.handleDrop);
    window.addEventListener("dragenter", this.onWindowDragEnter);
  }
  unbindEvents() {
    this.node.removeEventListener("dragenter", this.captureDrag);
    this.node.removeEventListener("dragover", this.captureDrag);
    this.node.removeEventListener("drop", this.handleDrop);
    window.removeEventListener("dragenter", this.onWindowDragEnter);
  }
  show() {
    dom.style(this.node, { display: "auto" });
  }
  hide() {
    dom.style(this.node, { display: "none" });
  }
  destroy() {
    this.unbindEvents();
    dom.destroy(this.node);
  }
}
