import { MeanStep } from "../planner/planner";
import {Iter, Row, EndOfFile} from "./producer";

export class Mean implements Iter
{
    private source: Iter;
    private sum: number = 0;
    private count: number = 0;

    constructor(source: Iter) {
        this.source = source;
    }

    async next(): Promise<Row | EndOfFile> {
        if (this.count > 0) {
            return "end of file";
        }

        let row = await this.source.next();
        while (row != "end of file") {
            let value = row[0];
            if (typeof value === "number") {
                this.sum += value;
                this.count += 1;
            }                        
            row = await this.source.next();
        }
        return [this.sum / this.count];
    }

}