import {all, parse, satisfies} from "../src";

const component = parse("[<abc:><abc>]");
if (component != null) console.log(satisfies(component, all("sk")));
