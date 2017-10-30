import {expect} from 'chai';
import fs, {remove} from 'fs-extra';

import {saveFile, readFile} from '../src/lib/io';

describe('io', () => {

	describe('saveFile()', () => {

		beforeEach(async () => {
			await remove('test/tmp');
		});

		after(async () => {
			await remove('test/tmp');
		});

		it('should save file with correct extension', async () => {
			const fileName = 'test/tmp/saved.aco';
			await saveFile('', fileName);
			const fileExists = fs.existsSync(fileName);
			expect(fileExists).to.equal(true);
		});

	});

	describe('readFile()', () => {

		it('should read the required binary file', async () => {
			const data = await readFile('test/fixtures/swatch-bw.aco');
			expect(data.length).to.equal(160);
		});

		it('should reject when file doesn\'t exist', async () => {
			await readFile('test/fixtures/swatch-foo.aco')
				.then(() => {
					throw new Error('read was not supposed to succeed');
				})
				.catch((err) => {
					expect(err).to.be.an('error');
				});
		});

	});

});