import {parseExpr, Skeleton, Text} from "../src/index.js";

const skeleton = new Skeleton("test");
skeleton.setComponent(new Text("test text"));
skeleton.setId("skeleton");

const hepxr = skeleton.expr();
console.log(hepxr);
console.log((<Skeleton> parseExpr(hepxr)).getComponent());
