import {Ref} from "./component";

export interface Compilable {
    compile(compiler: (...refs: Ref[]) => void): void;
}

export function implementationOfCompilable(object: any): object is Compilable {
    return "compile" in object;
}
