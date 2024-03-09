import * as Planner from "../planner/planner";
import {Producer,Iter,EndOfFile} from "./producer";
import {Filter} from "./filter";
import { OrderBy } from "./orderby";
import { Mean } from "./mean";
import { Indexer } from "./indexer";

/**
 * Executes a query plan.
 * 
 * @param plan A query plan
 * @returns An iterator
 */
export async function run(plan: Planner.Plan): Promise<Iter> {
    let producer;
    const stack = plan.reduce((stk, step) => {
        switch (step.name) {
            case "producer": { 
                producer = new Producer(step);
                stk.push(producer as Iter);
                return stk; 
            }
            case "filter": {
                const producer = stk[0];
                stk.push(new Filter(producer, step));
                return stk;
            }
            case "mean": {
                stk.push(new Mean(stk[stk.length - 1]));
                return stk;
            }
            case "orderby": {
                const source = stk[stk.length - 1];
                stk.push(new OrderBy(source, step));
                return stk;
            }
            case "createindex": {
                let iterFactory = () => run([{
                    name: "producer",
                    source: step.source,
                    columns: [step.property],
                }]);
                stk.push(new Indexer(iterFactory, step));
                return stk;
            }
        }
    }, [] as Iter[]);

    return stack.length > 0 ? stack.pop()! : {
        async next() {
            return "end of file" as EndOfFile;
        }
    } as Iter;
}
