import * as fs from "node:fs/promises";
import {clearInterval} from "timers";
import * as Path from "node:path";

export class Producer implements Iter {
    public filePath: string;
    columns: string[];
    buffer: string[] = [];
    stream: any; 
    bufferIndex: number = 0;
    streamEnded: boolean = false;

    constructor(table: string, columns: string[]) {
        this.filePath = Path.join(__dirname, "../../../data", `${table}.clef`);
        this.columns = columns;
    }

    async open() {
        let fd;
        try {
            fd = await fs.open(this.filePath);
        } catch {
            throw new Error("Failed to open database file for source " + this.filePath);
        }
        this.stream = fd.createReadStream({
            encoding:'utf8',
        });
        this.stream.on('error', function (error: any) {
            console.log(`error: ${error.message}`);
        })

        this.stream.on('end', () => {
            this.streamEnded = true;
            fd.close();
        });

        return new Promise((res,_) => {
            this.stream.on('data', (chunk: any) => {
                let remnant = this.buffer.length && this.buffer[this.buffer.length -1] !== ''
                    ? this.buffer[this.buffer.length -1]
                    :
                    '';
                this.buffer = (chunk as string).split('\n');
                this.buffer[0] = remnant + this.buffer[0];
                this.bufferIndex = 0;
                this.stream.pause();
                res(0);
            })
        });
    }

    async next(): Promise<IterValue> {
        this.bufferIndex += 1;

        return new Promise(async (res, _) => {
            if (this.bufferIndex > this.buffer.length) {
                if (this.buffer[this.bufferIndex-1] === '') {
                    this.buffer = [];
                    this.bufferIndex = 0;
                } else {
                    this.stream?.resume();
                }
                if (this.streamEnded) {
                    return res("end of file" as EndOfFile);
                }
                const i = setInterval(async () => {
                    if (this.buffer.length > 1 && this.bufferIndex === 0) {
                        if (this.buffer[this.bufferIndex]) {
                            clearInterval(i);
                            return res(this.makeRow(this.buffer[this.bufferIndex]) ?? await this.next());
                        }
                    }
                    else if (this.streamEnded) {
                        clearInterval(i);
                        return res("end of file" as EndOfFile);
                    }
                }, 10);
            } else {
                let o = this.makeRow(this.buffer[this.bufferIndex-1]) ?? await this.next();
                return res(o);
            }
        });
    }

    makeRow(line: string): IterValue | undefined {
        try {
            const parsed = JSON.parse(line);
            return this.columns.map((c) => parsed[c]);
        }
        catch (_) {
            return undefined;
        }
    }
}

export interface Iter {
    next(): Promise<IterValue>;
}

export const EmptyIter: Iter = {
    next() {
        return Promise.resolve("end of file");
    }
}

export type Row = any[];
export type EndOfFile = "end of file";
export type IterValue = Row | EndOfFile;