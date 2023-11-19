import chalk from 'chalk';
import * as pkg from './package.json';

export const defaultQuery = `SELECT @t,@mt FROM tablea where @mt = 'Queue is exhausted'`;

export const style = {
    intro: chalk.blue,
    prompt: chalk.keyword('orange'),
    example: chalk.hex('#DEADED'),
};

export function intro() {
    console.log('\x1b[2J');
    console.log(style.intro(`${pkg.name}`));
    console.log(style.intro(`Version: ${pkg.version}`));
    console.log(style.intro(`${pkg.description}\n`));

    console.log(style.example("Syntax:\n"));
    console.log(style.example("SELECT <columnName>[,<columnName>]"));
    console.log(style.example("FROM <tableName>"));
    console.log(style.example("[WHERE <columnName> = <constantValue>]"));
    console.log(style.example("[ORDER BY <columnName>]\n"));
}


