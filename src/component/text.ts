import Component from "./component";

class Text extends Component {
    protected text: string;

    constructor(text: string) {
        super();
        this.setText(text);
    }

    public setText(text: string): void {
        this.text = text;
    }

    public getText(): string {
        return this.text;
    }

    public expr(): string {
        return "{" + Text.compile(this.getText()) + "}";
    }

    public static COMPILER_CHARACTER: string = '^';

    public static RESERVED_KEYWORDS: string[] = [
        '^',
        ':',
        '{',
        '}',
        '[',
        ']',
        '(',
        ')',
        '<',
        '>',
        '=',
        ';',
    ];

    public static quote(c: string): string {
        return Text.COMPILER_CHARACTER + c;
    }

    public static compile(s: string, c: string = null): string {
        if (s == null) return null;
        if (c == null) for (let i in Text.RESERVED_KEYWORDS) s = Text.compile(s, Text.RESERVED_KEYWORDS[i]);
        return s.replace(c, Text.quote(c));
    }

    public static decompile(s: string, c: string = null): string {
        if (s == null) return null;
        if (c == null) for (let i in Text.RESERVED_KEYWORDS) s = Text.decompile(s, Text.RESERVED_KEYWORDS[i]);
        return s.replace(Text.quote(s), c);
    }

    public static indexOf(s: string, c: string, fromIndex: number = 0): number {
        for (let i = fromIndex; i < s.length; i++) if (Text.charAtEquals(s, i, c)) return i;
        return -1;
    }

    public static lastIndexOf(s: string, c: string, fromIndex: number = s.length - 1): number {
        for (let i = fromIndex; i > 0; i--) if (Text.charAtEquals(s, i, c)) return i;
        return -1;
    }

    public static charAtEquals(s: string, i: number, c: string): boolean {
        const e = s.charAt(i) == c;
        if (i > 0) return e && s.charAt(i - 1) != Text.COMPILER_CHARACTER;
        if (c == Text.COMPILER_CHARACTER && s.length > 1) return e && s.charAt(1) != Text.COMPILER_CHARACTER;
        return e;
    }

    public static startsWith(s: string, c: string): boolean {
        return Text.charAtEquals(s, 0, c);
    }

    public static endsWith(s: string, c: string): boolean {
        return Text.charAtEquals(s, s.length - 1, c);
    }

    public static wrappedBy(s: string, start: string, end: string = start): boolean {
        return Text.startsWith(s, start) && Text.endsWith(s, end);
    }

    public static pairBrackets(s: string, open: string, close: string, requiredDepth: number = 0) {
        let depth = 0;
        let startIndex = -1;
        for (let i = 0; i < s.length; i++) {
            const bit = s.charAt(i);
            if (bit == open && depth++ == requiredDepth) startIndex = i;
            else if (bit == close && --depth == requiredDepth) return [startIndex, i];
        }
        return [startIndex, -1];
    }
}