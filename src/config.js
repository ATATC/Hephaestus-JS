export class Config {
    static instance = new Config();
    static getInstance() {
        return Config.instance;
    }
    parserMap = new Map();
    attributeMappingMap = new Map();
    constructor() {
    }
    putParser(tagName, parser) {
        this.parserMap.set(tagName, parser);
    }
    getParser(tagName) {
        return this.parserMap.get(tagName);
    }
    putAttributeMapping(prefix, fieldName, attributeName) {
        this.attributeMappingMap.set(prefix + "." + fieldName, attributeName);
    }
    getAttributeName(prefix, fieldName) {
        return this.attributeMappingMap.get(prefix + "." + fieldName);
    }
    getAttributes(prefix) {
        const attributes = [];
        for (let [index, attrName] of this.attributeMappingMap.entries()) {
            const [pre, field] = index.split(".");
            if (pre == prefix)
                attributes.push([field, attrName]);
        }
        return attributes;
    }
}
//# sourceMappingURL=config.js.map