import * as Planner from "../planner/planner";
import {Producer,Iter,RowMarker} from "./producer";
import {Filter} from "./filter";
import {ProducerStep} from "../planner/planner";
import { OrderBy } from "./orderby";
import { Mean } from "./mean";

export async function execute(plan: Planner.Plan): Promise<Iter> {
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
            return "end of file" as RowMarker;
        }
    } as Iter;
}
