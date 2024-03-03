#!/usr/bin/env node

import md2blogger from "./md2blogger.js";
import { program } from "commander";

program
    .requiredOption("--md <mdFile>", "The path of the markdown file to be converted and posted.")
    .requiredOption("--url <blogUrl>", "The URL of the blog, ie 'https://myblog.blogspot.com'.");

program.parse();

const options = program.opts();

await md2blogger(options.md, options.url);
