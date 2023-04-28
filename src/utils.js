import { Config } from "./config.js";
export function forEachDeclaredField(prototype, action) {
    while (prototype != null) {
        for (let args of Config.getInstance().getAttributes(prototype.constructor.name))
            action(...args);
        prototype = Object.getPrototypeOf(prototype);
    }
}
//# sourceMappingURL=utils.js.map