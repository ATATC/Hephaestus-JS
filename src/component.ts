import {Style} from "./style.js";
import {BadFormat} from "./exception.js";
import {parseExpr} from "./hephaestus.js";

class ComponentConfig {
    protected readonly _tagName: string;

    constructor(tagName: string = "undefined") {
        this._tagName = tagName;
    }

    public tagName(): string {
        return this._tagName;
    }
}

// todo: missing forEach()
export abstract class Component {
    private readonly config: ComponentConfig;
    protected style: Style = new Style();

    protected constructor(config: ComponentConfig = new ComponentConfig()) {
        this.config = config;
    }

    public getConfig(): ComponentConfig {
        return this.config;
    }

    public getTagName(): string | null {
        const config = this.getConfig();
        if (config == null) return "undefined";
        return config.tagName();
    }

    public setStyle(style: Style): void {
        this.style = style;
    }

    public getStyle(): Style {
        return this.style;
    }

    public abstract expr(): string;
}

export class Text extends Component {
    protected text: string;

    constructor(text: string) {
        super();
        this.setText(text);
    }

    public setText(text: string): void {
        this.text = text;
    }

    public getText(): string {
        return this.text;
    }

    public expr(): string {
        return "{" + Text.compile(this.getText()) + "}";
    }

    public static COMPILER_CHARACTER: string = '^';

    public static RESERVED_KEYWORDS: string[] = [
        '^',
        ':',
        '{',
        '}',
        '[',
        ']',
        '(',
        ')',
        '<',
        '>',
        '=',
        ';',
    ];

    public static quote(c: string): string {
        return Text.COMPILER_CHARACTER + c;
    }

    public static compile(s: string, c: string = null): string | null {
        if (s == null) return null;
        if (c == null) for (let i in Text.RESERVED_KEYWORDS) s = Text.compile(s, Text.RESERVED_KEYWORDS[i]);
        return s.replace(c, Text.quote(c));
    }

    public static decompile(s: string, c: string = null): string | null {
        if (s == null) return null;
        if (c == null) for (let i in Text.RESERVED_KEYWORDS) s = Text.decompile(s, Text.RESERVED_KEYWORDS[i]);
        return s.replace(Text.quote(s), c);
    }

    public static indexOf(s: string, c: string, fromIndex: number = 0): number {
        for (let i = fromIndex; i < s.length; i++) if (Text.charAtEquals(s, i, c)) return i;
        return -1;
    }

    public static lastIndexOf(s: string, c: string, fromIndex: number = s.length - 1): number {
        for (let i = fromIndex; i > 0; i--) if (Text.charAtEquals(s, i, c)) return i;
        return -1;
    }

    public static charAtEquals(s: string, i: number, c: string): boolean {
        const e = s.charAt(i) == c;
        if (i > 0) return e && s.charAt(i - 1) != Text.COMPILER_CHARACTER;
        if (c == Text.COMPILER_CHARACTER && s.length > 1) return e && s.charAt(1) != Text.COMPILER_CHARACTER;
        return e;
    }

    public static startsWith(s: string, c: string): boolean {
        return Text.charAtEquals(s, 0, c);
    }

    public static endsWith(s: string, c: string): boolean {
        return Text.charAtEquals(s, s.length - 1, c);
    }

    public static wrappedBy(s: string, start: string, end: string = start): boolean {
        return Text.startsWith(s, start) && Text.endsWith(s, end);
    }

    public static pairBrackets(s: string, open: string, close: string, requiredDepth: number = 0) {
        let depth = 0;
        let startIndex = -1;
        for (let i = 0; i < s.length; i++) {
            const bit = s.charAt(i);
            if (bit == open && depth++ == requiredDepth) startIndex = i;
            else if (bit == close && --depth == requiredDepth) return [startIndex, i];
        }
        return [startIndex, -1];
    }
}

export class MultiComponent extends Component implements Iterable<Component> {
    public static PARSER: (expr) => MultiComponent = expr => {
        let open, close;
        if (Text.wrappedBy(expr, "{", "}")) {
            open = "{";
            close = "}";
        } else if (Text.wrappedBy(expr, "<", ">")) {
            open = "<";
            close = ">";
        } else throw new BadFormat("Unrecognized format.", expr);
        let [start, end] = Text.pairBrackets(expr, open, close);
        const components = [];
        while (start >= 0 && end++ >= 0) {
            components.push(parseExpr(expr.substring(start, end)));
            expr = expr.substring(end);
            [start, end] = Text.pairBrackets(expr, open, close);
        }
        return new MultiComponent(...components);
    };

    protected components: Component[] = [];

    public constructor(...components: Component[]) {
        super();
        this.setComponents(...components);
    }

    public setComponents(...components: Component[]): void {
        this.components = components;
    }

    public expr(): string {
        if (this.components.length == 0) return "";
        if (this.components.length == 1) return this.components.at(0).expr();
        let expr = "[";
        this.components.forEach(component => expr += component.expr());
        return expr + "]";
    }

    public size(): number {
        return this.components.length;
    }

    public isEmpty(): boolean {
        return this.components.length == 0;
    }

    public contains(component: Component): boolean {
        return this.components.includes(component);
    }

    [Symbol.iterator](): Iterator<Component> {
        return this.components[Symbol.iterator]();
    }

    public add(component: Component) {
        return this.components.push(component);
    }

    public remove(index: number) {
        this.components.splice(index, 1);
    }

    public containsAll(c: Component[]): boolean {
        for (let i in c) if (!this.components.includes(c[i])) return false;
        return true;
    }

    public addAll(c: Component[]) {
        this.components.push(...c);
    }

    public clear() {
        this.components = [];
    }

    public get(index: number): Component {
        return this.components[index];
    }
}

export abstract class WrapperComponent extends Component {
    protected children: MultiComponent = new MultiComponent();

    public constructor(config: ComponentConfig, children: MultiComponent = new MultiComponent()) {
        super(config);
        this.setChildren(children);
    }

    public setChildren(children: MultiComponent) {
        this.children = children;
    }

    public getChildren(): MultiComponent {
        return this.children;
    }

    public appendChild(child: Component) {
        this.children.add(child);
    }

    public child(index: number): Component {
        return this.getChildren().get(index);
    }

    public removeChild(index: number) {
        this.children.remove(index);
    }

    // todo: missing attributes extraction
    public expr(): string {
        return "{" + this.getTagName() + ":" + this.getChildren().expr() + "}";
    }
}