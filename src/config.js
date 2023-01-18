// FixMe: A major bug: this class is not initialized yet when the Attribute decorators are being called, causing null pointer exceptions.
class _Config {
    parserMap = new Map();
    attributeMappingMap = new Map();
    constructor() {
    }
    getInstance() {
        return this;
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
export const Config = new _Config();
//# sourceMappingURL=config.js.map