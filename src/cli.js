#!/usr/bin/env node
/* eslint-disable no-console */

import {join, relative, isAbsolute, basename, extname, dirname, resolve} from 'path';
import {cyan, green, red} from 'chalk';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import {PathPrompt} from 'inquirer-path';
import writePkg from 'write-pkg';
import readPkgUp from 'read-pkg-up';
import meow from 'meow';
import ora from 'ora';
import minimist from 'minimist';
import _ from 'lodash';

import * as Prompts from './lib/prompts';
import {processSwatch} from './lib/swatch-names';
import {listFiles, readFile, saveFile} from './lib/io';
import {decode, encode} from './lib/aco';

const cli = meow(`
	Usage
		$ swatch-names [options]
		
	Options
		--init Performs adding watch script only, modifies package.json
		--swatch [path] Converts the specified swatch file
		--output [path] Output file path for the named .aco file
		--scss [path] Saves SCSS color names to the specified file
		--js [path] Saves JS color names to the specified file
		--overwrite Overwrite swatch file
		
	Examples
		$ swatch-names
		$ swatch-names --init
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
				return saveFile(encode(processed.colors), output, 'Swatch file written to: ')
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

const convertSwatch = async (skipInit) => {
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
				Prompts.outputPath(join(dirname(swatchFile), basename(swatchFile, extname(swatchFile)) + '-named.aco')),
				Prompts.initialize(skipInit)
			]).then((answers) => {
				const output = answers.overwrite ? swatchFile : answers.outputPath;
				convertFile(swatchFile, output)
					.then(() => {
						if (answers.initialize) {
							initializeWatcher(swatchFile);
						}
					});
			});
		});
	}

};

const initializeWatcher = async (fileName) => {

	let files;

	if (fileName) {
		console.log(`Installing watch script for ${green(fileName)}...`);
	} else {
		files = await listAcoFiles(root);
	}

	const noSave = 'Don\'t save.';

	inquirer.prompt([
		Prompts.swatch(files, fileName),
		Prompts.scssPath(root, noSave),
		Prompts.jsPath(root, noSave)
	]).then((answers) => {

		readPkgUp()
			.then(result => {
				const {pkg, path} = result;

				fileName = relative(dirname(path), fileName || answers.swatch);

				const scripts = pkg.scripts || {};
				const swatchesScripts = scripts['swatches'] || 'swatch-names';

				const watch = pkg.watch || {};
				const swatchesWatch = watch['swatches'] || [];
				const swatchesArgs = minimist(swatchesScripts.split(' '));

				if (!swatchesArgs.swatch) {
					swatchesArgs.swatch = [];
				} else if (!_.isArray(swatchesArgs.swatch)) {
					swatchesArgs.swatch = [swatchesArgs.swatch];
				}

				if (!_.includes(swatchesArgs.swatch, fileName)) {
					swatchesArgs.swatch.push(fileName);
				}

				if (answers.scssPath && answers.scssPath !== noSave) {
					const scssPath = relative(root, answers.scssPath);
					if (!swatchesArgs.scss) {
						swatchesArgs.scss = [scssPath];
					} else if (!_.isArray(swatchesArgs.scss)) {
						swatchesArgs.scss = [swatchesArgs.scss];
					}

					if (!_.includes(swatchesArgs.scss, scssPath)) {
						swatchesArgs.scss.push(scssPath);
					}
				}

				if (answers.jsPath && answers.jsPath !== noSave) {
					const jsPath = relative(root, answers.jsPath);
					if (!swatchesArgs.js) {
						swatchesArgs.js = [jsPath];
					} else if (!_.isArray(swatchesArgs.js)) {
						swatchesArgs.js = [swatchesArgs.js];
					}

					if (!_.includes(swatchesArgs.js, jsPath)) {
						swatchesArgs.js.push(jsPath);
					}
				}

				pkg.scripts['swatches'] = 'swatch-names' + swatchesArgs.swatch.reduce((r, s) => r + ' --swatch ' + s, '') + swatchesArgs.scss.reduce((r, s) => r + ' --scss ' + s, '') + swatchesArgs.js.reduce((r, s) => r + ' --js ' + s, '');
				swatchesWatch.push(fileName);
				pkg.watch['swatches'] = swatchesWatch;
				writePkg(path, pkg)
					.then(() => {
						console.log(`Package.json updated. Now add ${green.bold('swatches')} to your watch script...`);
					});
			})
			.catch(err => {
				throw new Error(red.bold('No package.json found. Did you run \'npm init\'?\n' + err));
			});
	});
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

if (cli.flags.init) {
	initializeWatcher();
} else {
	swatchNamesCli(cli.flags);
}
