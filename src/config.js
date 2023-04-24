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
        const parser = this.parserMap.get(tagName);
        return parser == undefined ? null : parser;
    }
    putAttributeMapping(prefix, fieldName, attributeName) {
        this.attributeMappingMap.set(prefix + "." + fieldName, attributeName);
    }
    getAttributeName(prefix, fieldName) {
        const attributeName = this.attributeMappingMap.get(prefix + "." + fieldName);
        return attributeName == undefined ? null : attributeName;
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