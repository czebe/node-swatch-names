#!/usr/bin/env node
/* eslint-disable no-console */

import {join, relative, isAbsolute, basename, extname, dirname, resolve} from 'path';
import {cyan, green, red} from 'chalk';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import {PathPrompt} from 'inquirer-path';
import meow from 'meow';
import ora from 'ora';
import _ from 'lodash';

import * as Prompts from './lib/prompts';
import {processSwatch} from './lib/swatch-names';
import {listFiles, readFile, saveFile} from './lib/io';
import {decode, encode} from './lib/aco';

const cli = meow(`
	Usage
		$ swatch-names [options]
		
	Options
		--swatch [path] Converts the specified swatch file
		--output [path] Output file path for the named .aco file
		--scss [path] Saves SCSS color names to the specified file
		--js [path] Saves JS color names to the specified file
		--overwrite Overwrite swatch file
		
	Examples
		$ swatch-names
		$ swatch-names --swatch swatches.aco
		$ swatch-names --swatch swatches.aco --scss swatches.scss
		$ swatch-names --swatch swatches.aco --scss swatches.scss --js swatches.js
		$ swatch-names --swatch swatches.aco --swatch swatches2.aco --swatch swatches3.aco --scss swatches.scss --js swatches.js
		
`);

const root = process.cwd();
inquirer.registerPrompt('path', PathPrompt);
inquirer.registerPrompt('autocomplete', autocomplete);

const convertFile = (input, output, scss, js) => {

	let processed;

	return new Promise((resolve, reject) => {
		readFile(input)
			.then((data) => {
				processed = processSwatch(decode(data));
				return saveFile(encode(processed.colors), output, 'Swatch file written to: ');
			})
			.then(() => {
				return scss ? saveFile(processed.scss, scss, 'SCSS file written to: ') : Promise.resolve();
			})
			.then(() => {
				return js ? saveFile(processed.js, js, 'JS file written to: ') : Promise.resolve();
			})
			.then(() => {
				resolve();
			});
	});
};

const convertSwatch = async () => {
	const spinner = ora(`Scanning ${green(root)} for swatch files (*.aco)...`).start();
	const files = await listFiles(root);
	spinner.stop();

	if (!files.length) {
		console.log(red.bold('\nNo swatch files found under the current directory.\n'));
		inquirer.prompt([
			Prompts.differentPath,
			Prompts.newPath(root)
		]).then((answers) => {
			if (answers.newPath) {
				convertSwatches(answers.newPath);
			} else {
				return process.exit(1);
			}
		});
	} else {
		// Found some *.aco files, convert them
		inquirer.prompt([
			Prompts.swatch(files)
		]).then((answers) => {
			const swatchFile = answers.swatch;
			inquirer.prompt([
				Prompts.overwrite,
				Prompts.outputPath(join(dirname(swatchFile), basename(swatchFile, extname(swatchFile)) + '-named.aco'))
			]).then((answers) => {
				const output = answers.overwrite ? swatchFile : answers.outputPath;
				return convertFile(swatchFile, output);
			});
		});
	}

};

const swatchNamesCli = (flags) => {
	const swatches = flags.swatch;

	if (swatches) {
		const scss = flags.scss;
		const js = flags.js;

		if (_.isArray(swatches)) {
			_.forEach(swatches, (swatch, index) => {
				const swatchFile = relative(root, resolve(swatch));
				const scssPath = _.isArray(scss) ? (scss.length === swatches.length ? scss[index] : scss[0]) : scss;
				const jsPath = _.isArray(js) ? (js.length === swatches.length ? js[index] : js[0]) : js;
				const output = flags.overwrite ? swatchFile : flags.output ? flags.output : join(dirname(swatchFile), basename(swatchFile, extname(swatchFile)) + '-named.aco');
				convertFile(swatchFile, output, scssPath, jsPath);
			});
		} else {
			if (_.isArray(scss) || _.isArray(js)) throw new Error(red.bold('Wrong number of output arguments supplied. One swatch file can be converted to one SCSS and one JS file only.'));
			const swatchFile = relative(root, resolve(swatches));
			const output = flags.overwrite ? swatchFile : flags.output ? flags.output : join(dirname(swatchFile), basename(swatchFile, extname(swatchFile)) + '-named.aco');
			convertFile(swatchFile, output, scss, js);
		}
	} else {
		convertSwatch();
	}
};

swatchNamesCli(cli.flags);
