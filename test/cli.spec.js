import {expect} from 'chai';
import suppose from 'suppose';
import fs, {remove} from 'fs-extra';
import _ from 'lodash';
import {underline, bgBlue, bold, whiteBright} from 'chalk';

import {MESSAGES} from '../src/lib/prompts';

const MOVEDOWN = (times = 1) => _.repeat('\x1B\x5B\x42', times); // Up: '\x1B\x5B\x41'
const ENTER = '\x0D';

describe(bgBlue.whiteBright('cli'), () => {

	describe(underline.bold('convert swatch file'), () => {

		beforeEach(async () => {
			await remove('test/tmp');
		});

		afterEach(async () => {
			await remove('test/tmp');
		});

		it('should exit if no swatch files found', async () => {

			process.chdir('./src');

			await new Promise((resolve, reject) => {
				suppose('node', ['../dist/cli.js'])
					.when(new RegExp(MESSAGES.specifyDifferentPath, 'i'), 'n' + ENTER)
					.end(() => {
						process.chdir('../');
						expect(true).to.equal(true);
						resolve();
					});
			});

		});


		it('should request new path if no swatch files found', async () => {

			process.chdir('./src');

			await new Promise((resolve, reject) => {
				suppose('node', ['../dist/cli.js'])
					.when(new RegExp(MESSAGES.specifyDifferentPath, 'i'), ENTER)
					.when(new RegExp(MESSAGES.pathToYourSwatches, 'i'), '../test' + ENTER)
					.end(() => {
						process.chdir('../');
						expect(true).to.equal(true);
						resolve();
					});
			});

		});

		it('should convert an individual swatch file', async () => {

			const output = 'test/tmp/a.aco';
			const outputScss = 'test/tmp/a.scss';
			const outputJs = 'test/tmp/a.js';

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js'])
					.when(new RegExp(MESSAGES.swatchFileToProcess, 'i'), ENTER)
					.when(new RegExp(MESSAGES.confirmOverwrite, 'i'), 'n' + ENTER)
					.when(new RegExp(MESSAGES.outputPath, 'i'), output + ENTER)
					.when(new RegExp(MESSAGES.saveScss, 'i'), outputScss + ENTER)
					.when(new RegExp(MESSAGES.saveJs, 'i'), outputJs + ENTER)
					.end(() => {
						const acoCreated = fs.existsSync(output);
						const scssCreated = fs.existsSync(outputScss);
						const jsCreated = fs.existsSync(outputJs);
						expect(acoCreated).to.equal(true);
						expect(scssCreated).to.equal(true);
						expect(jsCreated).to.equal(true);
						resolve();
					});
			});

		});

		it('should convert and overwrite an individual swatch file', async () => {

			const fileName = 'test/fixtures/swatch-overwrite.aco';
			const startTime = fs.statSync(fileName).mtime;

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js'])
					.when(new RegExp(MESSAGES.swatchFileToProcess, 'i'), MOVEDOWN(2) + ENTER)
					.when(new RegExp(MESSAGES.confirmOverwrite, 'i'), 'y' + ENTER)
					.end(() => {
						const modifiedTime = fs.statSync(fileName).mtime;
						expect(modifiedTime).to.not.equal(startTime);
						resolve();
					});
			});

		});

		it('should convert an individual swatch file, supplied as an argument', async () => {

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

		it('should convert multiple swatch files, combined into a single output', async () => {

			const output = 'test/tmp/a.aco';

			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js', '--swatch', 'test/fixtures/swatch-bw.aco', '--swatch', 'test/fixtures/swatch-hsb.aco', '--output', output, '--scss', 'test/tmp/a.scss', '--js', 'test/tmp/a.js'])
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

		it('should convert an individual swatch file and generate SCSS variables', async () => {

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

		it('should convert an individual swatch file and generate JS variables', async () => {

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

		it('should convert an individual swatch file and generate both SCSS and JS variables', async () => {

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


	// TODO: convert multiple swatches into multiple outputs, or combine multiple files into one output

});