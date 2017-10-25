// https://raw.githubusercontent.com/lemieuxster/node-aco/master/aco.js
// http://www.nomodes.com/aco.html

var fs = require('fs');
var colorException = {};

//ACO files take 16 bit words.
function writeValue(writeStream, value) {
	var buffer = Buffer.alloc(2);

	buffer.writeUInt16BE(value, 0);
	writeStream.write(buffer);
}

//Convenient way to write RGB integer values. Expected with this multiplier.
function writeRGBValue(writeStream, value) {
	writeValue(writeStream, value < 128 ? value * 256 : 255 + value * 256);
}

//Convenient for adding zero
function writeZero(writeStream) {
	writeValue(writeStream, 0);
}

function sanitizeFilename(filename) {
	filename = filename || 'aco-' + new Date() + '.aco';
	if (filename.lastIndexOf('.aco') !== filename.length - 4) filename = filename + '.aco';
	return filename;
}

function hexToRgb(hex) {
	var match = hex.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

function writeColors(aco, colors, writeNames) {
	colors.forEach(function(colorInfo) {
		try {
			var hex = colorInfo.color;
			var name = colorInfo.name || hex;

			//Parse RGB
			var rgb = hexToRgb(hex);
			rgb = rgb.filter(function(value) {
				return !isNaN(value);
			});

			//Make sure we have valid values
			if (rgb.length < 3) {
				throw colorException;
			}

			writeZero(aco); //Write 0, for RGB color space
			writeRGBValue(aco, rgb[0]); //R
			writeRGBValue(aco, rgb[1]); //G
			writeRGBValue(aco, rgb[2]); //B
			writeZero(aco); //Pad (we need w, x, y, and z values. RGB only has w, x, y - so z is zero.

			// Only required in v2 ACO
			if (writeNames) {
				writeZero(aco);
				writeValue(aco, name.length + 1);
				for (var i = 0, l = name.length; i < l; i++) {
					writeValue(aco, name.charCodeAt(i));
				}
				writeZero(aco);
			}
		} catch (e) {
			var error = "Parse Error";
			if (e === colorException) {
				error = "Invalid Color";
			}

			if (callback && 'function' === typeof callback) {
				callback(error);
			} else {
				throw new Error(error);
			}
		}

	});
}

exports.make = function(filename, colors, callback) {
	filename = sanitizeFilename(filename);

	colors = colors instanceof Array ? colors : [];

	var aco = fs.createWriteStream(filename);

	// Write version 1 ACO
	writeValue(aco, 1);
	writeValue(aco, colors.length);
	writeColors(aco, colors, false);

	// Version 2 ACO
	writeValue(aco, 2);
	writeValue(aco, colors.length);
	writeColors(aco, colors, true);

	aco.end();

	if (callback && 'function' === typeof callback) {
		callback(null, aco);
	}
};