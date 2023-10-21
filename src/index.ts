import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as Parser from "./parser";
import * as Planner from "./planner/planner";
import * as Executor from "./executor/executor";
import {Iter} from "./executor/iter";

const rl = readline.createInterface({ input, output });

const query = Parser.parse(`SELECT @t,@mt FROM tablea where @mt = "Queue is exhausted"`);
const plan = Planner.plan(query);
const iter = Executor.execute(plan);

pull(iter).then(()=>{});

async function pull(iter: Iter) {
    while (true) {
        const next = await iter.next();
        if (next === "end of file") {
            console.log('end of file');
            break;
        }
        console.log(next);
    }
}


// prompt().then(()=>{});
//
// async function prompt() {
//     while (true) {
//         await rl.question('Enter a query...');
//         console.log(await filter.next());
//     }
// }