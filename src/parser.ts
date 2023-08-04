import {Component} from "./component/component";

export interface Parser<C extends Component> {
    parse(expr: string): C | null;
}