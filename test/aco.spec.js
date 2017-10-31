import {expect} from 'chai';

import {readFile} from '../src/lib/io';
import {encode, decode} from '../src/lib/aco';

describe('aco', () => {

	let swatchBw;

	before(async () => {
		swatchBw = await readFile('test/fixtures/swatch-bw.aco');
	});

	describe('decoding', async () => {

		let decoded;

		before(() => {
			decoded = decode(swatchBw);
		});

		it('should decode binary data from .aco file', () => {
			expect(decoded[0].name).to.equal('Black');
			expect(decoded[0].hex).to.equal('#000000');
			expect(decoded[1].name).to.equal('White');
			expect(decoded[1].hex).to.equal('#ffffff');
		});

		it('should decode RGB values from .aco file', () => {
			expect(decoded[1].r).to.equal(255);
			expect(decoded[1].g).to.equal(255);
			expect(decoded[1].b).to.equal(255);
		});

	});

	describe('encoding', async () => {

		it('should generate binary data from JSON data', () => {
			const colors = [
				{name: 'Black', color: '#000000'},
				{name: 'White', color: '#ffffff'}
			];
			const encoded = encode(colors);
			expect(encoded.toString('hex')).to.equal(swatchBw.toString('hex'));
		});

		it('should throw an error when supplied with a wrong argument type', () => {
			expect(() => encode({name: 'Black', color: '#000000'})).to.throw();
			expect(() => encode('#ffffff')).to.throw();
			expect(() => encode([])).to.throw();
		});

	});
});