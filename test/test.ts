import {MDBlock, parseExpr, Skeleton} from "../src/index.js";

const comp = parseExpr("<TEST:(component={md:{# TEST\n\nThis is the initial example documentation. See ^[Hephaestus^]^(/ATATC/Hephaestus^) to learn where to begin with.}};)>");
console.log(comp.expr());
console.log((<MDBlock> (<Skeleton> comp).getComponent()).getMarkdown().getText());
