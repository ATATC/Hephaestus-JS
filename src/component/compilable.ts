import {Ref} from "./component.js";

export interface Compilable {
    compile(compiler: (...refs: Ref[]) => void): void;
}