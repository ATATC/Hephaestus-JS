import {Style} from "../style.js";
import {ComponentConfig} from "./component-config.js";

export abstract class Component {
    protected style: Style = new Style();
    protected config: ComponentConfig = new ComponentConfig();

    public constructor() {
    }

    public setConfig(config: ComponentConfig): void {
        this.config = config;
    }

    public getConfig(): ComponentConfig {
        return this.config;
    }

    public setStyle(style: Style): void {
        this.style = style;
    }

    public getStyle(): Style {
        return this.style;
    }

    public abstract expr(): string;
}