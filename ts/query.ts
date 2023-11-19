import * as Parser from "./parser";
import * as Planner from "./planner/planner";
import * as Executor from "./executor/executor";
import { Iter } from "./executor/producer";

export function evaluate(input: string): Promise<Iter> {
    // "select ..."  => Parser.Query
    const command = Parser.parse(input);

    // Parser.Query => Planner.Plan
    const plan = Planner.plan(command);

    // Planner.Plan => Promise<Iter>
    return Executor.run(plan);
}
