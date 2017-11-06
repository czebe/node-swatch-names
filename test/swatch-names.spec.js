import {expect} from 'chai';
import colorList from 'color-name-list';
import {underline, bgBlue, bold, whiteBright} from 'chalk';
import _ from 'lodash';

import {getColorNames, processSwatch, sanitizeColorName, FILE_HEADER} from '../src/lib/swatch-names';

describe(bgBlue(whiteBright('swatch-names')), () => {

	describe(underline(bold('sanitizeColorName()')), () => {

		it('should replace leading number', () => {
			expect(sanitizeColorName('1975 Earth Red')).to.equal('the-1975-earth-red');
		});

		it('should remove punctuation marks', () => {
			expect(sanitizeColorName('Earth\'s Red! Ready? Yes. 9%')).to.equal('earths-red-ready-yes-9');
		});

		it('should remove diacritics', () => {
			expect(sanitizeColorName('Âbi Preußen Zǐ Lúo Lán Sè')).to.equal('abi-preussen-zi-luo-lan-se');
		});

		it('should replace spaces with custom character', () => {
			expect(sanitizeColorName('Yuè Guāng Lán Moonlight', '_')).to.equal('yue_guang_lan_moonlight');
		});

	});

	describe(underline(bold('getColorNames()')), () => {

		it('should return correct color names for hex color codes', () => {
			const colors = _.map(_.sampleSize(colorList, 50), c => ({name: sanitizeColorName(c.name), hex: c.hex.toUpperCase()}));
			const namedColors = getColorNames(colors.map((c) => c.hex));

			expect(namedColors).to.deep.equal(colors);
			expect(getColorNames('#B78727')).to.deep.equal([{name: 'university-of-california-gold', hex: '#B78727'}]);
		}).timeout(5000);

		it('should return correct color names for short hex format', () => {
			expect(getColorNames(['#fff'])).to.deep.equal([{name: 'white', hex: '#FFFFFF'}]);
		});

		it('should throw an error when incorrect hex code or wrong argument type is supplied', () => {
			expect(() => getColorNames(['#fffff'])).to.throw();
			expect(() => getColorNames(['#gg0101'])).to.throw();
			expect(() => getColorNames(['ffffff'])).to.throw();
			expect(() => getColorNames('ffffff')).to.throw();
			expect(() => getColorNames('')).to.throw();
			expect(() => getColorNames([])).to.throw();
			expect(() => getColorNames({hex: '#ffffff'})).to.throw();
		});

	});

	describe(underline(bold('processSwatch()')), () => {

		let colors, processed;

		before(() => {
			colors = _.map(_.sampleSize(colorList, 10), c => ({name: sanitizeColorName(c.name), hex: c.hex.toUpperCase()}));
			processed = processSwatch(_.map(colors, c => ({hex: c.hex})));
		});

		it('should generate valid color names', () => {
			expect(processed.colors).to.deep.equal(colors);
		});

		it('should generate SCSS variables', () => {
			expect(processed.scss).to.include(FILE_HEADER);
			expect(processed.scss).to.include(`$${colors[0].name}: '${colors[0].hex}'`);
			expect(processed.scss).to.include(`$${colors[colors.length - 1].name}: '${colors[colors.length - 1].hex}'`);
		});

		it('should generate JS variables', () => {
			expect(processed.js).to.include(FILE_HEADER);
			expect(processed.js).to.include('export default {');
			expect(processed.js).to.include(`${colors[0].name.replace(/-/g, '_')}: '${colors[0].hex}',`);
			expect(processed.js).to.include(`${colors[colors.length - 1].name.replace(/-/g, '_')}: '${colors[colors.length - 1].hex}'`);
			expect(processed.js).to.include('}');
		});

	});

});