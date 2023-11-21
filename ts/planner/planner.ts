import { Query, StoredProcedure } from '../parser/parser';
import * as fs from "node:fs/promises";
import {Command, Direction} from "../parser/parser";
import { indexPath } from "../executor/indexer";

/**
 * Convert a `Query` to a `Plan`.
 * 
 * A `Query` is a structured representation of the user's query text. 
 * 
 * A `Plan` is a data flow query plan that includes everything the 
 * executor needs to execute the query. 
 */

export type Plan = Step[];

export type Step = ProducerStep | FilterStep | OrderByStep | MeanStep | CreateIndexStep;

export type ProducerStep = {
    name: "producer",
    source: string,
    columns: string[],
    lines?: number[],
}

export type FilterStep = {
    name: "filter",
    columns: string[],
    property: string,
    value: any,
}

export type MeanStep = {
    name: "mean",
    column: string,    
}

export type OrderByStep = {
    name: "orderby",
    columns: string[],
    property: string,
    direction: Direction,
}

export type CreateIndexStep = {
    name: "createindex";
    source: string;
    property: string;
}

export type PropertyEqualityIndex = {
    source: string,
    property: string,
    lookup: {
        [vals: string]: number[]
    };
}

export async function plan(command: Command): Promise<Plan> {
    switch (command.type) {
        case "stored procedure": {
            return createSpPlan(command);
        }
        case "query": {
            return await createQueryPlan(command);
        }
    }    
}

function createSpPlan(sp: StoredProcedure) {
    let indexStep: CreateIndexStep = {
        name: "createindex",
        source: sp.params[0],
        property: sp.params[1],
    };
    return Promise.resolve([indexStep]);
}

async function createQueryPlan(command: Query) {
    if (command.columns.length === 0) {
        throw new Error("A query must include at least one column");
    }

    // every SELECT query needs a producer
    const producerStep: ProducerStep = {
        name: "producer",
        source: command.source,
        columns: command.columns,
    };

    let steps: Step[] = [producerStep];
    
    if (command.filter) {
        if (!command.columns.includes(command.filter[0])) {
            throw new Error(`Query must include the filter column. E.g. 'SELECT ${command.filter[0]},${command.columns.join(",")} FROM ...'`);
        }
        let [property, value] = command.filter;
        let index = await findIndex(command.source, property);

        if (index) {
            producerStep.lines = index.lookup[value.toString()];
        }

        let filterStep: FilterStep = {
            name: "filter",
            columns: command.columns,
            property,
            value,
        };
        steps.push(filterStep);
    }

    if (command.aggregation === "MEAN") {
        let meanStep: MeanStep = {
            name: "mean",
            column: command.columns[0],
        };
        steps.push(meanStep);
    }

    if (command.orderBy) {
        if (!command.columns.includes(command.orderBy[0])) {
            throw new Error(`Query must include the filter column. E.g. 'SELECT ${command.orderBy[0]},${command.columns.join(",")} FROM ...'`);
        }
        if (command.aggregation) {
            throw new Error("Order by is not supported with aggregations");
        }

        let orderStep: OrderByStep = {
            name: "orderby",
            columns: command.columns,
            property: command.orderBy[0],
            direction: command.orderBy[1],
        };
        steps.push(orderStep);
    }

    return Promise.resolve(steps);
}

async function findIndex(source: string, property: string): Promise<PropertyEqualityIndex | undefined> {
    const filePath = indexPath(source, property);    
    try {
        let index = await fs.readFile(filePath, 'utf8');
        if (index) {
            return JSON.parse(index);
        }
    }
    catch {
        return undefined;
    }        
}