import {Style} from "../style.js";
import {BadFormat, MissingFieldException} from "../exception.js";
import {parseExpr} from "../hephaestus.js";
import {Attribute, extractAttributes, injectAttributes, searchAttributesInExpr} from "../attribute.js";
import {Config} from "../config.js";
import {Compilable} from "./compilable.js";

class ComponentConfigRecord {
    protected readonly _tagName: string;

    constructor(tagName: string = "undefined") {
        this._tagName = tagName;
    }

    public tagName(): string {
        return this._tagName;
    }
}

export function ComponentConfig(tagName: string): Function {
    return function (constructor: Function): void {
        constructor.prototype.config = new ComponentConfigRecord(tagName);
        if (!Reflect.has(constructor, "PARSER")) throw new MissingFieldException(constructor, "PARSER");
        Config.getInstance().putParser(tagName, Reflect.get(constructor, "PARSER"));
    };
}

export abstract class Component {
    @Attribute()
    protected id: string | null = null;
    protected style: Style | null = new Style();

    protected constructor() {
    }

    public getConfig(): ComponentConfigRecord | null {
        return Object.getPrototypeOf(this).config;
    }

    public getTagName(): string {
        const config = this.getConfig();
        return config == null ? "undefined" : config.tagName();
    }

    public setId(id: string | null): void {
        this.id = id;
    }

    public getId(): string | null {
        return this.id;
    }

    public setStyle(style: Style | null): void {
        this.style = style;
    }

    public getStyle(): Style | null {
        return this.style;
    }

    public forEach(action: (component: Component, depth: number) => void, depth: number = 0): void {
        action(this, depth);
    }

    public parallelTraversal(action: (component: Component, depth: number) => void, depth: number = 0): void {
        action(this, depth);
    }

    protected generateExpr(inner: string): string {
        return "{" + this.getTagName() + ":" + extractAttributes(this) + inner + "}";
    }

    public abstract expr(): string;
}
Component.prototype.toString = function (): string {
    return this.expr();
};

export class UnsupportedComponent extends Component {
    public tagName: string = "undefined";
    public fullExpr: string = "";
    public inner: string = "";

    public constructor() {
        super();
    }

    public expr(): string {
        return this.fullExpr;
    }
}

export class Text extends Component {
    public static PARSER: (expr: string) => Text = expr => new Text(Text.decompile(expr));

    protected text: string = "";

