import fs from 'fs';
import glob from 'glob';
import {green} from 'chalk';

const sanitizeFilename = (fileName, extension) => {
	fileName = fileName || 'swatch-names-output-' + new Date() + extension;
	if (fileName.lastIndexOf(extension) !== fileName.length - 4) {
		fileName = fileName + extension;
	}
	return fileName;
};


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
			if (err) {
				throw new Error(err);
				return reject(err);
			}
			resolve(data);
		});
	});
};

export const saveFile = (data, fileName, enforceExtension, message = '') => {
	if (enforcedExtension) {
		fileName = sanitizeFilename(fileName, enforcedExtension);
	}

	return new Promise((resolve, reject) => {
		fs.writeFile(fileName, data, (err) => {
			if (err) return reject(err);
			console.log(green.bold(message + fileName));
			resolve();
		});
	});
};
