import {Skeleton, Text} from "./src/component.js";

const skeleton = new Skeleton("test skeleton");
skeleton.setComponent(new Text("test"));
console.log(new Text("").getTagName());
console.log(skeleton.expr());