import {Direction, Query} from "../parser";

/**
 * Convert a `Query` to a `Plan`.
 * 
 * A `Query` is a structured representation of the user's query text. 
 * 
 * A `Plan` is a data flow query plan that includes everything the 
 * executor needs to execute the query. 
 */

export type Plan = Step[];

export type Step = ProducerStep | FilterStep | OrderByStep | MeanStep;

export type ProducerStep = {
    name: "producer",
    table: string,
    columns: string[],
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

export function plan(query: Query): Plan {
    if (query.columns.length === 0) {
        throw new Error("A query must include at least one column");
    }

    // every SELECT query needs a producer
    const producerStep: ProducerStep = {
        name: "producer",
        table: query.source,
        columns: query.columns,
    };

    let steps: Step[] = [producerStep];
    
    if (query.filter) {
        if (!query.columns.includes(query.filter[0])) {
            throw new Error(`Query must include the filter column. E.g. 'SELECT ${query.filter[0]},${query.columns.join(",")} FROM ...'`);
        }

        let filterStep: FilterStep = {
            name: "filter",
            columns: query.columns,
            property: query.filter[0],
            value: query.filter[1],
        };
        steps.push(filterStep);
    }

    if (query.aggregation === "MEAN") {
        let meanStep: MeanStep = {
            name: "mean",
            column: query.columns[0],
        };
        steps.push(meanStep);
    }

    if (query.orderBy) {
        if (!query.columns.includes(query.orderBy[0])) {
            throw new Error(`Query must include the filter column. E.g. 'SELECT ${query.orderBy[0]},${query.columns.join(",")} FROM ...'`);
        }
        if (query.aggregation) {
            throw new Error("Order by is not supported with aggregations");
        }

        let orderStep: OrderByStep = {
            name: "orderby",
            columns: query.columns,
            property: query.orderBy[0],
            direction: query.orderBy[1],
        };
        steps.push(orderStep);
    }

    return steps;
}