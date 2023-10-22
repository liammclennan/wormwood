import * as fs from "node:fs/promises";
import {clearInterval} from "timers";
import * as Path from "node:path";

export class Producer implements Iter {
    filePath: string;
    columns: string[];
    buffer: string[] = [];
    stream: any; 
    bufferIndex: number = 0;
    streamEnded: boolean = false;


    constructor(table: string, columns: string[]) {
        this.filePath = Path.join(__dirname, "../../data", `${table}.clef`);
        this.columns = columns;
        this.open();
    }

    async open() {
        const fd = await fs.open(this.filePath);
        this.stream = fd.createReadStream({
            encoding:'utf8',
        });
        this.stream.on('error', function (error: any) {
            console.log(`error: ${error.message}`);
        })

        this.stream.on('data', (chunk: any) => {
            let remnant = this.buffer.length && this.buffer[this.buffer.length -1] !== ''
                ? this.buffer[this.buffer.length -1]
                :
                '';
            this.buffer = (chunk as string).split('\n');
            this.buffer[0] = remnant + this.buffer[0];
            this.bufferIndex = 0;
            this.stream.pause();
        })

        this.stream.on('end', () => {
            this.streamEnded = true;
            console.log('stream ended');
        });
    }

    async next(): Promise<any[] | RowMarker> {
        this.bufferIndex += 1;

        return new Promise((res, _) => {
            if (this.bufferIndex >= this.buffer.length) {
                if (this.buffer[this.bufferIndex-1] === '') {
                    this.buffer = [];
                    this.bufferIndex = 0;
                } else {
                    this.stream?.resume();
                }
                if (this.streamEnded) {
                    return "end of file" as RowMarker;
                }
                const i = setInterval(() => {
                    if (this.buffer.length > 1 && this.bufferIndex === 0) {
                        if (this.buffer[this.bufferIndex]) {
                            res(this.makeRow(this.buffer[this.bufferIndex]));
                            clearInterval(i);
                        }
                    }
                }, 1);
            } else {
                res(this.makeRow(this.buffer[this.bufferIndex-1]));
            }
        });
    }

    makeRow(line: string): any[] {
        const parsed = JSON.parse(line);
        return this.columns.map((c) => parsed[c]);
    }
}

export interface Iter {
    next(): Promise<any[] | RowMarker>;
}

export type RowMarker = "empty row" | "end of file";