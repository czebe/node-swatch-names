import {expect} from 'chai';
import {underline, bgBlue, bold, whiteBright} from 'chalk';

import * as Prompts from '../src/lib/prompts';

describe(bgBlue.whiteBright('prompts'), () => {

	let question;
	const noSave = 'no save';
	const root = process.cwd();

	describe(underline.bold('newPath'), () => {

		before(() => {
			question = Prompts.newPath();
		});

		it('should be presented when not overwriting', () => {
			const when = question.when({differentPath: true});
			expect(when).to.be.equal(true);
		});

		it('should not be presented when overwriting', () => {
			const when = question.when({differentPath: false});
			expect(when).to.be.equal(false);
		});

	});

	describe(underline.bold('swatch'), () => {

		before(() => {
			question = Prompts.swatch(['test/aaa.aco', 'test/bbb.aco', 'test/aab.aco']);
		});

		it('should list all files when no input is given', async () => {
			const source = await question.source(null, '');
			expect(source.length).to.be.equal(3);
		});

		it('should list only files that match the input', async () => {
			const source = await question.source(null, 'aa');
			expect(source.length).to.be.equal(2);
		});

		it('should not list anything if no match is found', async () => {
			const source = await question.source(null, 'xxx');
			expect(source.length).to.be.equal(0);
		});

	});

	describe(underline.bold('outputPath'), () => {

		before(() => {
			question = Prompts.outputPath();
		});

		it('should be presented when not overwriting', () => {
			const when = question.when({overwrite: false});
			expect(when).to.be.equal(true);
		});

		it('should not be presented when overwriting', () => {
			const when = question.when({overwrite: true});
			expect(when).to.be.equal(false);
		});

	});

	describe(underline.bold('scssPath'), () => {

		before(() => {
			question = Prompts.scssPath(undefined, noSave);
		});

		it('should allow empty response', () => {
			const validInput = question.validate(root);
			expect(validInput).to.be.equal(true);
		});

		it('should allow valid filename', () => {
			const validInput = question.validate('test/tmp/colors.scss');
			expect(validInput).to.be.equal(true);
		});

		it('should reject incorrect filename', () => {
			const inValidInput = question.validate('test/tmp/colors.css');
			expect(inValidInput).to.be.equal(Prompts.MESSAGES.incorrectScssPath);
		});

		it('should fill in "no save" when left empty', () => {
			const filtered = question.filter(root);
			expect(filtered).to.be.equal(noSave);
		});

		it('should return correct path when supplied', () => {
			const fileName = 'test/tmp/aaa.scss';
			const filtered = question.filter(fileName);
			expect(filtered).to.be.equal(fileName);
		});

	});

	describe(underline.bold('jsPath'), () => {

		before(() => {
			question = Prompts.jsPath(root, noSave);
		});

		it('should allow empty response', () => {
			const validInput = question.validate(root);
			expect(validInput).to.be.equal(true);
		});

		it('should allow valid filename', () => {
			const validInput = question.validate('test/tmp/colors.js');
			expect(validInput).to.be.equal(true);
		});

		it('should reject incorrect filename', () => {
			const inValidInput = question.validate('test/tmp/colors.jsx');
			expect(inValidInput).to.be.equal(Prompts.MESSAGES.incorrectJsPath);
		});

		it('should fill in "no save" when left empty', () => {
			const filtered = question.filter(root);
			expect(filtered).to.be.equal(noSave);
		});

		it('should return correct path when supplied', () => {
			const fileName = 'test/tmp/aaa.js';
			const filtered = question.filter(fileName);
			expect(filtered).to.be.equal(fileName);
		});

	});


});