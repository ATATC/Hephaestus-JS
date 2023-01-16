import {MultiComponent} from "./src/component.js";

console.log("A");
let comp = new MultiComponent();
console.log(Reflect.has(comp, "PARSER"));
console.log(comp.getTagName());