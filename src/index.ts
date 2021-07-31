import sliceAnsi from "slice-ansi";
import stringLength from "string-length";
import terminalSize from "term-size";
import wrapAnsi from "wrap-ansi";

import { clearScreenDown, cursorTo, moveCursor, write } from "./stdout-promisified";

type Alignment = "left" | "right" | "center" | "justify";

export interface ColumnOptions {
    width?: number;
    wrap?: boolean;
    align?: Alignment;
    format?: (content: string) => string;
    style?: (content: string) => string;
}

export class Boudewijn<
    ColumnType extends ColumnOptions,
    ColumnDefs extends ColumnType[]
> {
    constructor(private columns: ColumnDefs, private separator: string = " ") {}

    previous: number | undefined;

    async log(...parts: string[]): Promise<void> {
        const widths = this.columnSizes(this.columns, terminalSize().columns);
        const texts: string[][] = [];
        for (let i = 0; i < Math.min(parts.length, this.columns.length); i++) {
            const column = this.columns[i];
            const part = this.formatText(parts[i], column);
            if (column.wrap) {
                texts.push(
                    wrapAnsi(part, widths[i], { hard: true }).split("\n")
                );
            } else {
                texts.push([sliceAnsi(part, 0, widths[i])]);
            }
        }

        let lines = texts.reduce((acc, cur) => Math.max(cur.length, acc), 0);
        this.previous = lines;
        let res = "";
        for (let line = 0; line < lines; line++) {
            for (let col = 0; col < texts.length; col++) {
                const column = this.columns[col];
                const width = widths[col];
                const text = texts[col][line];
                if (text) {
                    res += this.styleText(
                        this.alignText(text, column, width),
                        column
                    );
                } else {
                    res += " ".repeat(width);
                }
                if (col < texts.length - 1) {
                    res += this.separator;
                }
            }
            res += "\n";
        }
        await write(res);
    }

    async update(...parts: string[]) {
        // clear previous lines from the screen
        if (this.previous) {
            await cursorTo(0);
            await moveCursor(0, -this.previous);
            await clearScreenDown();
        }
        await this.log(...parts);
    }

    columnSizes(columns: ColumnDefs, width: number): number[] {
        width -= (columns.length - 1) * stringLength(this.separator);
        const fixedColumns = columns.filter((c) => !this.isFlexColumn(c));
        const flexCount = columns.filter(this.isFlexColumn).length;
        const fixedWidth = fixedColumns.reduce(
            (acc, cur) => acc + cur.width!,
            0
        );
        const flexWidth = (Math.max(width - fixedWidth, 0) / flexCount) | 0;
        return columns.map((c) =>
            this.isFlexColumn(c) ? flexWidth : c.width!
        );
    }

    alignText(text: string, column: ColumnType, width: number) {
        const length = stringLength(text);
        const pad = width - length;
        if (pad <= 0) return text;
        switch (column.align) {
            case "right":
                return " ".repeat(pad) + text;
            case "center":
            case "justify":
                const left = Math.ceil(pad / 2);
                const right = pad - left;
                return " ".repeat(left) + text + " ".repeat(right);
            default:
                return text + " ".repeat(pad);
        }
    }

    formatText(text: string, column: ColumnType) {
        return column.format ? column.format(text) : text;
    }

    styleText(text: string, column: ColumnType) {
        return column.style ? column.style(text) : text;
    }

    private isFlexColumn(column: ColumnType): boolean {
        return typeof column.width !== "number" || column.width < 1;
    }
}
