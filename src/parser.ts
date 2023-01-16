import {Component} from "./component.js";

export interface Parser<C extends Component> {
    parse(expr: string): C;
}