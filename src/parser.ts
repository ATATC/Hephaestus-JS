import {Component} from "./component/component.js";

export interface Parser<C extends Component> {
    parse(expr: string): C;
}