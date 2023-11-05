import { assert } from "./assert";

export function parse(q: string): Query {
    var [command, rest] = commandParser(q);
    var [fields, rest] = fieldsParser(rest);
    var [source, rest] = tableParser(rest);
    var [filter,rest] = filterParser(rest);

    return {
        command,
        columns: fields,
        source,
        filter,
    };
}

export type Command = "SELECT" | "UPDATE";

export type EqualityPredicate = [property: string, value: any];

export type Direction = "ASC" | "DESC";

export type OrderBy = [property: string, direction: Direction];

export type Query = {
    command: Command;
    columns: string[];
    source: string;
    filter?: EqualityPredicate;
    orderBy?: OrderBy;
}

function commandParser(q: string): [Command, string] {
    const commandText = q.slice(0, q.indexOf(' '));
    const rest = q.slice(q.indexOf(' ') + 1, q.length);

    switch (commandText.toUpperCase()) {
        case "SELECT": return ["SELECT", rest.trim()];
        case "UPDATE": return ["UPDATE", rest.trim()];
        default: throw new Error(`Unknown command ${commandText}`);
    }
}

function fieldsParser(q: string): [string[], string] {
    assert(!/^FROM/i.test(q), "Query does not request any fields"); 
    const fieldsText = q.slice(0, q.indexOf(' '));
    const rest = q.slice(q.indexOf(' ') + 1, q.length);

    return [
        fieldsText.split(','),
        rest
    ];
}

function wordEater(q: string): string {
    return takeFromSpace(q).trim();
}

function tableParser(q: string): [source: string, rest: string] {
    if (!/^FROM/i.test(q)) {
        return ["", q];
    }
    let rest = wordEater(q); // FROM

    return [takeToSpace(rest), takeFromSpace(rest)];
}

function filterParser(q: string): [EqualityPredicate | undefined, rest: string] {
    if (!/^WHERE/i.test(q) || q === '') {
        return [undefined, q];
    }
    const matches = /([^\s]+)\s*=\s*(.+)/g.exec(q.trim());
    let [property,r] = matches && matches.length > 2 ? [matches[1],matches[2]] : ["",q];
    let split = r.split("ORDER BY");
    return [[property, split[0]], split.length > 1 ? split[1] : "" ];
}

function takeToSpace(input: string): string {
    return input.slice(0, input.indexOf(' ') > 0 ? input.indexOf(' ') : input.length).trim();
}

function takeFromSpace(input: string): string {
    return input.slice(input.indexOf(' ') > 0 
        ? input.indexOf(' ') + 1 
        : input.length).trim();
}

