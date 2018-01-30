require("../kload-node.js");
register("kai",".");

var K_MATH = imports("kai/k-math");
var pad0 = K_MATH.pad0;

console.log(pad0(1,3));