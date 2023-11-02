import * as Planner from "../planner/planner";
import {Producer,Iter,RowMarker} from "./producer";
import {Filter} from "./filter";
import {ProducerStep} from "../planner/planner";

export function execute(plan: Planner.Plan): Iter {
    const producer = new Producer((plan[0] as ProducerStep).table, (plan[0] as ProducerStep).columns);
    const stack = plan.slice(1).map((step) => {
        switch (step.name) {
            case "filter": return new Filter(producer, step.columns, step.property, step.value);
        }
    });
    console.log(stack);
    return stack.length > 0 ? stack.pop()! : {
        async next() {
            return "end of file" as RowMarker;
        }
    } as Iter;
}
