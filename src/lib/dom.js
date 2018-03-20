export function style(selector, css) {
  const elem = get(selector);
  Object.keys(css).forEach(key => (elem.style[key] = css[key]));
}

export function create(tagName, { style: css, innerHTML, ...options }) {
  let elem = document.createElement(tagName);
  options &&
    Object.keys(options).forEach(key => elem.setAttribute(key, options[key]));
  if (innerHTML) {
    elem.innerHTML = innerHTML;
  }
  if (css) {
    style(elem, css);
  }
  return elem;
}

export function get(selector) {
  if (selector instanceof Element) {
    return selector;
  }
  return document.querySelector(selector);
}

export function append(what, where) {
  return get(where).appendChild(what);
}

export function destroy(selector) {
  let node = get(selector);
  if (node) {
    node.parentNode && node.parentNode.removeChild(node);
  }
}
