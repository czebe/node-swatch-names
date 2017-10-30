import {remove} from 'fs-extra';

import {saveFile} from '../src/lib/io';

describe('io', () => {

	before(() => {
		remove('test/tmp');
	});

	describe('saveFile()', () => {

		it.only('should save file with correct extension', async () => {
			await saveFile('', 'test/tmp/saved.aco')
		});

	});


});