export class Config {
    static parserMap = new Map();
    static attributeMappingMap = new Map();
    constructor() {
    }
    static listTagNames() {
        return Array.from(this.parserMap.keys());
    }
    static putParser(tagName, parser) {
        this.parserMap.set(tagName, parser);
    }
    static getParser(tagName) {
        const parser = this.parserMap.get(tagName);
        return parser === undefined ? null : parser;
    }
    static putAttributeMapping(prefix, fieldName, attributeName, targetConstructor) {
        this.attributeMappingMap.set(prefix + "." + fieldName, [attributeName, targetConstructor]);
    }
    static getAttributeName(prefix, fieldName) {
        const attributeInfo = this.attributeMappingMap.get(prefix + "." + fieldName);
        return attributeInfo === undefined ? null : attributeInfo;
    }
    static getAttributes(prefix) {
        const attributes = [];
        this.attributeMappingMap.forEach(([attrName, targetConstructor], index) => {
            const [pre, field] = index.split(".");
            if (pre === prefix)
                attributes.push([field, attrName, targetConstructor]);
        });
        return attributes;
    }
}
//# sourceMappingURL=config.js.map