import {Skeleton, Text} from "./src/component.js";
import {parseExpr} from "./src/hephaestus.js";

const skeleton = new Skeleton("test skeleton");
skeleton.setComponent(new Text("test"));
console.log(skeleton.expr());
console.log(parseExpr(skeleton.expr()));