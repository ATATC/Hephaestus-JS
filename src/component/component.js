var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Ref_1, Version_1, HTMLBlock_1, MDBlock_1;
import { Style } from "../style.js";
import { BadFormat, MissingFieldException } from "../exception.js";
import { parseExpr } from "../hephaestus.js";
import { Attribute, extractAttributes, injectAttributes, searchAttributesInExpr } from "../attribute.js";
import { Config } from "../config.js";
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
    id = null;
    style = new Style();
    constructor() {
    }
    getConfig() {
        return Object.getPrototypeOf(this).config;
    }
    getTagName() {
        const config = this.getConfig();
        return config == null ? "undefined" : config.tagName();
    }
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    setStyle(style) {
        this.style = style;
    }
    getStyle() {
        return this.style;
    }
    forEach(action, depth = 0) {
        action(this, depth);
    }
    parallelTraversal(action, depth = 0) {
        action(this, depth);
    }
    generateExpr(inner) {
        return "{" + this.getTagName() + ":" + extractAttributes(this) + inner + "}";
    }
}
__decorate([
    Attribute(),
    __metadata("design:type", Object)
], Component.prototype, "id", void 0);
Component.prototype.toString = function () {
    return this.expr();
};
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
export class Text extends Component {
    static PARSER = expr => new Text(Text.decompile(expr));
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
        return "{" + Text.compile(this.getText()) + "}";
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
        return Text.COMPILER_CHARACTER + c;
    }
    static compile(s, c = null) {
        if (c != null)
            return s.replaceAll(c, Text.quote(c));
        for (let k of Text.RESERVED_KEYWORDS)
            s = Text.compile(s, k);
        return s;
    }
    static decompile(s, c = null) {
        if (c != null)
            return s.replaceAll(Text.quote(c), c);
        for (let k of Text.RESERVED_KEYWORDS)
            s = Text.decompile(s, k);
        return s;
    }
    static indexOf(s, c, fromIndex = 0) {
        for (let i = fromIndex; i < s.length; i++)
            if (Text.charAtEquals(s, i, c))
                return i;
        return -1;
    }
    static lastIndexOf(s, c, fromIndex = s.length - 1) {
        for (let i = fromIndex; i > 0; i--)
            if (Text.charAtEquals(s, i, c))
                return i;
        return -1;
    }
    static charAtEquals(s, i, c) {
        const e = s.charAt(i) === c;
        if (i > 0)
            return e && s.charAt(i - 1) !== Text.COMPILER_CHARACTER;
        if (c === Text.COMPILER_CHARACTER && s.length > 1)
            return e && s.charAt(1) !== Text.COMPILER_CHARACTER;
        return e;
    }
    static charAtEqualsAny(s, i, ...cs) {
        const bit = s.charAt(i);
        for (let c of cs) {
            if (bit !== c)
                continue;
            if (i > 0)
                return s.charAt(i - 1) !== Text.COMPILER_CHARACTER;
            if (c === Text.COMPILER_CHARACTER && s.length > 1)
                return s.charAt(1) !== Text.COMPILER_CHARACTER;
            return true;
        }
        return false;
    }
    static startsWith(s, c) {
        return Text.charAtEquals(s, 0, c);
    }
    static endsWith(s, c) {
        return Text.charAtEquals(s, s.length - 1, c);
    }
    static wrappedBy(s, start, end = start) {
        return Text.startsWith(s, start) && Text.endsWith(s, end);
    }
    static pairBrackets(s, open, close, requiredDepth = 0) {
        let depth = 0;
        let startIndex = -1;
        for (let i = 0; i < s.length; i++) {
            if (Text.charAtEquals(s, i, open) && depth++ === requiredDepth)
                startIndex = i;
            else if (Text.charAtEquals(s, i, close) && --depth === requiredDepth)
                return [startIndex, i];
        }
        return [startIndex, -1];
    }
}
let Ref = Ref_1 = class Ref extends Component {
    static PARSER = expr => new Ref_1(expr);
    to = null;
    constructor(id) {
        super();
        this.setId(id);
    }
    referTo(real) {
        this.to = real;
    }
    expr() {
        if (this.to != null)
            return this.to.expr();
        const id = this.getId();
        return this.generateExpr(id == null ? "" : id);
    }
};
Ref = Ref_1 = __decorate([
    ComponentConfig("ref"),
    __metadata("design:paramtypes", [Object])
], Ref);
export { Ref };
export class MultiComponent extends Component {
    static PARSER = expr => {
        let open, close;
        if (Text.wrappedBy(expr, "{", "}")) {
            open = "{";
            close = "}";
        }
        else if (Text.wrappedBy(expr, "<", ">")) {
            open = "<";
            close = ">";
        }
        else
            throw new BadFormat("Unrecognized format.", expr);
        let [start, end] = Text.pairBrackets(expr, open, close);
        const components = [];
        while (start >= 0 && end++ >= 0) {
            const component = parseExpr(expr.substring(start, end));
            if (component == null)
                continue;
            components.push(component);
            expr = expr.substring(end);
            [start, end] = Text.pairBrackets(expr, open, close);
        }
        return new MultiComponent(...components);
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
}
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
        return expr => {
            const component = Object.create(constructor.prototype);
            const attributesAndBody = searchAttributesInExpr(expr);
            let attributesExpr, bodyExpr;
            if (attributesAndBody == null)
                bodyExpr = expr;
            else {
                [attributesExpr, bodyExpr] = attributesAndBody;
                injectAttributes(component, attributesExpr);
            }
            const bodyComponent = parseExpr(bodyExpr);
            if (bodyComponent != null)
                component.setChildren(bodyComponent instanceof MultiComponent ? bodyComponent : new MultiComponent(bodyComponent));
            else
                component.setChildren(new MultiComponent());
            return component;
        };
    }
}
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
    Attribute(),
    __metadata("design:type", Object)
], Skeleton.prototype, "component", void 0);
class Serial {
    args;
    constructor(...args) {
        this.args = args;
    }
    equals(o, sequential) {
        if (sequential == null) {
            if (this === o)
                return true;
            if (o instanceof Serial)
                return this.equals(o, true);
            return false;
        }
        if (this.args.length !== o.args.length)
            return false;
        for (let i = 0; i < this.args.length; i++) {
            if (sequential) {
                if (this.args[i] !== o.args[i])
                    return false;
            }
            else if (!o.args.includes(this.args[i]))
                return false;
        }
        return true;
    }
}
let Version = Version_1 = class Version extends WrapperComponent {
    Serial = Serial;
    static PARSER = WrapperComponent.makeParser(Version_1);
    serial = new Serial("undefined");
    constructor(serial) {
        super();
        this.setSerial(serial instanceof Serial ? serial : new Serial(serial));
    }
    setSerial(serial) {
        this.serial = serial;
    }
    getSerial() {
        return this.serial;
    }
};
Version = Version_1 = __decorate([
    ComponentConfig("v"),
    __metadata("design:paramtypes", [Object])
], Version);
export { Version };
let HTMLBlock = HTMLBlock_1 = class HTMLBlock extends Component {
    static PARSER = expr => new HTMLBlock_1(parseExpr(expr));
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
export { HTMLBlock };
let MDBlock = MDBlock_1 = class MDBlock extends Component {
    static PARSER = expr => new MDBlock_1(parseExpr(expr));
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
export { MDBlock };
//# sourceMappingURL=component.js.map