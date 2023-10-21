import { Producer } from "./producer";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {Filter} from "./filter";

const rl = readline.createInterface({ input, output });
const columns = ["@t","@mt"];
const p = new Producer('/Users/liammclennan/toydb/data/data.clef', columns);

const filter = new Filter(p, ["@t","@mt"], "@mt", "Queue is exhausted");

prompt().then(()=>{});

async function prompt() {
    while (true) {
        await rl.question('');
        console.log(await filter.next());
    }
}