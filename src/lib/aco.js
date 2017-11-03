import convert from 'color-convert';
import _ from 'lodash';

const PROTOCOL_SIZE = 1;
const NUMBER_OF_COLORS_SIZE = 1;
const HEADER_SIZE = PROTOCOL_SIZE + NUMBER_OF_COLORS_SIZE;
const COLOR_SIZE = 5;
const COLOR_MODES = {
	rgb: 0,
	hsb: 1
};

// ### DECODING ###

/**
 * Decodes ACO file
 *
 * @param data - A Buffer with the swatch file contents
 * @returns {Array} - Array of decoded color swatches: [{name: 'red', hex: '#ff0000', r: 255, g: 0, b: 0}, ...]
 */
const decode = (data) => {
	const parts = data.match(/.{1,4}/g);
	const [version, numberOfColorsHex, ...rest] = parts;

	// Let's skip the v1 protocol.
	const numberOfColors =  parseInt(numberOfColorsHex, 16);
	const protocolOneSize = HEADER_SIZE + numberOfColors * COLOR_SIZE;
	const protocolTwoColorsChunks = rest.slice(protocolOneSize);

	function split(chunks) {

		let getHex, hex, rgb;

		const [colorSpace, w, x, y, z, , nameSizeHex, ...rest] = chunks;
		const nameSize = parseInt(nameSizeHex, 16);
		const name = rest.slice(0, nameSize - 1)
			.map(s => String.fromCharCode(parseInt(s.toString(16), 16)))
			.join('');

		const mode = parseInt(colorSpace, 16);
		switch (mode) {
			case COLOR_MODES.rgb:
				getHex = (color) => _.padStart(Math.floor(parseInt(color, 16) / 256).toString(16), 2, '0');
				hex = `#${getHex(w)}${getHex(x)}${getHex(y)}`;
				rgb = convert.hex.rgb(hex);
				break;

			case COLOR_MODES.hsb:
				const h = parseInt(w, 16) / 182.04;
				const s = parseInt(x, 16) / 655.35;
				const v = parseInt(y, 16) / 655.35;

				rgb = convert.hsv.rgb([h, s, v]);
				hex = '#' + convert.rgb.hex(rgb);
				break;

			default:
				throw new Error('Unsupported color mode. Make sure you create your swatches as RGB or HSB values in Photoshop.');

		}

		hex = hex.toUpperCase();

		const [r, g, b] = rgb;
		const color = {name, hex, r, g, b};
		const nextColor = rest.slice(nameSize);

		return nextColor.length ? [color, ...split(nextColor)] : [color];
	}

	return split(protocolTwoColorsChunks);
};


// ### ENCODING ###

//ACO files take 16 bit words.
const writeValue = (value) => {
	const buffer = Buffer.alloc(2);
	buffer.writeUInt16BE(value, 0);
	return buffer;
};

//Convenient way to write RGB integer values. Expected with this multiplier.
const writeRGBValue = (value) => {
	return writeValue(value < 128 ? value * 256 : 255 + value * 256);
};

const hexToRgb = (hex) => {

	const match = hex.toString(16).match(/^#([a-f0-9]{6}|[a-f0-9]{3})$/i);

	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[1];

	// Parse short version hex format also
	if (colorString.length === 3) {
		colorString = colorString.split('').map(char => char + char).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

const writeColors = (colors, writeNames = false) => {

	let buffer = Buffer.alloc(0);

	colors.forEach((color) => {
		try {
			const hex = color.hex;
			const name = color.name || hex;

			//Parse RGB
			const rgb = hexToRgb(hex).filter((value) => !isNaN(value));

			buffer = Buffer.concat([buffer, writeValue(0)]); //Write 0, for RGB color space
			rgb.forEach((c) => buffer = Buffer.concat([buffer, writeRGBValue(c)]));
			buffer = Buffer.concat([buffer, writeValue(0)]); //Pad (we need w, x, y, and z values. RGB only has w, x, y - so z is zero.

			// Only required in v2 ACO
			if (writeNames) {
				buffer = Buffer.concat([buffer, writeValue(0)]);
				buffer = Buffer.concat([buffer, writeValue(name.length + 1)]);
				[...name].forEach((s) => buffer = Buffer.concat([buffer, writeValue(s.charCodeAt(0))]));
				buffer = Buffer.concat([buffer, writeValue(0)]);
			}
		} catch (e) {
			throw e;
		}
	});

	return buffer;
};

const encode = (colors) => {

	if (!Array.isArray(colors) || !colors.length) {
		throw new Error('Invalid argument supplied to encode(), expecting an array of objects: [{name: "color-name", hex: "#ffff00"}, ...]');
	}

	let aco = Buffer.alloc(0);

	// Write version 1 ACO
	aco = Buffer.concat([aco, writeValue(1)]);
	aco = Buffer.concat([aco, writeValue(colors.length)]);
	aco = Buffer.concat([aco, writeColors(colors)]);

	// Version 2 ACO
	aco = Buffer.concat([aco, writeValue(2)]);
	aco = Buffer.concat([aco, writeValue(colors.length)]);
	aco = Buffer.concat([aco, writeColors(colors, true)]);

	return aco;
};

export {decode, encode};
