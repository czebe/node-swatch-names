import _ from 'lodash';

export const differentPath = {
	type: 'confirm',
	name: 'differentPath',
	message: 'Would you like to specify a different path?',
	default: true
};

export const newPath = (root) => ({
	type: 'path',
	name: 'newPath',
	cwd: root,
	directoryOnly: true,
	message: 'Path to your swatches:',
	default: root,
	when: (answers) => answers.differentPath
});

export const swatch = (files, fileName) => ({
	type: 'autocomplete',
	name: 'swatch',
	message: 'Which swatch file do you want to process?',
	source: (_, input) => Promise.resolve(
		files.filter(file => !input || file.value.toLowerCase().indexOf(input.toLowerCase()) >= 0)
	),
	when: !fileName
});

export const overwrite = {
	type: 'confirm',
	name: 'overwrite',
	message: 'Overwrite swatch file?',
	default: false
};

export const outputPath = (def) => ({
	type: 'input',
	name: 'outputPath',
	message: 'Filename of the new swatch file:',
	default: def,
	when: (answers) => !answers.overwrite
});

export const initialize = (skipInit) => ({
	type: 'confirm',
	name: 'initialize',
	message: 'Initialize watcher for this swatch file?',
	default: true,
	when: !skipInit
});

export const scssPath = (root, noSave) => ({
	type: 'path',
	name: 'scssPath',
	message: 'Save SCSS file with color variables to: (leave this empty if SCSS output is not needed)',
	cwd: root,
	validate: answer => answer === root || _.endsWith(answer.toLowerCase(), '.scss') ? true : red.bold('Invalid .scss file path. Enter a valid file path relative to project root.'),
	filter: answer => answer === root ? noSave : answer
});

export const jsPath = (root, noSave) => ({
	type: 'path',
	name: 'jsPath',
	message: 'Save JS file with color variables to: (leave this empty if JS output is not needed)',
	cwd: root,
	validate: answer => answer === root || _.endsWith(answer.toLowerCase(), '.js') ? true : red.bold('Invalid .js file path. Enter a valid file path relative to project root.'),
	filter: answer => answer === root ? noSave : answer
});