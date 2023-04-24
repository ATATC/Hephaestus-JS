import { Text } from "./component/component.js";
import { parseExpr } from "./hephaestus.js";
import { Config } from "./config.js";
export function Attribute(name = "") {
    return function (target, propertyKey) {
        Config.getInstance().putAttributeMapping(target.constructor.name, propertyKey, name === "" ? propertyKey : name);
    };
}
export function extractAttributes(component) {
    let attributes = "(";
    for (let field of Object.keys(component)) {
        const attributeName = Config.getInstance().getAttributeName(Object.getPrototypeOf(component).constructor.name, field);
        if (attributeName == null)
            continue;
        const attributeVal = Reflect.get(component, field);
        if (attributeVal != null)
            attributes += attributeName + "=" + attributeVal + ";";
    }
    if (attributes.length === 1)
        return "";
    return attributes + ")";
}
export function searchAttributesInExpr(expr) {
    if (!Text.startsWith(expr, "("))
        return null;
    const endIndex = Text.indexOf(expr, ")", 1) + 1;
    if (endIndex < 1)
        return null;
    return [expr.substring(0, endIndex), expr.substring(endIndex)];
}
export function injectField(field, instance, value) {
    // const t = Reflect.get(instance, field);
    // if (t == String) Reflect.set(instance, field, value);
    // else if (t == Number) Reflect.set(instance, field, Number(value));
    // else if (t == Component) Reflect.set(instance, field, parseExpr(value));
    // else Reflect.set(instance, field, Object(value));
    // FixMe: This works for now, but it is extremely bad as it assumes every attribute to be a component type.
    Reflect.set(instance, field, parseExpr(value));
}
export function getAttribute(attributesExpr, attributeName) {
    if (attributesExpr.length < attributeName.length)
        return null;
    let startIndex = attributesExpr.indexOf(attributeName);
    if (startIndex < 0)
        return null;
    startIndex += attributeName.length;
    if (!Text.charAtEquals(attributesExpr, startIndex, "="))
        return getAttribute(attributesExpr.substring(startIndex), attributeName);
    startIndex += 1;
    const endIndex = Text.indexOf(attributesExpr, ";", startIndex);
    if (endIndex < 0)
        return attributesExpr.substring(startIndex);
    return attributesExpr.substring(startIndex, endIndex);
}
export function injectAttributes(component, attributesExpr) {
    for (let [field, attributeName] of Config.getInstance().getAttributes(Object.getPrototypeOf(component).constructor.name)) {
        const val = getAttribute(attributesExpr, attributeName);
        if (val == null)
            continue;
        injectField(field, component, val);
    }
}
//# sourceMappingURL=attribute.js.map