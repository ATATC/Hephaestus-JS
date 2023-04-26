import {Component} from "./component/component.js";

export class Config {
    private static readonly instance: Config = new Config();

    public static getInstance(): Config {
        return Config.instance;
    }

    private readonly parserMap: Map<string, (expr: string) => Component> = new Map<string, (expr: string) => Component>();
    private readonly attributeMappingMap: Map<string, [string, (v: string) => any]> = new Map<string, [string, (v: string) => any]>();

    private constructor() {
    }

    public getInstance(): Config {
        return this;
    }

    public listTagNames(): string[] {
        return Array.from(this.parserMap.keys());
    }

    public putParser(tagName: string, parser: (expr: string) => Component): void {
        this.parserMap.set(tagName, parser);
    }

    public getParser(tagName: string): ((expr: string) => Component) | null {
        const parser = this.parserMap.get(tagName);
        return parser === undefined ? null : parser;
    }

    public putAttributeMapping(prefix: string, fieldName: string, attributeName: string, targetConstructor: (v: string) => any): void {
        this.attributeMappingMap.set(prefix + "." + fieldName, [attributeName, targetConstructor]);
    }

    public getAttributeName(prefix: string, fieldName: string): [string, (v: string) => any] | null {
        const attrInfo = this.attributeMappingMap.get(prefix + "." + fieldName);
        return attrInfo === undefined ? null : attrInfo;
    }

    public getAttributes(prefix: string): [string, string, (v: string) => any][] {
        const attributes: [string, string, (v: string) => any][] = [];
        this.attributeMappingMap.forEach(([attrName, targetConstructor], index) => {
            const [pre, field] = index.split(".");
            if (pre === prefix) attributes.push([field, attrName, targetConstructor]);
        });
        return attributes;
    }
}