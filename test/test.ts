import {clean, parse} from "../src/hephaestus.js";

const a = clean(" < skeleton : (component = {md: {\n### Test\n\nThis is a test.\n}};) [<skeleton2> <skeleton3>]> ");
console.log(a);
console.log(parse(a).expr());