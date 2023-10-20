import * as fs from "node:fs/promises";

export class Producer {
    filePath: string;
    buffer: string[][] = [];
    stream: any; 
    bufferIndex: number = 0;

    constructor(filePath: string) {
        this.filePath = filePath;
        const fd = fs.open(this.filePath).then((fd) => {
            this.stream = fd.createReadStream({encoding:'utf8'});
            this.open().then(()=>{
                setTimeout(() => {
                    console.log(this.next());

                }, 2000);
            });
        }).finally(() => {
            this.stream = {};
        });


    }

    async open() {
        

        this.stream.on('error', function (error: any) {
            console.log(`error: ${error.message}`);
        })
    
        this.stream.on('data', (chunk: any) => {
            this.buffer.push((chunk as string).split('\n'));   
            // this.stream.pause();
        })

        this.stream.on('end', () => {
            console.log('buffer length', this.buffer.length);
        });
    }

    next(): string {
        this.bufferIndex += 1;
        return this.buffer[this.bufferIndex-1][0]
    }


}