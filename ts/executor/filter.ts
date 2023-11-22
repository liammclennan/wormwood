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
        let row = await this.source.next();

        while (row !== "end of file") {
            // `this.property` not found then columns[-1] is `undefined`
            if (row[this.columns.indexOf(this.property)] === this.value) {
                return row;
            }
            row = await this.source.next()
        }
        return row;
    }
}