import {Parser} from "./parser.js";

export class Config {
    private static readonly instance: Config = new Config();

    public static getInstance(): Config {
        return Config.instance;
    }

    private readonly parserMap: Map<string, Parser<any>> = new Map<string, Parser<any>>();
    private readonly attributeMappingMap: Map<string, [string, (v: string) => any]> = new Map<string, [string, (v: string) => any]>();

    private constructor() {
    }

    public getInstance(): Config {
        return this;
    }

    public listTagNames(): string[] {
        return Array.from(this.parserMap.keys());
    }

    public putParser(tagName: string, parser: Parser<any>): void {
        this.parserMap.set(tagName, parser);
    }

    public getParser(tagName: string): Parser<any> | null {
        const parser = this.parserMap.get(tagName);
        return parser === undefined ? null : parser;
    }

    public putAttributeMapping(prefix: string, fieldName: string, attributeName: string, targetConstructor: (v: string) => any): void {
        this.attributeMappingMap.set(prefix + "." + fieldName, [attributeName, targetConstructor]);
    }

    public getAttributeName(prefix: string, fieldName: string): [string, (v: string) => any] | null {
        const attributeInfo = this.attributeMappingMap.get(prefix + "." + fieldName);
        return attributeInfo === undefined ? null : attributeInfo;
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