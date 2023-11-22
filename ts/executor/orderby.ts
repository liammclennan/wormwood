import { OrderByStep } from "../planner/planner";
import {Iter, Row, EndOfFile} from "./producer";

export class OrderBy implements Iter
{
    private readonly source: Iter;
    private readonly step: OrderByStep;
    private sorted: Row[];

    constructor(source: Iter, orderBy: OrderByStep) {
        this.source = source;
        this.step = orderBy;
    }

    async next(): Promise<Row | EndOfFile> {
        if (!this.sorted) {
            const rows = [];
            let row = await this.source.next();
            while (row != "end of file") {
                rows.push(row);
                row = await this.source.next();
            }
            rows.sort((a,b) => {
                let aVal = (a as any[])[this.step.columns.indexOf(this.step.property)];
                let bVal = (b as any[])[this.step.columns.indexOf(this.step.property)];

                // sort backwards so results can pop
                return (aVal > bVal 
                    ? -1 
                    : aVal < bVal 
                        ? 1
                        : 0) * (this.step.direction.toUpperCase() == "DESC" ? -1 : 1);
            });
            this.sorted = rows;
        }

        return this.sorted.pop() ?? "end of file";
    }

}