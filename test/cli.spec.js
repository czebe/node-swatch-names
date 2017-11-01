import {expect} from 'chai';
import suppose from 'suppose';
import fs, {remove} from 'fs-extra';
import _ from 'lodash';
import {underline, bgBlue, bold, whiteBright} from 'chalk';

import {MESSAGES} from '../src/lib/prompts';

const moveDown = (times = 1) => _.repeat('\x1B\x5B\x42', times);

describe(bgBlue.whiteBright('cli'), () => {

	describe(underline.bold('convert swatch file'), () => {

		beforeEach(async () => {
			await remove('test/tmp');
		});

		afterEach(async () => {
			await remove('test/tmp');
		});

		it('convert an individual swatch file', async () => {

			const output = 'test/tmp/a.aco';

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js'])
					.when(new RegExp(MESSAGES.swatchFileToProcess, 'i')).respond('\n')
					.when(new RegExp(MESSAGES.confirmOverwrite, 'i')).respond('\n')
					.when(new RegExp(MESSAGES.outputPath, 'i')).respond(output + '\n')
					.when(new RegExp(MESSAGES.initializeWatcher, 'i')).respond('n\n')
					.end(() => {
						const fileCreated = fs.existsSync(output);
						expect(fileCreated).to.equal(true);
						resolve();
					});
			});

		});

		it('convert and overwrite an individual swatch file', async () => {

			const fileName = 'test/fixtures/swatch-overwrite.aco';
			const startTime = fs.statSync(fileName).mtime;

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js'])
					.when(new RegExp(MESSAGES.swatchFileToProcess, 'i')).respond(moveDown() + '\n')
					.when(new RegExp(MESSAGES.confirmOverwrite, 'i')).respond('y\n')
					.when(new RegExp(MESSAGES.initializeWatcher, 'i')).respond('n\n')
					.end(() => {
						const modifiedTime = fs.statSync(fileName).mtime;
						expect(modifiedTime).to.not.equal(startTime);
						resolve();
					});
			});

		});

		it('convert an individual swatch file, supplied as an argument', async () => {

			const output = 'test/tmp/a.aco';

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js', '--swatch', 'test/fixtures/swatch-bw.aco', '--output', output])
					.end(() => {
						const fileCreated = fs.existsSync(output);
						expect(fileCreated).to.equal(true);
						resolve();
					});
			});

		});

	});

	describe(underline.bold('export SCSS/JS'), () => {

		beforeEach(async () => {
			await remove('test/tmp');
		});

		afterEach(async () => {
			await remove('test/tmp');
		});

		it('convert an individual swatch file and generate SCSS variables', async () => {

			const outputSwatch = 'test/tmp/a.aco';
			const outputScss = 'test/tmp/a.scss';

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js', '--swatch', 'test/fixtures/swatch-bw.aco', '--output', outputSwatch, '--scss', outputScss])
					.end(() => {
						const swatchFileCreated = fs.existsSync(outputSwatch);
						const scssFileCreated = fs.existsSync(outputScss);
						expect(swatchFileCreated).to.equal(true);
						expect(scssFileCreated).to.equal(true);
						resolve();
					});
			});

		});

		it('convert an individual swatch file and generate JS variables', async () => {

			const outputSwatch = 'test/tmp/a.aco';
			const outputJs = 'test/tmp/a.js';

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js', '--swatch', 'test/fixtures/swatch-bw.aco', '--output', outputSwatch, '--js', outputJs])
					.end(() => {
						const swatchFileCreated = fs.existsSync(outputSwatch);
						const jsFileCreated = fs.existsSync(outputJs);
						expect(swatchFileCreated).to.equal(true);
						expect(jsFileCreated).to.equal(true);
						resolve();
					});
			});

		});

		it('convert an individual swatch file and generate both SCSS and JS variables', async () => {

			const outputSwatch = 'test/tmp/a.aco';
			const outputScss = 'test/tmp/a.scss';
			const outputJs = 'test/tmp/a.js';

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js', '--swatch', 'test/fixtures/swatch-bw.aco', '--output', outputSwatch, '--scss', outputScss, '--js', outputJs])
					.end(() => {
						const swatchFileCreated = fs.existsSync(outputSwatch);
						const scssFileCreated = fs.existsSync(outputScss);
						const jsFileCreated = fs.existsSync(outputJs);
						expect(swatchFileCreated).to.equal(true);
						expect(scssFileCreated).to.equal(true);
						expect(jsFileCreated).to.equal(true);
						resolve();
					});
			});

		});

	});



	// // TODO: convert multiple swatches into multiple outputs, or combine multiple files into one output
	// describe('convert multiple swatch files', () => {
	//
	// 	beforeEach(async () => {
	// 		await remove('test/tmp');
	// 	});
	//
	// 	afterEach(async () => {
	// 		await remove('test/tmp');
	// 	});
	//
	// 	it.only('convert multiple swatch files, supplied as an argument', async () => {
	//
	// 		const output = 'test/tmp/a.aco';
	//
	// 		await new Promise((resolve, reject) => {
	// 			suppose('node', ['dist/cli.js', '--swatch', 'test/fixtures/swatch-bw.aco', '--output', output])
	// 				.end(() => {
	// 					const fileCreated = fs.existsSync(output);
	// 					expect(fileCreated).to.equal(true);
	// 					resolve();
	// 				});
	// 		});
	//
	// 	});
	//
	// });

});