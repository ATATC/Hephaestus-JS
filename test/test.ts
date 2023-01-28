import {MDBlock, parseExpr, Skeleton, Text} from "../src/index.js";

const welcome = new Skeleton("Welcome");
welcome.setComponent(new MDBlock(new Text("# Hephaestus\n\nThe most suitable text language for documentation. Native support for Markdown and HTML.")));
const introductionToHephaestus = new Skeleton("Introduction to Hephaestus");
introductionToHephaestus.setComponent(new MDBlock(new Text("## Installation")));
welcome.appendChild(introductionToHephaestus);
const expr = welcome.expr();
console.log(expr);
console.log(parseExpr(expr).expr());