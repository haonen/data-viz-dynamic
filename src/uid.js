//uid code copied from Observable library: https://github.com/observablehq/stdlib/blob/master/src/dom/uid.js
var count = 0;

export default function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function() {
  return "url(" + this.href + ")";
};
