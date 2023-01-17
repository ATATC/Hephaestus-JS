import {Component} from "./component.js";

export class Config {
    private static readonly instance: Config = new Config();
    public static getInstance(): Config {
        return Config.instance;
    }

    private readonly parserMap: Map<String, (expr) => Component> = new Map<String, (expr) => Component>();

    private constructor() {
    }

    public putParser(tagName: string, parser: (expr) => Component): void {
        this.parserMap.set(tagName, parser);
    }

    public getParser(tagName: string): (expr) => Component {
        return this.parserMap.get(tagName);
    }
}