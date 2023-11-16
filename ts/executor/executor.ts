import * as Planner from "../planner/planner";
import {Producer,Iter,RowMarker} from "./producer";
import {Filter} from "./filter";
import {ProducerStep} from "../planner/planner";
import { OrderBy } from "./orderby";

export async function execute(plan: Planner.Plan): Promise<Iter> {
    let producer;
    const stack = plan.reduce((stk, step) => {
        switch (step.name) {
            case "producer": { 
                const table = (plan[0] as ProducerStep).table;
                producer = new Producer(table, (step as ProducerStep).columns);
                stk.push(producer as Iter);
                return stk; 
            }
            case "filter": {
                const producer = stk[0];
                stk.push(new Filter(producer, step.columns, step.property, step.value));
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
