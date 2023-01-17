import {Skeleton, Text} from "./src/component.js";
import {parseExpr} from "./src/hephaestus.js";

const skeleton = new Skeleton("test skeleton");
skeleton.setComponent(new Text("test"));
const expr = skeleton.expr();
console.log(expr);
console.log(parseExpr(expr).toString());