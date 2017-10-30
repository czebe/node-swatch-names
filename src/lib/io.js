import fs from 'fs-extra';
import {dirname} from 'path';
import glob from 'glob';
import {green} from 'chalk';

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

export const readFile = (file) => {
	return new Promise((resolve, reject) => {
		fs.readFile(file, 'hex', (err, data) => {
			if (err) return reject(err);
			resolve(data);
		});
	});
};

export const saveFile = (data, fileName, message = 'File saved to: ') => {
	return new Promise((resolve, reject) => {
		fs.ensureDir(dirname(fileName))
			.then(() => {
				fs.writeFile(fileName, data, (err) => {
					if (err) return reject(err);
					console.log(green.bold(message + fileName));
					resolve();
				});
			});
	});
};
