import {Skeleton, Text, parseExpr} from "../src/index.js";

const skeleton = new Skeleton("test skeleton");
skeleton.setComponent(new Text("test"));
const expr = skeleton.expr();
console.log(expr);
console.log(parseExpr(expr).toString());