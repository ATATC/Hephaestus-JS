import {Component, Text} from "./component.js";
import {parseExpr} from "./hephaestus.js";

export function extractAttributes(component: Component): string {
    const fields = Object.keys(component);
    let attributes = "(";
    for (let i in fields) {
        const field = fields[i];
        if (field.startsWith("attr")) attributes += field.substring(4).toLowerCase() + "=" + Reflect.get(component, field) + ";";
    }
    if (attributes.length == 1) return "";
    return attributes + ")";
}

export function searchAttributesInExpr(expr: string): [string, string] {
    if (!Text.startsWith(expr, "(")) return null;
    const endIndex = Text.indexOf(expr, ")", 1) + 1;
    if (endIndex < 1) return null;
    return [expr.substring(0, endIndex), expr.substring(endIndex)];
}

export function injectField(field: string, instance: object, value: string): void {
    const t = Reflect.getOwnPropertyDescriptor(instance, field);
    if (t == String) Reflect.set(instance, field, value);
    else if (t == Number) Reflect.set(instance, field, Number(value));
    else if (t == Component) Reflect.set(instance, field, parseExpr(value));
    else Reflect.set(instance, field, Object(value));
}

export function getAttribute(attributesExpr: string, attributeName: string): string {
    if (attributesExpr.length < attributeName.length) return null;
    let startIndex = attributesExpr.indexOf(attributeName);
    if (startIndex < 0) return null;
    startIndex += attributeName.length;
    if (!Text.charAtEquals(attributesExpr, startIndex, "=")) return getAttribute(attributesExpr.substring(startIndex), attributeName);
    startIndex += 1;
    const endIndex = Text.indexOf(attributesExpr, ";", startIndex);
    if (endIndex < 0) return attributesExpr.substring(startIndex);
    return attributesExpr.substring(startIndex, endIndex);
}

export function injectAttributes(component: Component, attributesExpr: string): void {
    const fields = Object.keys(component);
    for (let i in fields) {
        const field = fields[i];
        if (!field.startsWith("attr")) continue;
        const val = getAttribute(attributesExpr, field.substring(4).toLowerCase());
        if (val == null) continue;
        injectField(field, component, val);
    }
}