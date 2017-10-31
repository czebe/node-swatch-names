import _ from 'lodash';

export const MESSAGES = {
	specifyDifferentPath: 'Would you like to specify a different path?',
	pathToYourSwatches: 'Path to your swatches:',
	swatchFileToProcess: 'Which swatch file do you want to process?',
	confirmOverwrite: 'Overwrite swatch file?',
	outputPath: 'Filename and location of the new swatch file:',
	initializeWatcher: 'Initialize watcher for this swatch file?',
	saveScss: 'Save SCSS file with color variables to: (leave this empty if SCSS output is not needed)',
	saveJs: 'Save JS file with color variables to: (leave this empty if JS output is not needed)'
};


export const differentPath = {
	type: 'confirm',
	name: 'differentPath',
	message: MESSAGES.specifyDifferentPath,
	default: true
};

export const newPath = (root) => ({
	type: 'path',
	name: 'newPath',
	cwd: root,
	directoryOnly: true,
	message: MESSAGES.pathToYourSwatches,
	default: root,
	when: (answers) => answers.differentPath
});

export const swatch = (files, fileName) => ({
	type: 'autocomplete',
	name: 'swatch',
	message: MESSAGES.swatchFileToProcess,
	source: (answers, input) => Promise.resolve(
		files.filter(file => !input || file.toLowerCase().indexOf(input.toLowerCase()) >= 0)
	),
	when: !fileName
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

export const initialize = (skipInit) => ({
	type: 'confirm',
	name: 'initialize',
	message: MESSAGES.initializeWatcher,
	default: true,
	when: !skipInit
});

export const scssPath = (root, noSave) => ({
	type: 'path',
	name: 'scssPath',
	message: MESSAGES.saveScss,
	cwd: root,
	validate: answer => answer === root || _.endsWith(answer.toLowerCase(), '.scss') ? true : red.bold('Invalid .scss file path. Enter a valid file path relative to project root.'),
	filter: answer => answer === root ? noSave : answer
});

export const jsPath = (root, noSave) => ({
	type: 'path',
	name: 'jsPath',
	message: MESSAGES.saveJs,
	cwd: root,
	validate: answer => answer === root || _.endsWith(answer.toLowerCase(), '.js') ? true : red.bold('Invalid .js file path. Enter a valid file path relative to project root.'),
	filter: answer => answer === root ? noSave : answer
});