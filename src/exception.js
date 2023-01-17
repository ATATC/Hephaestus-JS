export class HephaestusException extends Error {
    constructor(msg = "") {
        super(msg);
    }
}
export class HephaestusRuntimeException extends HephaestusException {
}
export class BadFormat extends HephaestusException {
    constructor(msg, loc) {
        super(msg + (msg.endsWith(" ") ? "Check here: " : " Check here: ") + (loc.length < 24 ? loc : loc.substring(0, 10) + "..." + loc.substring(loc.length - 10)));
    }
}
export class ComponentNotClosed extends BadFormat {
    constructor(loc) {
        super("Component not closed.", loc);
    }
}
export class MissingFieldException extends HephaestusRuntimeException {
    constructor(constructor, fieldName) {
        super("Missing field " + fieldName + " in " + constructor.prototype + ".");
    }
}
//# sourceMappingURL=exception.js.map