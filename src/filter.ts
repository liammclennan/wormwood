import {Iter, RowMarker} from "./iter";

export class Filter implements Iter
{
    private source: Iter;
    private property: string;
    private value: any;
    private columns: string[];

    constructor(source: Iter, columns: string[], property: string, value: any) {
        this.source = source;
        this.property = property;
        this.value = value;
        this.columns = columns;
    }

    async next(): Promise<any[] | RowMarker> {
        const row = await this.source.next();
        switch (row) {
            case "end of file" as RowMarker: return row;
            case "empty row" as RowMarker: return row;
            default: return (row as any[])[this.columns.indexOf(this.property)] === this.value ? row : this.next();
        }
    }

}