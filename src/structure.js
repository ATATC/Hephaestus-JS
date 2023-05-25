import { MultiComponent, WrapperComponent } from "./component/component";
export class ConstraintChain {
    base;
    nextChain = null;
    constructor(base = {
        conforms() {
            return true;
        }
    }) {
        this.base = base;
    }
    getBase() {
        return this.base;
    }
    setNextChain(nextChain) {
        this.nextChain = nextChain;
    }
    getNextChain() {
        return this.nextChain;
    }
    addNext(next) {
        const nextChain = this.getNextChain();
        if (nextChain == null)
            this.setNextChain(new ConstraintChain(next));
        else
            nextChain.addNext(next);
    }
    and(next) {
        this.addNext(next);
        return this;
    }
    conforms(component) {
        if (!this.getBase().conforms(component))
            return false;
        const next = this.getNextChain();
        return next == null || next.conforms(component);
    }
}
export function is(...tagNames) {
    return new ConstraintChain({
        conforms(component) {
            for (let tagName of tagNames)
                if (component.getTagName() === tagName)
                    return true;
            return false;
        }
    });
}
export function isType(...componentClasses) {
    return new ConstraintChain({
        conforms(component) {
            for (let componentClass of componentClasses)
                if (component instanceof componentClass)
                    return true;
            return false;
        }
    });
}
export function children() {
    return new class extends ConstraintChain {
        conforms(component) {
            const nc = this.getNextChain();
            if (nc == null)
                return true;
            return component instanceof WrapperComponent && nc.conforms(component.getChildren());
        }
    }({
        conforms(component) {
            return component instanceof WrapperComponent;
        }
    });
}
export function forEach(fromDepth = 0, toDepth = 1) {
    return new class extends ConstraintChain {
        conforms(component) {
            const nc = this.getNextChain();
            if (nc == null)
                return true;
            let r = true;
            component.parallelTraversal((child, depth) => {
                if (depth < fromDepth || (toDepth >= 0 && depth >= toDepth))
                    return;
                if (!nc.conforms(child))
                    r = false;
            });
            return r;
        }
    }({
        conforms(component) {
            return component instanceof MultiComponent;
        }
    });
}
export function hasMatch(least, most, satisfaction) {
    return new ConstraintChain({
        conforms(component) {
            if (!(component instanceof MultiComponent))
                return false;
            least = least < 0 ? component.size() : least;
            most = most < 0 ? component.size() : most;
            let i = 0;
            forEach().and(satisfaction.and(new ConstraintChain({
                conforms() {
                    i++;
                    return true;
                }
            }))).conforms(component);
            return i >= least && i <= most;
        }
    });
}
export function has(least, most, ...tagNames) {
    return hasMatch(least, most, is(...tagNames));
}
export function hasType(least, most, ...componentClasses) {
    return hasMatch(least, most, isType(...componentClasses));
}
export function more(than, ...tagNames) {
    return has(than + 1, -1, ...tagNames);
}
export function moreType(than, ...componentClasses) {
    return hasType(than + 1, -1, ...componentClasses);
}
export function includes(...tagNames) {
    return more(0, ...tagNames);
}
export function includesType(...componentClasses) {
    return moreType(0, ...componentClasses);
}
export function all(...tagNames) {
    return forEach().and(is(...tagNames));
}
export function allType(...componentClasses) {
    return forEach().and(isType(...componentClasses));
}
//# sourceMappingURL=structure.js.map