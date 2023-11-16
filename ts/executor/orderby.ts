import { OrderByStep } from "../planner/planner";
import {Iter, Row, RowMarker} from "./producer";

export class OrderBy implements Iter
{
    private readonly source: Iter;
    private readonly step: OrderByStep;
    private sorted: Row[];

    constructor(source: Iter, orderBy: OrderByStep) {
        console.assert(orderBy.columns.length > 0, "No columns specified");
        this.source = source;
        this.step = orderBy;
    }

    async next(): Promise<Row | RowMarker> {
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
                if (aVal > bVal && this.step.direction === "ASC") return -1;
                if (aVal < bVal) return 1;
                return 0;
            });
            this.sorted = rows;
        }

        return this.sorted.pop() ?? "end of file";
    }

}