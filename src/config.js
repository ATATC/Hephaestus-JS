export class Config {
    static instance = new Config();
    static getInstance() {
        return Config.instance;
    }
    parserMap = new Map();
    attributeMappingMap = new Map();
    constructor() {
    }
    getInstance() {
        return this;
    }
    listTagNames() {
        return Array.from(this.parserMap.keys());
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
        this.attributeMappingMap.forEach((attrName, index) => {
            const [pre, field] = index.split(".");
            if (pre == prefix)
                attributes.push([field, attrName]);
        });
        return attributes;
    }
}
//# sourceMappingURL=config.js.map