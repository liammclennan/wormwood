import * as Parser from "./parser";
import * as Planner from "./planner/planner";
import * as Executor from "./executor/executor";
import { EmptyIter, Iter } from "./executor/producer";
import { StoredProcedure } from "./parser";

export function evaluate(input: string): Promise<Iter> {
    // "select ..."  => Parser.Query
    const command = Parser.parse(input);

    switch (command.type) {
        case "stored procedure": {
            Executor.runStoredProcedure(command);
            return Promise.resolve(EmptyIter);
        }
        default: {
            // Parser.Query => Planner.Plan
            const plan = Planner.plan(command);

            // Planner.Plan => Promise<Iter>
            return Executor.runQuery(plan);
        }
    }
}
