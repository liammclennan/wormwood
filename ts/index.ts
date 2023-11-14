import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {evaluate} from './query';
import * as terminal from './terminal';

terminal.intro();
prompt().then(()=>{});

async function prompt() {
    const rl = readline.createInterface({ input, output });
    while (true) {
        const text = 
            (await rl.question(terminal.style.prompt(`\nEnter a query... \n`)))
            || terminal.defaultQuery;
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