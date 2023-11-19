import * as fs from "node:fs/promises";
import * as Path from "node:path";
import { CreateIndexStep } from "../planner/planner";
import {Iter, Row, EndOfFile} from "./producer";

export class Indexer implements Iter
{
    private iterFactory: () => Promise<Iter>;
    private indexSource: string;
    private property: string;

    constructor(iterFactory: () => Promise<Iter>, indexStep: CreateIndexStep) {
        this.iterFactory = iterFactory;
        this.indexSource = indexStep.source;
        this.property = indexStep.property;
    }

    async next(): Promise<Row | EndOfFile> {
        let iter = await this.iterFactory();   
        let ix = {};
        let rowIx = 0;
        let row = await iter.next();
        while (row != "end of file") {
            if (row[0]) {
                let vals = ix[row[0]] ?? [];
                vals.push(rowIx);
                ix[row[0]] = vals;
            }
            rowIx += 1;
            row = await iter.next();
        }
        const ixFile = {
            source: this.indexSource,
            property: this.property,
            lookup: ix,
        };
        const filePath = Path.join(__dirname, "../../../data", `ix_${this.indexSource}_${this.property}.index`);
        await fs.writeFile(filePath, JSON.stringify(ixFile));
        return "end of file";
    }

}