import {Query} from "../parser";

export function plan(query: Query): Plan {
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

    return steps;
}

export type Plan = Step[];

export type Step = ProducerStep | FilterStep;

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