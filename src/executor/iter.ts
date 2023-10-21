export interface Iter {
    next(): Promise<any[] | RowMarker>;
}

export type RowMarker = "empty row" | "end of file";