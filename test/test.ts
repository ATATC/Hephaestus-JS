import {Skeleton, Text} from "../src/index.js";

const skeleton = new Skeleton("test skeleton");
const skeleton2 = new Skeleton("test skeleton 2");
const skeleton3 = new Skeleton("test skeleton 3");
skeleton.setComponent(new Text("test"));
skeleton.appendChild(skeleton2);
skeleton.appendChild(skeleton3);
skeleton.getChildren().map(component => console.log(component));