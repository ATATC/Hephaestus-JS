import {Component} from "./component.js";

// FixMe: A major bug: this class is not initialized yet when the Attribute decorators are being called, causing null pointer exceptions.
export class Config {
    private static readonly instance: Config = new Config();
    public static getInstance(): Config {
        return Config.instance;
    }

    private readonly parserMap: Map<string, (expr) => Component> = new Map<string, (expr) => Component>();
    private readonly attributeMappingMap: Map<string, string> = new Map<string, string>();

    private constructor() {
        console.log("A");
    }

    public putParser(tagName: string, parser: (expr) => Component): void {
        this.parserMap.set(tagName, parser);
    }

    public getParser(tagName: string): (expr) => Component {
        return this.parserMap.get(tagName);
    }

    public putAttributeMapping(prefix: string, fieldName: string, attributeName: string): void {
        this.attributeMappingMap.set(prefix + "." + fieldName, attributeName);
    }

    public getAttributeName(prefix: string, fieldName: string): string {
        return this.attributeMappingMap.get(prefix + "." + fieldName);
    }

    public getAttributes(prefix: string): [string, string][] {
        const attributes = [];
        for (let [index, attrName] of this.attributeMappingMap.entries()) {
            const [pre, field] = index.split(".");
            if (pre == prefix) attributes.push([field, attrName]);
        }
        return attributes;
    }
}