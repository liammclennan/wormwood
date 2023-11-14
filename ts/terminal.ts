import * as chalk from 'chalk';
import * as pkg from './package.json';

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
}


