import {Config} from "./config";

export function forEachDeclaredField(prototype: Function, action: (field: string, attributeName: string, targetConstructor: (v: string) => any) => void): void {
    while (prototype != null) {
        for (let args of Config.getInstance().getAttributes(prototype.constructor.name)) action(...args);
        prototype = Object.getPrototypeOf(prototype);
    }
}