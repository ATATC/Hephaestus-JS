import {Component, MultiComponent, WrapperComponent} from "./component/component";

export interface Constraint {
    conforms(component: Component): boolean;
}

export class ConstraintChain implements Constraint {
    protected readonly base: Constraint;
    protected nextChain: ConstraintChain | null = null;

    public constructor(base: Constraint = {
        conforms(): boolean {
            return true;
        }
    }) {
        this.base = base;
    }

    public getBase(): Constraint {
        return this.base;
    }

    public setNextChain(nextChain: ConstraintChain | null): void {
        this.nextChain = nextChain;
    }

    public getNextChain(): ConstraintChain | null {
        return this.nextChain;
    }

    public addNext(next: ConstraintChain): void {
        const nextChain = this.getNextChain();
        if (nextChain == null) this.setNextChain(new ConstraintChain(next));
        else nextChain.addNext(next);
    }

    public and(next: ConstraintChain): ConstraintChain {
        this.addNext(next);
        return this;
    }

    public conforms(component: Component): boolean {
        if (!this.getBase().conforms(component)) return false;
        const next = this.getNextChain();
        return next == null || next.conforms(component);
    }
}

export function is(...tagNames: string[]): ConstraintChain {
    return new ConstraintChain({
        conforms(component: Component): boolean {
            for (let tagName of tagNames) if (component.getTagName() === tagName) return true;
            return false;
        }
    });
}

export function isType(...componentClasses: Function[]): ConstraintChain {
    return new ConstraintChain({
        conforms(component: Component): boolean {
            for (let componentClass of componentClasses) if (component instanceof componentClass) return true;
            return false;
        }
    });
}

export function children(): ConstraintChain {
    return new class extends ConstraintChain {
        conforms(component: Component): boolean {
            const nc = this.getNextChain();
            if (nc == null) return true;
            return component instanceof WrapperComponent && nc.conforms(component.getChildren());
        }
    }({
        conforms(component: Component): boolean {
            return component instanceof WrapperComponent;
        }
    });
}

export function forEach(fromDepth: number = 0, toDepth: number = 1): ConstraintChain {
    return new class extends ConstraintChain {
        conforms(component: Component): boolean {
            const nc = this.getNextChain();
            if (nc == null) return true;
            let r = true;
            component.parallelTraversal((child, depth) => {
                if (depth < fromDepth || (toDepth >= 0 && depth >= toDepth)) return;
                if (!nc.conforms(child)) r = false;
            });
            return r;
        }
    }({
        conforms(component: Component): boolean {
            return component instanceof MultiComponent;
        }
    });
}

export function hasMatch(least: number, most: number, satisfaction: ConstraintChain): ConstraintChain {
    return new ConstraintChain({
        conforms(component: Component): boolean {
            if (!(component instanceof MultiComponent)) return false;
            least = least < 0 ? component.size() : least;
            most = most < 0 ? component.size() : most;
            let i = 0;
            forEach().and(satisfaction.and(new ConstraintChain({
                conforms(): boolean {
                    i++;
                    return true;
                }
            }))).conforms(component);
            return i >= least && i <= most;
        }
    })
}

export function has(least: number, most: number, ...tagNames: string[]): ConstraintChain {
    return hasMatch(least, most, is(...tagNames));
}

export function hasType(least: number, most: number, ...componentClasses: Function[]): ConstraintChain {
    return hasMatch(least, most, isType(...componentClasses));
}

export function more(than: number, ...tagNames: string[]): ConstraintChain {
    return has(than + 1, -1, ...tagNames);
}

export function moreType(than: number, ...componentClasses: Function[]): ConstraintChain {
    return hasType(than + 1, -1, ...componentClasses);
}

export function includes(...tagNames: string[]): ConstraintChain {
    return more(0, ...tagNames);
}

export function includesType(...componentClasses: Function[]): ConstraintChain {
    return moreType(0, ...componentClasses);
}

export function all(...tagNames: string[]): ConstraintChain {
    return forEach().and(is(...tagNames));
}

export function allType(...componentClasses: Function[]): ConstraintChain {
    return forEach().and(isType(...componentClasses));
}