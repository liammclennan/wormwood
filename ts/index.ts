import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {evaluate} from "./query";

prompt().then(()=>{});

async function prompt() {
    const rl = readline.createInterface({ input, output });
    const defaultQuery = `SELECT @t,@mt FROM tablea where @mt = "Queue is exhausted"`;
    while (true) {
        const text = (await rl.question(`Enter a query... (${defaultQuery})\n`)) || defaultQuery;
        const iter = evaluate(text);
        while (true) {
            const next = await iter.next();
            if (next === "end of file") {
                break;
            }
            console.log(next);
        }
    }
}