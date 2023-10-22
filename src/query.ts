import * as Parser from "./parser";
import * as Planner from "./planner/planner";
import * as Executor from "./executor/executor";

export function evaluate(input: string) {
    const query = Parser.parse(input);
    const plan = Planner.plan(query);
    const iter = Executor.execute(plan);
    return iter;
}
