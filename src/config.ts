import {Component} from "./component.js";

export class Config {
    private static readonly instance: Config = new Config();
    public static getInstance(): Config {
        return Config.instance;
    }

    private readonly parserMap: Map<string, (expr) => Component> = new Map<string, (expr) => Component>();
    private readonly attributeMappingMap: Map<string, string> = new Map<string, string>();

    private constructor() {
    }

    public putParser(tagName: string, parser: (expr) => Component): void {
        this.parserMap.set(tagName, parser);
    }

    public getParser(tagName: string): (expr) => Component {
        return this.parserMap.get(tagName);
    }

    public putAttributeMapping(fieldName: string, attributeName: string): void {
        this.attributeMappingMap.set(fieldName, attributeName);
    }

    public getAttributeName(fieldName: string): string {
        return this.attributeMappingMap.get(fieldName);
    }
}