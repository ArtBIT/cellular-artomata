export async function getImage(src, anonymous) {
  return new Promise(resolve => {
    let img = new Image();
    if (anonymous) {
      img.crossOrigin = "Anonymous";
    }
    img.onload = () => resolve(img);
    img.src = src;
    if (img.complete) {
      resolve(img);
    }
  });
}

// Color conversion formulas from http://en.wikipedia.org/wiki/HSV_color_space

function componentToHex(byte) {
  var hex = byte.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(rgb) {
  return (
    "#" +
    componentToHex(rgb[0]) +
    componentToHex(rgb[1]) +
    componentToHex(rgb[2])
  );
}

export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return (
    result && [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ]
  );
}

export function rgbToHsl(rgb) {
  let [r, g, b] = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, l];
}

export function hslToRgb(hsl) {
  let [h, s, l] = hsl;
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

export function rgbToHsv(rgb) {
  let [r, g, b] = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h,
    s,
    v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, v];
}

export function hsvToRgb(hsv) {
  let [h, s, v] = hsv;
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return [r * 255, g * 255, b * 255];
}

export class Rect {
  constructor(width, height) {
    if (height == 0) {
      throw new Error("Height cannot be zero");
    }
    this.width = width;
    this.height = height;
  }
  get ratio() {
    return this.width / this.height;
  }
  resizeToFit(width, height) {
    if (this.width > width) {
      this.width = width;
      this.height = width / this.ratio;
    }
    if (this.height > height) {
      this.height = height;
      this.width = height * this.ratio;
    }
  }
  resizeToCover(width, height) {
    if (this.width < width) {
      this.width = width;
      this.height = width / this.ratio;
    }
    if (this.height < height) {
      this.height = height;
      this.width = height * this.ratio;
    }
  }
}
