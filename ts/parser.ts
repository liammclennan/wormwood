import { assert } from "./assert";

/**
 * Convert a string query to the corresponding `Query` object.
 */

export type Command = "SELECT" | "UPDATE";

export type EqualityPredicate = [property: string, value: any];

export type Direction = "ASC" | "DESC";

export type OrderBy = [property: string, direction: Direction];

export type Aggregation = "MEAN";

export type Query = {
    command: Command;
    columns: string[];
    source: string;
    aggregation?: Aggregation;
    filter?: EqualityPredicate;
    orderBy?: OrderBy;
}

export function parse(q: string): Query {
    var [command, rest] = commandParser(q);
    var [fields, aggregation, rest] = fieldsParser(rest);
    var [source, rest] = tableParser(rest);
    var [filter,rest] = filterParser(rest);
    var [orderBy, rest] = orderByParser(rest);

    return {
        command,
        columns: fields,
        source,
        aggregation,
        filter,
        orderBy,
    };
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

function fieldsParser(q: string): [string[], Aggregation, string] {
    assert(!/^FROM/i.test(q), "Query does not request any fields");

    const matches =/mean ([^\s]+)\s*(FROM .*|$)/ig.exec(q.trim());
    if (matches) {
        let [_, column, remaining] = matches;
        assert(column.indexOf(',') === -1, "Mean aggregation queries may only include one column");
        return [[column], "MEAN", remaining];
    }

    const fieldsText = q.slice(0, q.indexOf(' '));
    const rest = q.slice(q.indexOf(' ') + 1, q.length);

    return [
        fieldsText.split(','),
        undefined,
        rest
    ];
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
    const matches = /([^\s]+)\s*=\s*(.+?)(ORDER BY .*|$)/ig.exec(q.trim());
    let [property,val,rest] = matches && matches.length > 2 
        ? [matches[1],matches[2].trim(),matches.length > 3 
            ? matches[3].trim() 
            : ""] 
        : ["",q];
    
    const result = [[property, JSON.parse(val.replace(/'/g, '"'))] as EqualityPredicate, rest ] as [ EqualityPredicate | undefined, string ];
    return result;
}

function orderByParser(q: string): [OrderBy | undefined, string] {
    if (!/^ORDER BY/i.test(q)) {
        return [undefined, q];
    }

    const matches = /order by ([^\s]+) (ASC|DESC)(.*)/ig.exec(q);

    if (!matches) {
        return [undefined, q];
    }

    return [[
        matches[1].trim(),
        matches[2].trim() as Direction
    ], matches[3].trim()];
}

function takeToSpace(input: string): string {
    return input.slice(0, input.indexOf(' ') > 0 ? input.indexOf(' ') : input.length).trim();
}

function takeFromSpace(input: string): string {
    return input.slice(input.indexOf(' ') > 0 
        ? input.indexOf(' ') + 1 
        : input.length).trim();
}

function wordEater(q: string): string {
    return takeFromSpace(q).trim();
}

