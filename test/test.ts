import {Skeleton} from "../src/index.js";

const skeleton1 = new Skeleton("S1");
const skeleton2 = new Skeleton("S2");
const skeleton3 = new Skeleton("S3");
const skeleton4 = new Skeleton("S4");
const skeleton5 = new Skeleton("S5");

skeleton1.appendChild(skeleton2);
skeleton1.appendChild(skeleton3);
skeleton2.appendChild(skeleton4);
skeleton3.appendChild(skeleton5);

skeleton1.forEach((component, depth) => console.log(depth));

skeleton1.parallelTraversal((component, depth) => console.log(depth));
