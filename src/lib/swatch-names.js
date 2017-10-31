import namedColors from 'color-name-list';
import nearestColor from 'nearest-color';
import {remove as removeDiacritics} from 'diacritics';
import _ from 'lodash';

import {saveSwatch, saveFile} from './io';

export const FILE_HEADER = '// File auto generated by \'swatch-names\'. Do not modify this file directly.\n';

/**
 * Returns color names and hex values
 *
 * @param {string[]|string} hexValues - Array of hex values or one individual hex color: ['#ffffff', '#000000'] or '#ffffff'
 * @returns {Array} - Array of objects: [{name: 'red', hex: '#ff0000'}, ...]
 */
export const getColorNames = (hexValues) => {
	const allColors = [];

	let allColorNames = namedColors.reduce((result, c) => {
		result[c.name] = c.hex;
		return result;
	}, {});

	if (!hexValues.length) {
		throw new Error('Wrong argument: getColorNames() expects an array of hex values or a single hex color string.');
	}

	if (_.isString(hexValues)) {
		hexValues = [hexValues];
	}

	_.forEach(hexValues, (hex) => {
		if (!/^#[0-9A-F]{6}$/i.test(hex)) {
			throw new Error('Incorrect hex code supplied: ' + hex);
		}

		const nearestColorName = nearestColor.from(allColorNames);
		const foundColor = nearestColorName(hex);

		// Remove from allColorNames
		allColorNames = _.omit(allColorNames, foundColor.name);
		allColors.push({name: sanitizeColorName(foundColor.name), hex: hex.toUpperCase()});
	});

	return allColors;
};

/**
 * Processes the supplied swatch file, returns a swatch object, generates SCSS/JS source with color variables.
 *
 * @param swatchData - JSON data generated by acoReader
 * @returns {{colors: Array, scss: string, js: string}}
 */
export const processSwatch = swatchData => {
	const hexValues = swatchData.map(swatch => swatch.hex);
	const colors = getColorNames(hexValues);
	const scss = colors.reduce((result, color) => `${result}$${color.name}: '${color.hex}';\n`, FILE_HEADER);
	const jsData = colors.reduce((result, color) => `${result}\t${color.name.replace(/-/g, '_')}: '${color.hex}',\n`, '');
	const js = `${FILE_HEADER}export default {\n${jsData}};`;
	return {colors, scss, js};
};

/**
 * Removes special characters, spaces, diacritics from input string, ensures that the string doesn't start with a number
 *
 * @param {string} name - The input color name: "1975 Earth's Red"
 * @param {string} divider - Divider character that replaces spaces: "-"
 * @returns {string} - The sanitized name, ready to be used as a variable: "the-1975-earths-red"
 */
export const sanitizeColorName = (name, divider='-') => {
	return removeDiacritics(name.toLowerCase()).replace(/^(\d{1})(.*)/, 'the-$1$2').replace(/[^\w|\d|\s|-]/g, '').replace(/\s/g, divider);
};

