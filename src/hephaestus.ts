import {Component, MultiComponent, Skeleton, Text, UnsupportedComponent} from "./component.js";
import {ComponentNotClosed} from "./exception.js";
import {Config} from "./config.js";

export function parseExpr(expr: string): Component {
    if (expr == null || expr == "") return null;
    if (Text.wrappedBy(expr, "[", "]")) return MultiComponent.PARSER(expr.substring(1, expr.length - 1));
    const temp = new UnsupportedComponent();
    temp.fullExpr = expr;
    const i = Text.indexOf(expr, ":");
    if (i < 0) {
        temp.tagName = "";
        temp.inner = expr.substring(1, expr.length - 1);
    } else {
        temp.tagName = expr.substring(1, i);
        temp.inner = expr.substring(i + 1, expr.length - 1);
    }
    if (Text.wrappedBy(expr, '{', '}')) {
        if (temp.tagName == "") return Text.PARSER(temp.inner);
        temp.tagName = temp.tagName.replaceAll(" ", "");
        const parser = Config.getInstance().getParser(temp.tagName);
        return parser == null ? temp : parser(temp.inner);
    }
    if (!Text.wrappedBy(expr, '<', '>')) throw new ComponentNotClosed(expr);
    let skeleton;
    if (temp.tagName == "") skeleton = new Skeleton(temp.inner);
    else {
        skeleton = Skeleton.PARSER(temp.inner);
        skeleton.setName(Text.decompile(temp.tagName));
    }
    return skeleton;
}

export function parse(expr: string): Component {
    return parseExpr(clean(expr));
}

export function listTagNames(): string[] {
    return Config.getInstance().listTagNames();
}

export function clean(expr: string): string {
    if (expr == null || expr == "") return "";
    let f = 0;
    let builder = "";
    for (let i = 0; i < expr.length; i++) {
        const bit = expr.charAt(i);
        if (Text.charAtEqualsAny(expr, i, '{', '<')) f = 1;
        else if (f == 1 && Text.charAtEquals(expr, i, ':')) f = 2;
        else if (f == 2 && Text.charAtEquals(expr, i, '(')) f = 3;
        else if (Text.charAtEqualsAny(expr, i, '}', '>')) f = 0;
        if (f != 1 && (bit == '\n' || bit == ' ')) continue;
        builder += bit;
    }
    return builder;
}
