#!/usr/bin/env node

import { program } from 'commander';

import md2blogger from './md2blogger.js';


/*program
    .command('add [todo]')
    .description('Adiciona um to-do')
    .action((todo) => {
        console.log(todo);
    });*/

program
    .option('--md <mdFile>', 'The path of the markdown file to be converted and post.')
    .option('--url <blogUrl>', 'The URL of the blog, like "https://myblog.blogspot.com".');

program.parse();

const options = program.opts();

await md2blogger(options.md, options.url);
