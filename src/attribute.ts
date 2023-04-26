import {Component, Text} from "./component/component.js";
import {Config} from "./config.js";

export function Attribute(name: string = "", targetConstructor: (v: string) => any = v => v): Function {
    return function (target: any, propertyKey: string) {
        Config.getInstance().putAttributeMapping(target.constructor.name, propertyKey, name === "" ? propertyKey : name, targetConstructor);
    }
}

// Fixme: cannot detect attributes from super class
export function extractAttributes(component: Component): string {
    let attributes = "(";
    for (let [field, attributeName] of Config.getInstance().getAttributes(Object.getPrototypeOf(component).constructor.name)) {
        const attributeVal = Reflect.get(component, field);
        if (attributeVal != null) attributes += attributeName + "=" + attributeVal + ";";
    }
    if (attributes.length === 1) return "";
    return attributes + ")";
}

export function searchAttributesInExpr(expr: string): [string, string] | null {
    if (!Text.startsWith(expr, "(")) return null;
    const endIndex = Text.indexOf(expr, ")", 1) + 1;
    if (endIndex < 1) return null;
    return [expr.substring(0, endIndex), expr.substring(endIndex)];
}

export function injectField(field: string, instance: object, value: string, targetConstructor: (v: string) => any): void {
    Reflect.set(instance, field, targetConstructor(value));
}

export function getAttribute(attributesExpr: string, attributeName: string): string | null {
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

// Fixme: cannot detect attributes from super class
export function injectAttributes(component: Component, attributesExpr: string): void {
    for (let [field, attributeName, targetConstructor] of Config.getInstance().getAttributes(Object.getPrototypeOf(component).constructor.name)) {
        const val = getAttribute(attributesExpr, attributeName);
        if (val == null) continue;
        injectField(field, component, val, targetConstructor);
    }
}