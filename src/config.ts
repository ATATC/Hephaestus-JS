import {Parser} from "./parser.js";
import {Component} from "./component.js";

class Config {
    private static readonly instance: Config = new Config();
    public static getInstance(): Config {
        return Config.instance;
    }

    private readonly parserMap: Map<String, Parser<any>> = new Map<String, Parser<Component>>();

    private constructor() {
    }

    public putParser(tagName: string, parser: Parser<any>): void {
        this.parserMap.set(tagName, parser);
    }

    public getParser(tagName: string): Parser<any> {
        return this.parserMap.get(tagName);
    }
}