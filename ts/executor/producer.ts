import * as fs from "node:fs/promises";
import * as Path from "node:path";

import { createInterface } from "node:readline";
import { ProducerStep } from "../planner/planner";

export class Producer implements Iter {
    readonly filePath: string;
    lineBuffer: string[] = [];
    bufferIndex: number = 0;
    stream: any; 
    streamEnded: boolean = false;
    columns: string[];
    lineNumbers: number[];

    constructor(step: ProducerStep) {
        this.filePath = Path.join(__dirname, "../../../data", `${step.source}.clef`);
        this.columns = step.columns;
        this.lineNumbers = step.lines;
    }

    async next(): Promise<IterValue> {
        if (!this.stream) {
            let fd;
            try {
                fd = await fs.open(this.filePath);
            } catch {
                throw new Error("Failed to open database file for source " + this.filePath);
            }
            this.stream = fd.createReadStream({
                encoding:'utf8',
            });
            const lineReader = createInterface({
                input: this.stream,
                output: process.stdout,
                terminal: false,
              });

              lineReader.on('line', (line) => {
                this.lineBuffer.push(line);
              });

              this.stream.on('error', function (error: any) {
                console.log(`error: ${error.message}`);
            });
    
            this.stream.on('end', () => {
                this.streamEnded = true;
                fd.close();
            });
        }

        if (this.streamEnded && this.bufferIndex >= (this.lineBuffer.length)) {
            return "end of file";
        }

        if (this.lineBuffer.length > this.bufferIndex) {
            let line = this.lineBuffer[this.bufferIndex];
            let result = this.lineNumbers && this.lineNumbers.find((i) => i === this.bufferIndex)
                ? this.makeRow(line)
                : this.lineNumbers 
                    ? []
                    : this.makeRow(line);
            this.bufferIndex += 1;
            return result;
        } else {
            return new Promise((res,rej) => {
                setTimeout(() => {
                    res(this.next())
                }, 10);
            });
        }
    }

    makeRow(line: string): IterValue | undefined {
        try {
            const parsed = JSON.parse(line);
            let value = this.columns.map((c) => parsed[c]);
            return value;
        }
        catch (_) {
            return [];
        }
    }
}

export interface Iter {
    next(): Promise<IterValue>;
}

export type Row = any[];
export type EndOfFile = "end of file";
export type IterValue = Row | EndOfFile;