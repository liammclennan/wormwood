import { assert } from "../assert";
import { FilterStep } from "../planner/planner";
import {Iter, Row, EndOfFile} from "./producer";

export class Filter implements Iter
{
    private source: Iter;
    private readonly property: string;
    private readonly value: any;
    private columns: string[];

    constructor(source: Iter, filterStep: FilterStep) {
        assert(filterStep.columns.length > 0, "No columns specified");
        this.source = source;
        this.property = filterStep.property;
        this.value = filterStep.value;
        this.columns = filterStep.columns;
    }

    async next(): Promise<Row | EndOfFile> {
        const row = await this.source.next();

        switch (row) {
            case "end of file" as EndOfFile: return row;
            default: return (
                (row as Row)
                // `this.property` not found then columns[-1] is `undefined`
                [this.columns.indexOf(this.property)] === this.value 
                    ? row 
                    : this.next());
        }
    }

}