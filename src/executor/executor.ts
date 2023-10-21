import * as Planner from "../planner/planner";
import {Producer} from "./producer";
import {Filter} from "./filter";
import {ProducerStep} from "../planner/planner";
import {Iter, RowMarker} from "./iter";

export function execute(plan: Planner.Plan): Iter {
    const producer = new Producer((plan[0] as ProducerStep).table, (plan[0] as ProducerStep).columns);
    const stack = plan.map((step) => {
        switch (step.name) {
            case "filter": return new Filter(producer, step.columns, step.property, step.value);
        }
    });
    return stack.length > 0 ? stack.pop()! : {
        async next() {
            return "end of file" as RowMarker;
        }
    } as Iter;
}