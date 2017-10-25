import fs from 'fs';
import glob from 'glob';
import { green } from 'chalk';
import acoWriter from './acoWriter';

export const listAcoFiles = (root) => {
	const pattern = '**/*.aco';
	const ignore = [
		'**/node_modules/**'
	];

	return new Promise((resolve, reject) => {
		glob(pattern, {root, ignore}, (err, files) => {
			if (err) return reject(err);
			resolve(files);
		})
	});
};

export const saveSwatch = (fileName, colors) => {
	return new Promise((resolve, reject) => {
		acoWriter.make(fileName, colors, function(err, aco) {
			if (err) return reject(err);
			aco.on('finish', function() {
				console.log(green.bold('Swatch file saved to: ' + aco.path));
				resolve();
			});
		});
	});
};

export const saveFile = (data, file, message) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, (err) => {
			if (err) return reject(err);
			console.log(green.bold(message + file));
			resolve();
		});
	});
};