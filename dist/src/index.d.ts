declare type Alignment = "left" | "right" | "center" | "justify";
export interface ColumnOptions {
    width?: number;
    wrap?: boolean;
    align?: Alignment;
    format?: (content: string) => string;
}
export declare class Boudewijn<ColumnType extends ColumnOptions, ColumnDefs extends ColumnType[]> {
    private columns;
    private separator;
    constructor(columns: ColumnDefs, separator?: string);
    log(...parts: string[]): void;
    columnSizes(columns: ColumnDefs, width: number): number[];
    alignText(text: string, column: ColumnType, width: number): string;
    formatText(text: string, column: ColumnType): string;
    isFlexColumn(column: ColumnType): boolean;
}
export {};
