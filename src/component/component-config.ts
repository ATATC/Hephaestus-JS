import Component from "./component";

export class ComponentConfig {
    public name: string;

    constructor(name: string = "undefined") {
        this.name = name;
    }
}

export function componentConfig(name: string = "undefined") {
    return function (target: Component, propertyKey: string, descriptor: PropertyDescriptor) {
        target.setConfig(new ComponentConfig(name));
    }
}