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

export type Step = ProducerStep | FilterStep | OrderByStep;

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

export type OrderByStep = {
    name: "orderby",
    columns: string[],
    property: string,
    direction: Direction,
}

export function plan(query: Query): Plan {
    // every SELECT query needs a producer
    const producerStep: ProducerStep = {
        name: "producer",
        table: query.source,
        columns: query.columns,
    };

    let steps: Step[] = [producerStep];
    
    if (query.filter) {
        let filterStep: FilterStep = {
            name: "filter",
            columns: query.columns,
            property: query.filter[0],
            value: query.filter[1],
        };
        steps.push(filterStep);
    }

    if (query.orderBy) {
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