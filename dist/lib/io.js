'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.saveFile = exports.saveSwatch = exports.listAcoFiles = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _chalk = require('chalk');

var _acoWriter = require('./acoWriter');

var _acoWriter2 = _interopRequireDefault(_acoWriter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const listAcoFiles = exports.listAcoFiles = root => {
	const pattern = '**/*.aco';
	const ignore = ['**/node_modules/**'];

	return new Promise((resolve, reject) => {
		(0, _glob2.default)(pattern, { root, ignore }, (err, files) => {
			if (err) return reject(err);
			resolve(files);
		});
	});
};

const saveSwatch = exports.saveSwatch = (fileName, colors) => {
	return new Promise((resolve, reject) => {
		_acoWriter2.default.make(fileName, colors, function (err, aco) {
			if (err) return reject(err);
			aco.on('finish', function () {
				console.log(_chalk.green.bold('Swatch file saved to: ' + aco.path));
				resolve();
			});
		});
	});
};

const saveFile = exports.saveFile = (data, file, message) => {
	return new Promise((resolve, reject) => {
		_fs2.default.writeFile(file, data, err => {
			if (err) return reject(err);
			console.log(_chalk.green.bold(message + file));
			resolve();
		});
	});
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW8uanMiXSwibmFtZXMiOlsibGlzdEFjb0ZpbGVzIiwicm9vdCIsInBhdHRlcm4iLCJpZ25vcmUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImVyciIsImZpbGVzIiwic2F2ZVN3YXRjaCIsImZpbGVOYW1lIiwiY29sb3JzIiwibWFrZSIsImFjbyIsIm9uIiwiY29uc29sZSIsImxvZyIsImJvbGQiLCJwYXRoIiwic2F2ZUZpbGUiLCJkYXRhIiwiZmlsZSIsIm1lc3NhZ2UiLCJ3cml0ZUZpbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVPLE1BQU1BLHNDQUFnQkMsSUFBRCxJQUFVO0FBQ3JDLE9BQU1DLFVBQVUsVUFBaEI7QUFDQSxPQUFNQyxTQUFTLENBQ2Qsb0JBRGMsQ0FBZjs7QUFJQSxRQUFPLElBQUlDLE9BQUosQ0FBWSxDQUFDQyxPQUFELEVBQVVDLE1BQVYsS0FBcUI7QUFDdkMsc0JBQUtKLE9BQUwsRUFBYyxFQUFDRCxJQUFELEVBQU9FLE1BQVAsRUFBZCxFQUE4QixDQUFDSSxHQUFELEVBQU1DLEtBQU4sS0FBZ0I7QUFDN0MsT0FBSUQsR0FBSixFQUFTLE9BQU9ELE9BQU9DLEdBQVAsQ0FBUDtBQUNURixXQUFRRyxLQUFSO0FBQ0EsR0FIRDtBQUlBLEVBTE0sQ0FBUDtBQU1BLENBWk07O0FBY0EsTUFBTUMsa0NBQWEsQ0FBQ0MsUUFBRCxFQUFXQyxNQUFYLEtBQXNCO0FBQy9DLFFBQU8sSUFBSVAsT0FBSixDQUFZLENBQUNDLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtBQUN2QyxzQkFBVU0sSUFBVixDQUFlRixRQUFmLEVBQXlCQyxNQUF6QixFQUFpQyxVQUFTSixHQUFULEVBQWNNLEdBQWQsRUFBbUI7QUFDbkQsT0FBSU4sR0FBSixFQUFTLE9BQU9ELE9BQU9DLEdBQVAsQ0FBUDtBQUNUTSxPQUFJQyxFQUFKLENBQU8sUUFBUCxFQUFpQixZQUFXO0FBQzNCQyxZQUFRQyxHQUFSLENBQVksYUFBTUMsSUFBTixDQUFXLDJCQUEyQkosSUFBSUssSUFBMUMsQ0FBWjtBQUNBYjtBQUNBLElBSEQ7QUFJQSxHQU5EO0FBT0EsRUFSTSxDQUFQO0FBU0EsQ0FWTTs7QUFZQSxNQUFNYyw4QkFBVyxDQUFDQyxJQUFELEVBQU9DLElBQVAsRUFBYUMsT0FBYixLQUF5QjtBQUNoRCxRQUFPLElBQUlsQixPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQ3ZDLGVBQUdpQixTQUFILENBQWFGLElBQWIsRUFBbUJELElBQW5CLEVBQTBCYixHQUFELElBQVM7QUFDakMsT0FBSUEsR0FBSixFQUFTLE9BQU9ELE9BQU9DLEdBQVAsQ0FBUDtBQUNUUSxXQUFRQyxHQUFSLENBQVksYUFBTUMsSUFBTixDQUFXSyxVQUFVRCxJQUFyQixDQUFaO0FBQ0FoQjtBQUNBLEdBSkQ7QUFLQSxFQU5NLENBQVA7QUFPQSxDQVJNIiwiZmlsZSI6ImlvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IHsgZ3JlZW4gfSBmcm9tICdjaGFsayc7XG5pbXBvcnQgYWNvV3JpdGVyIGZyb20gJy4vYWNvV3JpdGVyJztcblxuZXhwb3J0IGNvbnN0IGxpc3RBY29GaWxlcyA9IChyb290KSA9PiB7XG5cdGNvbnN0IHBhdHRlcm4gPSAnKiovKi5hY28nO1xuXHRjb25zdCBpZ25vcmUgPSBbXG5cdFx0JyoqL25vZGVfbW9kdWxlcy8qKidcblx0XTtcblxuXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdGdsb2IocGF0dGVybiwge3Jvb3QsIGlnbm9yZX0sIChlcnIsIGZpbGVzKSA9PiB7XG5cdFx0XHRpZiAoZXJyKSByZXR1cm4gcmVqZWN0KGVycik7XG5cdFx0XHRyZXNvbHZlKGZpbGVzKTtcblx0XHR9KVxuXHR9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzYXZlU3dhdGNoID0gKGZpbGVOYW1lLCBjb2xvcnMpID0+IHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRhY29Xcml0ZXIubWFrZShmaWxlTmFtZSwgY29sb3JzLCBmdW5jdGlvbihlcnIsIGFjbykge1xuXHRcdFx0aWYgKGVycikgcmV0dXJuIHJlamVjdChlcnIpO1xuXHRcdFx0YWNvLm9uKCdmaW5pc2gnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZ3JlZW4uYm9sZCgnU3dhdGNoIGZpbGUgc2F2ZWQgdG86ICcgKyBhY28ucGF0aCkpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2F2ZUZpbGUgPSAoZGF0YSwgZmlsZSwgbWVzc2FnZSkgPT4ge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdGZzLndyaXRlRmlsZShmaWxlLCBkYXRhLCAoZXJyKSA9PiB7XG5cdFx0XHRpZiAoZXJyKSByZXR1cm4gcmVqZWN0KGVycik7XG5cdFx0XHRjb25zb2xlLmxvZyhncmVlbi5ib2xkKG1lc3NhZ2UgKyBmaWxlKSk7XG5cdFx0XHRyZXNvbHZlKCk7XG5cdFx0fSk7XG5cdH0pO1xufTsiXX0=