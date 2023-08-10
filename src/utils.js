import { Config } from "./config";
export function forEachDeclaredField(prototype, action) {
    while (prototype != null) {
        for (let args of Config.getAttributes(prototype.constructor.name))
            action(...args);
        prototype = Object.getPrototypeOf(prototype);
    }
}
//# sourceMappingURL=utils.js.map