import * as fs from "node:fs/promises";
import * as Path from "node:path";
import { CreateIndexStep, PropertyEqualityIndex } from "../planner/planner";
import {Iter, Row, EndOfFile} from "./producer";

export class Indexer implements Iter
{
    private readonly iterFactory: () => Promise<Iter>;
    private readonly indexSource: string;
    private readonly property: string;

    // iterFactory - function producing an iterator over a source
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
        const ixFile: PropertyEqualityIndex = {
            source: this.indexSource,
            property: this.property,
            lookup: ix,
        };
        await fs.writeFile(indexPath(this.indexSource, this.property), JSON.stringify(ixFile));
        return "end of file";
    }
}

export function indexPath(source: string, property: string) {
    return Path.join(__dirname, "../../../data", `ix_${source}_${property}.index`);
}