import { MultiComponent, Ref, Skeleton, Text, UnsupportedComponent } from "./component/component";
import { ComponentNotClosed } from "./exception";
import { Config } from "./config";
import { implementationOfCompilable } from "./component/compilable";
import { injectAttributes, searchAttributesInExpr } from "./attribute";
export function parseExpr(expr) {
    if (expr == null || expr === "")
        return null;
    if (Text.wrappedBy(expr, "[", "]"))
        return MultiComponent.PARSER.parse(expr.substring(1, expr.length - 1));
    const temp = new UnsupportedComponent();
    temp.fullExpr = expr;
    const i = Text.indexOf(expr, ":");
    if (i < 0) {
        temp.tagName = "";
        temp.inner = expr.substring(1, expr.length - 1);
    }
    else {
        temp.tagName = expr.substring(1, i);
        temp.inner = expr.substring(i + 1, expr.length - 1);
    }
    const [attributesExpr, bodyExpr] = searchAttributesInExpr(temp.inner);
    temp.inner = bodyExpr;
    if (Text.wrappedBy(expr, '{', '}')) {
        if (temp.tagName === "")
            return Text.PARSER.parse(temp.inner);
        temp.tagName = temp.tagName.replaceAll(" ", "");
        const parser = Config.getParser(temp.tagName);
        const component = parser == null ? temp : parser.parse(temp.inner);
        if (component == null)
            return null;
        injectAttributes(component, attributesExpr);
        return component;
    }
    if (!Text.wrappedBy(expr, '<', '>'))
        throw new ComponentNotClosed(expr);
    if (temp.tagName === "")
        return new Skeleton(Text.decompile(temp.inner));
    const skeleton = Skeleton.PARSER.parse(temp.inner);
    if (skeleton == null)
        return null;
    injectAttributes(skeleton, attributesExpr);
    skeleton.setName(Text.decompile(temp.tagName));
    return skeleton;
}
export function parse(expr) {
    return parseExpr(clean(expr));
}
export function listTagNames() {
    return Config.listTagNames();
}
export function clean(expr) {
    if (expr == null || expr === "")
        return "";
    let f = 0;
    let builder = "";
    for (let i = 0; i < expr.length; i++) {
        const bit = expr.charAt(i);
        if (Text.charAtEqualsAny(expr, i, '{', '<'))
            f = 1;
        else if (f === 1 && Text.charAtEquals(expr, i, ':'))
            f = 2;
        else if (f === 2 && Text.charAtEquals(expr, i, '('))
            f = 3;
        else if (Text.charAtEqualsAny(expr, i, '}', '>'))
            f = 0;
        if (f !== 1 && (bit === '\n' || bit === ' ' || bit === '\r'))
            continue;
        builder += bit;
    }
    return builder;
}
export function compileComponentTree(top) {
    const componentMap = new Map();
    const references = [];
    top.parallelTraversal((component) => {
        if (component instanceof Ref)
            references.push(component);
        else {
            const id = component.getId();
            if (id != null)
                componentMap.set(id, component);
        }
        if (implementationOfCompilable(component))
            component.compile(refs => references.push(refs));
    });
    references.forEach(ref => ref.referTo(componentMap.get(ref.getId())));
    return top;
}
export function reduceRedundancy(top) {
    const componentSet = new Set();
    let idIter = 0;
    top.parallelTraversal((component) => {
        if (componentSet.has(component)) {
            for (let c of componentSet)
                if (c.equals(component))
                    c.setId(idIter.toString());
            component.setProxy(new Ref((idIter++).toString()));
        }
        else
            componentSet.add(component);
    });
    return top;
}
export function satisfies(component, constraint) {
    return constraint.conforms(component);
}
//# sourceMappingURL=hephaestus.js.map