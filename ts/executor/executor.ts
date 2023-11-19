import * as Planner from "../planner/planner";
import {Producer,Iter,EndOfFile} from "./producer";
import {Filter} from "./filter";
import { OrderBy } from "./orderby";
import { StoredProcedure } from "../parser";
import { Mean } from "./mean";

export async function runQuery(plan: Planner.Plan): Promise<Iter> {
    let producer;
    const stack = plan.reduce((stk, step) => {
        switch (step.name) {
            case "producer": { 
                const table = step.table;
                producer = new Producer(table, step.columns);
                stk.push(producer as Iter);
                return stk; 
            }
            case "filter": {
                const producer = stk[0];
                stk.push(new Filter(producer, step));
                return stk;
            }
            case "mean": {
                stk.push(new Mean(stk[stk.length - 1], step));
                return stk;
            }
            case "orderby": {
                const source = stk[stk.length - 1];
                stk.push(new OrderBy(source, step));
                return stk;
            }
        }
    }, [] as Iter[]);

    await producer!.open();

    return stack.length > 0 ? stack.pop()! : {
        async next() {
            return "end of file" as EndOfFile;
        }
    } as Iter;
}

export async function runStoredProcedure(command: StoredProcedure) {
    let ix = {};
    switch (command.name) {
        case "createIndex": {
            let [source, property] = command.params;
            let iter = await runQuery([ {
                name: "producer",
                table: source,
                columns: [property],
            } ]);
            
            let rowIx = 0;
            const row = await iter.next();
            while (row != "end of file") {
                if (row[0]) {
                    let vals = ix[row[0]] ?? [];
                    vals.push(rowIx);
                    ix[row[0]] = vals;
                }
            }
        }
    }
}

