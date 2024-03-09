import * as Parser from "./parser/parser";
import * as Planner from "./planner/planner";
import * as Executor from "./executor/executor";
import { Iter } from "./executor/producer";

/**
 * Coordinates the evaluation of a query to an iterator. 
 * 
 * @param input A SELECT query or a sp_ stored procedure.
 * @returns An iterator
 */
export async function evaluate(input: string): Promise<Iter> {
    const command: Parser.Command = Parser.parse(input);
    const plan: Planner.Plan = await Planner.plan(command);
    return Executor.run(plan);
}