    constructor(text: string | null = null) {
        super();
        if (text != null) this.setText(text);
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

    public static compile(s: string, c: string | null = null): string {
        if (c != null) return s.replaceAll(c, Text.quote(c));
        for (let k of Text.RESERVED_KEYWORDS) s = Text.compile(s, k);
        return s;
    }

    public static decompile(s: string, c: string | null = null): string {
        if (c != null) return s.replaceAll(Text.quote(c), c);
        for (let k of Text.RESERVED_KEYWORDS) s = Text.decompile(s, k);
        return s;
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

    public static charAtEqualsAny(s: string, i: number, ...cs: string[]): boolean {
        const bit = s.charAt(i);
        for (let c of cs) {
            if (bit != c) continue;
            if (i > 0) return s.charAt(i - 1) != Text.COMPILER_CHARACTER;
            if (c == Text.COMPILER_CHARACTER && s.length > 1) return s.charAt(1) != Text.COMPILER_CHARACTER;
            return true;
        }
        return false;
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

    public static pairBrackets(s: string, open: string, close: string, requiredDepth: number = 0): [number, number] {
        let depth = 0;
        let startIndex = -1;
        for (let i = 0; i < s.length; i++) {
            if (Text.charAtEquals(s, i, open) && depth++ == requiredDepth) startIndex = i;
            else if (Text.charAtEquals(s, i, close) && --depth == requiredDepth) return [startIndex, i];
        }
        return [startIndex, -1];
    }
}

@ComponentConfig("ref")
export class Ref extends Component {
    public static PARSER: (expr: string) => Ref = expr => new Ref(expr);

    protected to: Component | null = null;

    public constructor(id: string | null) {
        super();
        this.setId(id);
    }

    public referTo(real: Component | null): void {
        this.to = real;
    }

    public expr(): string {
        if (this.to != null) return this.to.expr();
        const id = this.getId();
        return this.generateExpr(id == null ? "" : id);
    }
}

export class MultiComponent extends Component implements Iterable<Component> {
    public static PARSER: (expr: string) => MultiComponent = expr => {
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

    public forEach(action: (component: Component, depth: number) => void, depth: number = 0) {
        for (let component of this.components) component.forEach(action, depth);
    }

    public parallelTraversal(action: (component: Component, depth: number) => void, depth: number = 0, components: Component[] = this.components) {
        const next = [];
        for (let component of components) {
            if (component instanceof WrapperComponent) next.push(...component.getChildren().components);
            action(component, depth);
        }
        if (next.length > 0) this.parallelTraversal(action, depth + 1, next);
    }

    public expr(): string {
        if (this.components.length < 2) {
            const component = this.components.at(0);
            return component == null ? "" : component.expr();
        }
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

    public add(component: Component): void {
        this.components.push(component);
    }

    public remove(index: number): void {
        this.components.splice(index, 1);
    }

    public containsAll(c: Component[]): boolean {
        for (let component of c) if (!this.components.includes(component)) return false;
        return true;
    }

    public addAll(c: Component[]): void {
        this.components.push(...c);
    }

    public clear(): void {
        this.components = [];
    }

    public get(index: number): Component {
        return this.components[index];
    }

    /**
     * Not original.
     * @param callbackfn callback function
     */
    public map <T> (callbackfn: (component: Component, index: number, multiComponent: MultiComponent) => T): T[] {
        const arr = [];
        for (let i in this.components) arr.push(callbackfn(this.components[i], Number(i), this));
        return arr;
    }
}

export abstract class WrapperComponent extends Component {
    protected children: MultiComponent = new MultiComponent();

    protected constructor(children: MultiComponent = new MultiComponent()) {
        super();
        this.setChildren(children);
    }

    public setChildren(children: MultiComponent): void {
        this.children = children;
    }

    public getChildren(): MultiComponent {
        return this.children;
    }

    public appendChild(child: Component): void {
        this.children.add(child);
    }

    public child(index: number): Component {
        return this.getChildren().get(index);
    }

    public removeChild(index: number): void {
        this.children.remove(index);
    }

    public forEach(action: (component: Component, depth: number) => void, depth: number = 0) {
        super.forEach(action, depth);
        this.getChildren().forEach(action, depth + 1);
    }

    public parallelTraversal(action: (component: Component, depth: number) => void, depth: number = 0) {
        super.parallelTraversal(action, depth);
        this.getChildren().parallelTraversal(action, depth + 1);
    }

    public expr(): string {
        return this.generateExpr(this.getChildren().expr());
    }

    public static makeParser <C extends WrapperComponent> (constructor: Function): (expr: string) => C {
        return expr => {
            const component = Object.create(constructor.prototype);
            const attributesAndBody = searchAttributesInExpr(expr);
            let attributesExpr, bodyExpr;
            if (attributesAndBody == null) bodyExpr = expr;
            else {
                [attributesExpr, bodyExpr] = attributesAndBody;
                injectAttributes(component, attributesExpr);
            }
            const bodyComponent = parseExpr(bodyExpr);
            if (bodyComponent != null) component.setChildren(bodyComponent instanceof  MultiComponent ? bodyComponent : new MultiComponent(bodyComponent));
            else component.setChildren(new MultiComponent());
            return component;
        };
    }
}

export class Skeleton extends WrapperComponent implements Compilable {
    public static PARSER: (expr: string) => Skeleton = WrapperComponent.makeParser(Skeleton);

    protected name: string = "unnamed";

    @Attribute()
    protected component: Component | null = null;

    protected parent: Skeleton | null = null;

    public constructor(name: string | null = null) {
        super();
        if (name != null) this.setName(name);
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setComponent(component: Component | null): void {
        this.component = component;
    }

    public getComponent(): Component | null {
        return this.component;
    }

    public setParent(parent: Skeleton | null): void {
        if (parent == null || parent.getChildren().contains(this)) this.parent = parent;
        else parent.appendChild(this);
    }

    public getParent(): Skeleton | null {
        return this.parent;
    }

    public appendChild(child: Component) {
        if (child instanceof Skeleton) {
            super.appendChild(child);
            child.setParent(this);
        } else throw new Error("UnsupportedOperationException");
    }

    public expr(): string {
        const expr = "<" + Text.compile(this.getName()) + ":" + extractAttributes(this) + this.getChildren().expr();
        return (expr.endsWith(":") ? expr.substring(0, expr.length - 1) : expr) + ">";
    }

    public compile(compiler: (...refs: Ref[]) => void) {
        if (this.getComponent() instanceof Ref) compiler(<Ref> this.getComponent());
    }
}

class Serial {
    protected readonly args: any[];

    public constructor(...args: any[]) {
        this.args = args;
    }

    public equals(o: any | Serial, sequential: boolean): boolean {
        if (sequential == null) {
            if (this == o) return true;
            if (o instanceof Serial) return this.equals(o, true);
            return false;
        }
        if (this.args.length != o.args.length) return false;
        for (let i = 0; i < this.args.length; i++) {
            if (sequential) {
                if (this.args[i] != o.args[i]) return false;
            } else if (!o.args.includes(this.args[i])) return false;
        }
        return true;
    }
}

@ComponentConfig("v")
export class Version extends WrapperComponent {
    public readonly Serial = Serial;

    public static PARSER: (expr: string) => Version = WrapperComponent.makeParser(Version);

    protected serial: Serial = new Serial("undefined");

    public constructor(serial: Serial | string) {
        super();
        this.setSerial(serial instanceof Serial ? serial : new Serial(serial));
    }

    public setSerial(serial: Serial): void {
        this.serial = serial;
    }

    public getSerial(): Serial {
        return this.serial;
    }
}

@ComponentConfig("html")
export class HTMLBlock extends Component {
    public static PARSER: (expr: string) => HTMLBlock = expr => new HTMLBlock(<Text> parseExpr(expr));

    protected html: Text | null = null;

    public constructor(html: Text | null = null) {
        super();
        this.setHTML(html);
    }

    public setHTML(html: Text | null): void {
        this.html = html;
    }

    public getHTML(): Text {
        return this.html == null ? new Text() : this.html;
    }

    public expr(): string {
        return this.generateExpr(this.getHTML().expr());
    }
}

@ComponentConfig("md")
export class MDBlock extends Component {
    public static PARSER: (expr: string) => MDBlock = expr => new MDBlock(<Text> parseExpr(expr));

    protected markdown: Text | null = null;

    public constructor(markdown: Text | null = null) {
        super();
        this.setMarkdown(markdown);
    }

    public setMarkdown(markdown: Text | null): void {
        this.markdown = markdown;
    }

    public getMarkdown(): Text {
        return this.markdown == null ? new Text() : this.markdown;
    }

    public expr(): string {
        return this.generateExpr(this.getMarkdown().expr());
    }
}