import {Query} from "../parser";

export function plan(query: Query): Plan {
    const producerStep: ProducerStep = {
        name: "producer",
        table: query.source,
        columns: query.columns,
    };
    const filterStep: FilterStep = {
        name: "filter",
        columns: query.columns,
        property: query.filter[0],
        value: query.filter[1],
    };
    return [
        producerStep,
        filterStep
    ];
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