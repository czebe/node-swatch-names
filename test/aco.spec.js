import {expect} from 'chai';
import {underline, bgBlue, bold, whiteBright} from 'chalk';

import {readFile} from '../src/lib/io';
import {encode, decode} from '../src/lib/aco';

describe(bgBlue(whiteBright('aco')), () => {

	let swatch, decoded;

	describe(underline(bold('decoding RGB swatches')), async () => {

		before(async () => {
			swatch = await readFile('test/fixtures/swatch-bw.aco');
			decoded = decode(swatch);
		});

		it('should decode binary data from .aco file', () => {
			expect(decoded[0].name).to.equal('Black');
			expect(decoded[0].hex).to.equal('#000000');
			expect(decoded[1].name).to.equal('White');
			expect(decoded[1].hex).to.equal('#FFFFFF');
		});

		it('should decode RGB values from .aco file', () => {
			expect(decoded[1].r).to.equal(255);
			expect(decoded[1].g).to.equal(255);
			expect(decoded[1].b).to.equal(255);
		});

	});

	describe(underline(bold('decoding HSB swatches')), async () => {

		before(async () => {
			swatch = await readFile('test/fixtures/swatch-hsb.aco');
			decoded = decode(swatch);
		});

		it('should decode HSB swatches from .aco file', async () => {
			expect(decoded[0].name).to.equal('Swatch 1');
			expect(decoded[0].hex).to.equal('#5AD1F2');
		});

	});

	describe(underline(bold('decoding LAB swatches')), async () => {

		before(async () => {
			swatch = await readFile('test/fixtures/swatch-lab.aco');
		});

		it('should throw an error for unsupported color space', async () => {
			expect(() => decode(swatch)).to.throw();
		});

	});

	describe(underline(bold('encoding')), async () => {

		before(async () => {
			swatch = await readFile('test/fixtures/swatch-bw.aco');
		});

		it('should generate binary data from JSON data', () => {
			const colors = [
				{name: 'Black', hex: '#000000'},
				{name: 'White', hex: '#fff'}
			];
			const encoded = encode(colors);
			expect(encoded.toString('hex')).to.equal(swatch.toString('hex'));
		});

		it('should default to [0, 0, 0] when supplied with wrong hex code', () => {
			const encoded = encode([{name: 'foo', hex: '#eeeee'}]);
			const blackEncoded = encode([{name: 'foo', hex: '#000000'}]);
			expect(encoded.toString('hex')).to.equal(blackEncoded.toString('hex'));
		});

		it('should throw an error when supplied with a wrong argument type', () => {
			expect(() => encode({name: 'Black', color: '#000000'})).to.throw();
			expect(() => encode('#ffffff')).to.throw();
			expect(() => encode([])).to.throw();
		});

	});
});