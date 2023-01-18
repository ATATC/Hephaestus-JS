import {Component, MultiComponent, Skeleton, Text, UnsupportedComponent} from "./component.js";
import {ComponentNotClosed} from "./exception.js";
import {Config} from "./config.js";

export function parseExpr(expr: string): Component {
    if (expr == null || expr == "") return null;
    if (Text.wrappedBy(expr, "[", "]")) return MultiComponent.PARSER(expr.substring(1, expr.length - 1));
    const temp = new UnsupportedComponent();
    temp.fullExpr = expr;
    const i = Text.indexOf(expr, ":");
    if (i < 0) return Text.PARSER(expr.substring(1, expr.length - 1));
    temp.tagName = expr.substring(1, i);
    temp.inner = expr.substring(i + 1, expr.length - 1);
    if (Text.wrappedBy(expr, "<", ">")) {
        const skeleton = Skeleton.PARSER(temp.inner);
        skeleton.setName(Text.decompile(temp.tagName));
        return skeleton;
    }
    temp.tagName = temp.tagName.replaceAll(" ", "");
    if (!Text.wrappedBy(expr, "{", "}")) throw new ComponentNotClosed(expr);
    const parser = Config.getInstance().getParser(temp.tagName);
    return parser == null ? temp : parser(temp.inner);
}
