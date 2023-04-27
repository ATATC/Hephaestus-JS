import { Text } from "./component/component.js";
import { Config } from "./config.js";
import { forEachDeclaredField } from "./utils.js";
export function Attribute(name = "", targetConstructor = v => v) {
    return function (target, propertyKey) {
        Config.getInstance().putAttributeMapping(target.constructor.name, propertyKey, name === "" ? propertyKey : name, targetConstructor);
    };
}
export function extractAttributes(component) {
    let attributes = "(";
    forEachDeclaredField(Object.getPrototypeOf(component), (field, attributeName) => {
        const attributeVal = Reflect.get(component, field);
        if (attributeVal != null)
            attributes += attributeName + "=" + attributeVal + ";";
    });
    return attributes.length === 1 ? "" : attributes + ")";
}
export function searchAttributesInExpr(expr) {
    if (!Text.startsWith(expr, "("))
        return null;
    const endIndex = Text.indexOf(expr, ")", 1) + 1;
    if (endIndex < 1)
        return null;
    return [expr.substring(0, endIndex), expr.substring(endIndex)];
}
export function injectField(field, instance, value, targetConstructor) {
    Reflect.set(instance, field, targetConstructor(value));
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
    forEachDeclaredField(Object.getPrototypeOf(component), (field, attributeName, targetConstructor) => {
        const val = getAttribute(attributesExpr, attributeName);
        if (val != null)
            injectField(field, component, val, targetConstructor);
    });
}
//# sourceMappingURL=attribute.js.map