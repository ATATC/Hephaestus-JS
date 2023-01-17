export class HephaestusException extends Error {
    public constructor(msg: string = "") {
        super(msg);
    }
}

export class HephaestusRuntimeException extends HephaestusException {}

export class BadFormat extends HephaestusException {
    public constructor(msg: string, loc: string) {
        super(msg + (msg.endsWith(" ") ? "Check here: " : " Check here: ") + (loc.length < 24 ? loc : loc.substring(0, 10) + "..." + loc.substring(loc.length - 10)));
    }
}

export class ComponentNotClosed extends BadFormat {
    public constructor(loc: string) {
        super("Component not closed.", loc);
    }
}

export class MissingFieldException extends HephaestusRuntimeException {
    public constructor(prototype: any, fieldName: string) {
        super("Missing field " + fieldName + " from " + prototype.name + ".");
    }
}