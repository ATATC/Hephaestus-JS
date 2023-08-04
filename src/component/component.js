var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Text_1, Ref_1, MultiComponent_1, Version_1, HTMLBlock_1, MDBlock_1;
import { HephaestusRuntimeException, MissingFieldException } from "../exception";
import { parseExpr } from "../hephaestus";
import { Attribute, extractAttributes } from "../attribute";
import { Config } from "../config";
class ComponentConfigRecord {
    _tagName;
    constructor(tagName = "undefined") {
        this._tagName = tagName;
    }
    tagName() {
        return this._tagName;
    }
}
export function ComponentConfig(tagName) {
    return function (constructor) {
        constructor.prototype.config = new ComponentConfigRecord(tagName);
        if (!Reflect.has(constructor, "PARSER"))
            throw new MissingFieldException(constructor, "PARSER");
        Config.getInstance().putParser(tagName, Reflect.get(constructor, "PARSER"));
    };
}
export class Component {
    proxy = null;
    id = null;
    constructor() {
    }
    getConfig() {
        return Object.getPrototypeOf(this).config;
    }
    getTagName() {
        const config = this.getConfig();
        return config == null ? "undefined" : config.tagName();
    }
    isProxy() {
        return this.proxy != null;
    }
    setProxy(proxy) {
        this.proxy = proxy;
    }
    getProxy() {
        return this.proxy;
    }
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    forEach(action, depth = 0) {
        action(this, depth);
    }
    parallelTraversal(action, depth = 0) {
        action(this, depth);
    }
    generateExpr(inner) {
        return this.proxy == null ? "{" + this.getTagName() + ":" + extractAttributes(this) + inner + "}" : this.proxy.expr();
    }
    toString() {
        return this.expr();
    }
    ;
    equals(o) {
        if (o instanceof Component)
            return this.expr() === o.expr();
        return false;
    }
}
__decorate([
    Attribute(),
    __metadata("design:type", Object)
], Component.prototype, "id", void 0);
export class UnsupportedComponent extends Component {
    tagName = "undefined";
    fullExpr = "";
    inner = "";
    constructor() {
        super();
    }
    expr() {
        return this.fullExpr;
    }
}
export let Text = class Text extends Component {
    static { Text_1 = this; }
    static PARSER = {
        parse(expr) {
            return new Text_1(Text_1.decompile(expr));
        }
    };
    text = "";
    constructor(text = null) {
        super();
        if (text != null)
            this.setText(text);
    }
    setText(text) {
        this.text = text;
    }
    getText() {
        return this.text;
    }
    expr() {
        return "{" + Text_1.compile(this.getText()) + "}";
    }
    static COMPILER_CHARACTER = '^';
    static RESERVED_KEYWORDS = [
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
    static quote(c) {
        return Text_1.COMPILER_CHARACTER + c;
    }
    static compile(s, c = null) {
        if (c != null)
            return s.replaceAll(c, Text_1.quote(c));
        for (let k of Text_1.RESERVED_KEYWORDS)
            s = Text_1.compile(s, k);
        return s;
    }
    static decompile(s, c = null) {
        if (c != null)
            return s.replaceAll(Text_1.quote(c), c);
        for (let k of Text_1.RESERVED_KEYWORDS)
            s = Text_1.decompile(s, k);
        return s;
    }
    static indexOf(s, c, fromIndex = 0) {
        for (let i = fromIndex; i < s.length; i++)
            if (Text_1.charAtEquals(s, i, c))
                return i;
        return -1;
    }
    static lastIndexOf(s, c, fromIndex = s.length - 1) {
        for (let i = fromIndex; i > 0; i--)
            if (Text_1.charAtEquals(s, i, c))
                return i;
        return -1;
    }
    static charAtEquals(s, i, c) {
        const e = s.charAt(i) === c;
        if (i > 0)
            return e && s.charAt(i - 1) !== Text_1.COMPILER_CHARACTER;
        if (c === Text_1.COMPILER_CHARACTER && s.length > 1)
            return e && s.charAt(1) !== Text_1.COMPILER_CHARACTER;
        return e;
    }
    static charAtEqualsAny(s, i, ...cs) {
        const bit = s.charAt(i);
        for (let c of cs) {
            if (bit !== c)
                continue;
            if (i > 0)
                return s.charAt(i - 1) !== Text_1.COMPILER_CHARACTER;
            if (c === Text_1.COMPILER_CHARACTER && s.length > 1)
                return s.charAt(1) !== Text_1.COMPILER_CHARACTER;
            return true;
        }
        return false;
    }
    static startsWith(s, c) {
        return Text_1.charAtEquals(s, 0, c);
    }
    static endsWith(s, c) {
        return Text_1.charAtEquals(s, s.length - 1, c);
    }
    static wrappedBy(s, start, end = start) {
        return Text_1.startsWith(s, start) && Text_1.endsWith(s, end);
    }
    static matchBrackets(s, open, close = null, requiredDepth = 0) {
        let depth = 0;
        let startIndex = -1;
        for (let i = 0; i < s.length; i++) {
            if (Text_1.charAtEquals(s, i, open) && depth++ === requiredDepth)
                startIndex = i;
            else if (Text_1.charAtEquals(s, i, close == null ? open : close) && --depth === requiredDepth)
                return [startIndex, i];
        }
        return [startIndex, -1];
    }
    static pairBracket(b) {
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
};
Text = Text_1 = __decorate([
    ComponentConfig("t"),
    __metadata("design:paramtypes", [Object])
], Text);
export let Ref = class Ref extends Component {
    static { Ref_1 = this; }
    static PARSER = {
        parse(expr) {
            return new Ref_1(expr);
        }
    };
    to = null;
    constructor(id) {
        super();
        this.setId(id);
    }
    referTo(real) {
        this.to = real;
    }
    expr() {
        return this.to == null ? this.generateExpr("") : this.to.expr();
    }
};
Ref = Ref_1 = __decorate([
    ComponentConfig("ref"),
    __metadata("design:paramtypes", [Object])
], Ref);
export let MultiComponent = class MultiComponent extends Component {
    static { MultiComponent_1 = this; }
    static PARSER = {
        parse(expr) {
            let open = expr.charAt(0);
            let [start, end] = Text.matchBrackets(expr, open, Text.pairBracket(open));
            const components = [];
            while (start >= 0 && end++ >= 0) {
                const component = parseExpr(expr.substring(start, end));
                if (component == null)
                    continue;
                components.push(component);
                expr = expr.substring(end);
                if (expr.length === 0)
                    break;
                [start, end] = Text.matchBrackets(expr, open = expr.charAt(0), Text.pairBracket(open));
            }
            return new MultiComponent_1(...components);
        }
    };
    components = [];
    constructor(...components) {
        super();
        this.setComponents(...components);
    }
    setComponents(...components) {
        this.components = components;
    }
    forEach(action, depth = 0) {
        for (let component of this.components)
            component.forEach(action, depth);
    }
    parallelTraversal(action, depth = 0, components = this.components) {
        const next = [];
        for (let component of components) {
            if (component instanceof WrapperComponent)
                next.push(...component.getChildren().components);
            action(component, depth);
        }
        if (next.length > 0)
            this.parallelTraversal(action, depth + 1, next);
    }
    expr() {
        if (this.components.length < 2) {
            const component = this.components.at(0);
            return component == null ? "" : component.expr();
        }
        let expr = "[";
        this.components.forEach(component => expr += component.expr());
        return expr + "]";
    }
    size() {
        return this.components.length;
    }
    isEmpty() {
        return this.components.length === 0;
    }
    contains(component) {
        return this.components.includes(component);
    }
    [Symbol.iterator]() {
        return this.components[Symbol.iterator]();
    }
    add(component) {
        this.components.push(component);
    }
    remove(index) {
        this.components.splice(index, 1);
    }
    containsAll(c) {
        for (let component of c)
            if (!this.components.includes(component))
                return false;
        return true;
    }
    addAll(c) {
        this.components.push(...c);
    }
    clear() {
        this.components = [];
    }
    get(index) {
        return this.components[index];
    }
    /**
     * Not original.
     * @param callbackfn callback function
     */
    map(callbackfn) {
        const arr = [];
        for (let i in this.components)
            arr.push(callbackfn(this.components[i], Number(i), this));
        return arr;
    }
};
MultiComponent = MultiComponent_1 = __decorate([
    ComponentConfig("mc"),
    __metadata("design:paramtypes", [Component])
], MultiComponent);
export class WrapperComponent extends Component {
    children = new MultiComponent();
    constructor(children = new MultiComponent()) {
        super();
        this.setChildren(children);
    }
    setChildren(children) {
        this.children = children;
    }
    getChildren() {
        return this.children;
    }
    appendChild(child) {
        this.children.add(child);
    }
    child(index) {
        return this.getChildren().get(index);
    }
    removeChild(index) {
        this.children.remove(index);
    }
    forEach(action, depth = 0) {
        super.forEach(action, depth);
        this.getChildren().forEach(action, depth + 1);
    }
    parallelTraversal(action, depth = 0) {
        super.parallelTraversal(action, depth);
        this.getChildren().parallelTraversal(action, depth + 1);
    }
    expr() {
        return this.generateExpr(this.getChildren().expr());
    }
    static makeParser(constructor) {
        return {
            parse(expr) {
                const component = Object.create(constructor.prototype);
                const bodyComponent = parseExpr(expr);
                if (bodyComponent != null)
                    component.setChildren(bodyComponent instanceof MultiComponent ? bodyComponent : new MultiComponent(bodyComponent));
                else
                    component.setChildren(new MultiComponent());
                return component;
            }
        };
    }
}
// FixMe: This annotation can cause error in `WrapperComponent.makeParser()`.
// @ComponentConfig("sk")
export class Skeleton extends WrapperComponent {
    static PARSER = WrapperComponent.makeParser(Skeleton);
    name = "unnamed";
    component = null;
    parent = null;
    constructor(name = null) {
        super();
        if (name != null)
            this.setName(name);
    }
    setName(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
    setComponent(component) {
        this.component = component;
    }
    getComponent() {
        return this.component;
    }
    setParent(parent) {
        if (parent == null || parent.getChildren().contains(this))
            this.parent = parent;
        else
            parent.appendChild(this);
    }
    getParent() {
        return this.parent;
    }
    appendChild(child) {
        if (child instanceof Skeleton) {
            super.appendChild(child);
            child.setParent(this);
        }
        else
            throw new Error("UnsupportedOperationException");
    }
    expr() {
        const expr = "<" + Text.compile(this.getName()) + ":" + extractAttributes(this) + this.getChildren().expr();
        return (expr.endsWith(":") ? expr.substring(0, expr.length - 1) : expr) + ">";
    }
    compile(compiler) {
        if (this.getComponent() instanceof Ref)
            compiler(this.getComponent());
    }
}
__decorate([
    Attribute(undefined, parseExpr),
    __metadata("design:type", Object)
], Skeleton.prototype, "component", void 0);
export let Version = class Version extends WrapperComponent {
    static { Version_1 = this; }
    static PARSER = WrapperComponent.makeParser(Version_1);
    serial = "undefined";
    constructor(serial) {
        super();
        this.setSerial(serial);
    }
    setSerial(serial) {
        this.serial = serial;
    }
    getSerial() {
        return this.serial;
    }
};
__decorate([
    Attribute(),
    __metadata("design:type", String)
], Version.prototype, "serial", void 0);
Version = Version_1 = __decorate([
    ComponentConfig("v"),
    __metadata("design:paramtypes", [String])
], Version);
export let HTMLBlock = class HTMLBlock extends Component {
    static { HTMLBlock_1 = this; }
    static PARSER = {
        parse(expr) {
            return new HTMLBlock_1(parseExpr(expr));
        }
    };
    html = null;
    constructor(html = null) {
        super();
        this.setHTML(html);
    }
    setHTML(html) {
        this.html = html;
    }
    getHTML() {
        return this.html == null ? new Text() : this.html;
    }
    expr() {
        return this.generateExpr(this.getHTML().expr());
    }
};
HTMLBlock = HTMLBlock_1 = __decorate([
    ComponentConfig("html"),
    __metadata("design:paramtypes", [Object])
], HTMLBlock);
export let MDBlock = class MDBlock extends Component {
    static { MDBlock_1 = this; }
    static PARSER = {
        parse(expr) {
            return new MDBlock_1(parseExpr(expr));
        }
    };
    markdown = null;
    constructor(markdown = null) {
        super();
        this.setMarkdown(markdown);
    }
    setMarkdown(markdown) {
        this.markdown = markdown;
    }
    getMarkdown() {
        return this.markdown == null ? new Text() : this.markdown;
    }
    expr() {
        return this.generateExpr(this.getMarkdown().expr());
    }
};
MDBlock = MDBlock_1 = __decorate([
    ComponentConfig("md"),
    __metadata("design:paramtypes", [Object])
], MDBlock);
//# sourceMappingURL=component.js.map