import {HephaestusRuntimeException, MissingFieldException} from "../exception.js";
import {parseExpr} from "../hephaestus.js";
import {Attribute, extractAttributes} from "../attribute.js";
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
    protected proxy: Ref | null = null;
    @Attribute()
    protected id: string | null = null;

    protected constructor() {
    }

    public getConfig(): ComponentConfigRecord | null {
        return Object.getPrototypeOf(this).config;
    }

    public getTagName(): string {
        const config = this.getConfig();
        return config == null ? "undefined" : config.tagName();
    }

    public isProxy(): boolean {
        return this.proxy != null;
    }

    public setProxy(proxy: Ref | null) {
        this.proxy = proxy;
    }

    public getProxy(): Ref | null {
        return this.proxy;
    }

    public setId(id: string | null): void {
        this.id = id;
    }

    public getId(): string | null {
        return this.id;
    }

    public forEach(action: (component: Component, depth: number) => void, depth: number = 0): void {
        action(this, depth);
    }

    public parallelTraversal(action: (component: Component, depth: number) => void, depth: number = 0): void {
        action(this, depth);
    }

    protected generateExpr(inner: string): string {
        return this.proxy == null ? "{" + this.getTagName() + ":" + extractAttributes(this) + inner + "}" : this.proxy.expr();
    }

    public abstract expr(): string;

    public toString(): string {
        return this.expr();
    };

    public equals(o: any): boolean {
        if (o instanceof Component) return this.expr() === o.expr();
        return false;
    }
}

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
        const e = s.charAt(i) === c;
        if (i > 0) return e && s.charAt(i - 1) !== Text.COMPILER_CHARACTER;
        if (c === Text.COMPILER_CHARACTER && s.length > 1) return e && s.charAt(1) !== Text.COMPILER_CHARACTER;
        return e;
    }

    public static charAtEqualsAny(s: string, i: number, ...cs: string[]): boolean {
        const bit = s.charAt(i);
        for (let c of cs) {
            if (bit !== c) continue;
            if (i > 0) return s.charAt(i - 1) !== Text.COMPILER_CHARACTER;
            if (c === Text.COMPILER_CHARACTER && s.length > 1) return s.charAt(1) !== Text.COMPILER_CHARACTER;
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

    public static matchBrackets(s: string, open: string, close: string | null = null, requiredDepth: number = 0): [number, number] {
        let depth = 0;
        let startIndex = -1;
        for (let i = 0; i < s.length; i++) {
            if (Text.charAtEquals(s, i, open) && depth++ === requiredDepth) startIndex = i;
            else if (Text.charAtEquals(s, i, close == null ? open : close) && --depth === requiredDepth) return [startIndex, i];
        }
        return [startIndex, -1];
    }

    public static pairBracket(b: string): string {
        switch (b) {
            case '(':
                return ')';
            case '[':
                return ']';
            case '{':
                return '}';
            case '<':
                return '>';
            case ')':
                return '(';
            case ']':
                return '[';
            case '}':
                return '{';
            case '>':
                return '<';
            default:
                throw new HephaestusRuntimeException("Not a bracket: " + b + ".");
        }
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
        return this.to == null ? this.generateExpr("") : this.to.expr();
    }
}

export class MultiComponent extends Component implements Iterable<Component> {
    public static PARSER: (expr: string) => MultiComponent = expr => {
        let open = expr.charAt(0);
        let [start, end] = Text.matchBrackets(expr, open, Text.pairBracket(open));
        const components = [];
        while (start >= 0 && end++ >= 0) {
            const component = parseExpr(expr.substring(start, end));
            if (component == null) continue;
            components.push(component);
            expr = expr.substring(end);
            if (expr.length === 0) break;
            [start, end] = Text.matchBrackets(expr, open = expr.charAt(0), Text.pairBracket(open));
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
        return this.components.length === 0;
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
            const bodyComponent = parseExpr(expr);
            if (bodyComponent != null) component.setChildren(bodyComponent instanceof  MultiComponent ? bodyComponent : new MultiComponent(bodyComponent));
            else component.setChildren(new MultiComponent());
            return component;
        };
    }
}

export class Skeleton extends WrapperComponent implements Compilable {
    public static PARSER: (expr: string) => Skeleton = WrapperComponent.makeParser(Skeleton);

    protected name: string = "unnamed";

    @Attribute(undefined, parseExpr)
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

@ComponentConfig("v")
export class Version extends WrapperComponent {
    public static PARSER: (expr: string) => Version = WrapperComponent.makeParser(Version);

    @Attribute()
    protected serial: string = "undefined";

    public constructor(serial: string) {
        super();
        this.setSerial(serial);
    }

    public setSerial(serial: string): void {
        this.serial = serial;
    }

    public getSerial(): string {
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