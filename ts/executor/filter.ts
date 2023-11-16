import {Iter, RowMarker} from "./producer";

export class Filter implements Iter
{
    private source: Iter;
    private readonly property: string;
    private readonly value: any;
    private columns: string[];

    constructor(source: Iter, columns: string[], property: string, value: any) {
        console.assert(columns.length > 0, "No columns specified");
        this.source = source;
        this.property = property;
        this.value = value;
        this.columns = columns;
    }

    async next(): Promise<any[] | RowMarker> {
        const row = await this.source.next();
        switch (row) {
            case "end of file" as RowMarker: return row;
            case "empty row" as RowMarker: return this.next();
            default: return (
                (row as any[])
                // `this.property` not found then columns[-1] is `undefined`
                [this.columns.indexOf(this.property)] === this.value 
                    ? row 
                    : this.next());
        }
    }

}