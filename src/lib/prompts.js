import _ from 'lodash';
import {red} from 'chalk';

export const MESSAGES = {
	specifyDifferentPath: 'Would you like to specify a different path?',
	pathToYourSwatches: 'Path to your swatches:',
	swatchFileToProcess: 'Which swatch file do you want to process?',
	confirmOverwrite: 'Overwrite swatch file?',
	outputPath: 'Filename and location of the new swatch file:',
	saveScss: 'Save SCSS file / no save if left empty:',
	saveJs: 'Save JS file / no save if left empty:',
	incorrectScssPath: red.bold('Invalid .scss file path. Enter a valid file path relative to project root.'),
	incorrectJsPath: red.bold('Invalid .js file path. Enter a valid file path relative to project root.')
};


export const differentPath = {
	type: 'confirm',
	name: 'differentPath',
	message: MESSAGES.specifyDifferentPath,
	default: true
};

export const newPath = (root = process.cwd()) => ({
	type: 'path',
	name: 'newPath',
	cwd: root,
	directoryOnly: true,
	message: MESSAGES.pathToYourSwatches,
	default: root,
	when: (answers) => answers.differentPath
});

export const swatch = (files) => ({
	type: 'autocomplete',
	name: 'swatch',
	message: MESSAGES.swatchFileToProcess,
	source: (answers, input) => Promise.resolve(
		files.filter(file => !input || file.toLowerCase().indexOf(input.toLowerCase()) >= 0)
	)
});

export const overwrite = {
	type: 'confirm',
	name: 'overwrite',
	message: MESSAGES.confirmOverwrite,
	default: false
};

export const outputPath = (def) => ({
	type: 'input',
	name: 'outputPath',
	message: MESSAGES.outputPath,
	default: def,
	when: (answers) => !answers.overwrite
});

export const scssPath = (root = process.cwd(), noSave) => ({
	type: 'path',
	name: 'scssPath',
	message: MESSAGES.saveScss,
	cwd: root,
	validate: answer => answer === root || _.endsWith(answer.toLowerCase(), '.scss') ? true : MESSAGES.incorrectScssPath,
	filter: answer => answer === root ? noSave : answer
});

export const jsPath = (root, noSave) => ({
	type: 'path',
	name: 'jsPath',
	message: MESSAGES.saveJs,
	cwd: root,
	validate: answer => answer === root || _.endsWith(answer.toLowerCase(), '.js') ? true : MESSAGES.incorrectJsPath,
	filter: answer => answer === root ? noSave : answer
});