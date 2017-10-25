const fs = require('fs');

const PROTOCOL_SIZE = 1;
const NUMBER_OF_COLORS_SIZE = 1;
const HEADER_SIZE = PROTOCOL_SIZE + NUMBER_OF_COLORS_SIZE;
// v1 protocol number of chunks for one color.
const COLOR_SIZE = 5;

const extractPalette = (data) => {
	const parts = data.match(/.{1,4}/g);
	const [
		version,
		numberOfColorsHex,
		...rest
	] = parts;

	// Let's skip the v1 protocol.
	const numberOfColors =  parseInt(numberOfColorsHex, 16);
	const protocolOneSize = HEADER_SIZE + numberOfColors * COLOR_SIZE;
	const protocolTwoColorsChunks = rest.slice(protocolOneSize);

	function split(chunks) {

		const [colorSpace, w, x, y, z, , nameSizeHex, ...rest] = chunks;
		const nameSize = parseInt(nameSizeHex, 16);
		const name = rest.slice(0, nameSize - 1)
			.map(s => String.fromCharCode(parseInt(s.toString(16), 16)))
			.join('');

		const getHex = (color) => color.slice(0, 2);
		const hex = `#${getHex(w)}${getHex(x)}${getHex(y)}`;

		const color = {
			name,
			hex,
			w,
			x,
			y,
		};

		const nextColor = rest.slice(nameSize);

		return nextColor.length ?
			[color, ...split(nextColor)] : [color];
	}

	const palette = split(protocolTwoColorsChunks);

	// console.log(palette);

	return palette;
};

function toJSON(file, callback) {
	fs.readFile(
		file, 'hex',
		(error, data) => {
			return !error ?
				callback(null, extractPalette(data)) :
				callback(error)
		}
	);
};

module.exports = {
	toJSON,
};
