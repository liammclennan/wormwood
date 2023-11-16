import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {evaluate} from './query';
import * as terminal from './terminal';

terminal.intro();

(async function prompt() {
    const rl = readline.createInterface({ input, output });
    while (true) {
        const text = 
            (await rl.question(terminal.style.prompt(`\n> `)))
            || terminal.defaultQuery;
        console.time("query evaluation");
        const iter = await evaluate(text);
        console.log('');
        while (true) {
            const next = await iter.next();
            if (next === "end of file") {
                break;
            }
            if (next !== "empty row") {
                console.log(next);
            }
        }
        console.timeEnd("query evaluation");
    }
})().then(()=>{});