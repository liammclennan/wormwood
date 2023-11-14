import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {evaluate} from './query';
import * as terminal from './terminal';

terminal.intro();
prompt().then(()=>{});

async function prompt() {
    const rl = readline.createInterface({ input, output });
    const defaultQuery = `SELECT @t,@mt FROM tablea where @mt = 'Queue is exhausted'`;
    while (true) {
        const text = 
            (await rl.question(
                terminal.style.prompt(`\nEnter a query... `, terminal.style.example(`(${defaultQuery})\n`))))
            || defaultQuery;
        const iter = await evaluate(text);
        while (true) {
            const next = await iter.next();
            if (next === "end of file") {
                break;
            }
            if (next !== "empty row") {
                console.log(next);
            }
        }
    }
}