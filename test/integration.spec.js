import {expect} from 'chai';
import suppose from 'suppose';
import {remove} from 'fs-extra';
import {underline, bgBlue, bold, whiteBright} from 'chalk';

import {readFile, saveFile} from '../src/lib/io';
import {decode, encode} from '../src/lib/aco';
import {getColorNames, sanitizeColorName} from '../src/lib/swatch-names';

describe(bgBlue.whiteBright('integration'), () => {

	describe(underline.bold('convert a complex swatch'), () => {

		let swatch, decoded;
		const outputSwatch = 'test/tmp/a.aco';

		before(async () => {
			await remove('test/tmp');
			await new Promise((resolve, reject) => {
				suppose('node', ['dist/cli.js', '--swatch', 'test/fixtures/swatch-sn.aco', '--output', outputSwatch])
					.end(resolve);
			});

			swatch = await readFile(outputSwatch);
			decoded = decode(swatch);
		});

		after(async () => {
			await remove('test/tmp');
		});

		it('should convert and decode complex .aco file', () => {
			expect(decoded[0].name).to.equal('turquoise-sea');
			expect(decoded[0].hex).to.equal('#59CFF1');

			expect(decoded[1].name).to.equal('pattens-blue');
			expect(decoded[1].hex).to.equal('#D2E7EF');

			expect(decoded[2].name).to.equal('smoky-blue');
			expect(decoded[2].hex).to.equal('#6F97A8');

			expect(decoded[3].name).to.equal('outback');
			expect(decoded[3].hex).to.equal('#C6A376');

			expect(decoded[4].name).to.equal('ambrosia-salad');
			expect(decoded[4].hex).to.equal('#F4DCD3');

			expect(decoded[5].name).to.equal('sunlight');
			expect(decoded[5].hex).to.equal('#ECD7A0');

			expect(decoded[6].name).to.equal('pale-prim');
			expect(decoded[6].hex).to.equal('#FBF6A2');

			expect(decoded[7].name).to.equal('light-hot-pink');
			expect(decoded[7].hex).to.equal('#FCABDE');
		});

	});

	describe(underline.bold('use as a library for color naming'), () => {

		it('should convert list of hex codes to properly named JS object', () => {
			const colors = getColorNames(['#59CFF1', '#D2E7EF', '#6F97A8', '#C6A376']);
			expect(colors[0].name).to.equal('turquoise-sea');
			expect(colors[1].name).to.equal('pattens-blue');
			expect(colors[2].name).to.equal('smoky-blue');
			expect(colors[3].name).to.equal('outback');
		});

	});

});