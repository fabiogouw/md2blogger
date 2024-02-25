#!/usr/bin/env node

import { program } from 'commander';

import md2blogger from './md2blogger.js';


program
    .command('add [todo]')
    .description('Adiciona um to-do')
    .action((todo) => {
        console.log(todo);
    });

program.parse(process.argv);

md2blogger().then(data => console.log("END " + data));
