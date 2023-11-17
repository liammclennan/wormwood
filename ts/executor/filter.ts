import { FilterStep } from "../planner/planner";
import {Iter, Row, RowMarker} from "./producer";

export class Filter implements Iter
{
    private source: Iter;
    private readonly property: string;
    private readonly value: any;
    private columns: string[];

    constructor(source: Iter, filterStep: FilterStep) {
        console.assert(filterStep.columns.length > 0, "No columns specified");
        this.source = source;
        this.property = filterStep.property;
        this.value = filterStep.value;
        this.columns = filterStep.columns;
    }

    async next(): Promise<Row | RowMarker> {
        const row = await this.source.next();
        switch (row) {
            case "end of file" as RowMarker: return row;
            case "empty row" as RowMarker: return this.next();
            default: return (
                (row as Row)
                // `this.property` not found then columns[-1] is `undefined`
                [this.columns.indexOf(this.property)] === this.value 
                    ? row 
                    : this.next());
        }
    }

}