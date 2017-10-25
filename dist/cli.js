#!/usr/bin/env node
'use strict';

var _path = require('path');

var _chalk = require('chalk');

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _inquirerAutocompletePrompt = require('inquirer-autocomplete-prompt');

var _inquirerAutocompletePrompt2 = _interopRequireDefault(_inquirerAutocompletePrompt);

var _inquirerPath = require('inquirer-path');

var _writePkg = require('write-pkg');

var _writePkg2 = _interopRequireDefault(_writePkg);

var _readPkgUp = require('read-pkg-up');

var _readPkgUp2 = _interopRequireDefault(_readPkgUp);

var _meow = require('meow');

var _meow2 = _interopRequireDefault(_meow);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _prompts = require('./lib/prompts');

var Prompts = _interopRequireWildcard(_prompts);

var _swatchNames = require('./lib/swatch-names');

var _io = require('./lib/io');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/* eslint-disable no-console */

const cli = (0, _meow2.default)(`
	Usage
		$ swatch-names [options]
		
	Options
		--init Performs adding watch script only, modifies package.json
		--swatch [path] Converts the specified swatch file
		--scss [path] Saves SCSS color names to the specified file
		--js [path] Saves JS color names to the specified file
		
	Examples
		$ swatch-names
		$ swatch-names --init
		$ swatch-names --swatch swatches.aco
		$ swatch-names --swatch swatches.aco --scss swatches.scss
		$ swatch-names --swatch swatches.aco --scss swatches.scss --js swatches.js
		$ swatch-names --swatch swatches.aco --swatch swatches2.aco --swatch swatches3.aco --scss swatches.scss --js swatches.js
		
`);

const root = process.cwd();
_inquirer2.default.registerPrompt('path', _inquirerPath.PathPrompt);
_inquirer2.default.registerPrompt('autocomplete', _inquirerAutocompletePrompt2.default);

const convertSwatch = (() => {
	var _ref = _asyncToGenerator(function* (skipInit) {
		const spinner = (0, _ora2.default)(`Scanning ${(0, _chalk.green)(root)} for swatch files (*.aco)...`).start();
		const files = yield (0, _io.listAcoFiles)(root);
		spinner.stop();

		if (!files.length) {
			console.log(_chalk.red.bold('\nNo swatch files found under the current directory.\n'));
			_inquirer2.default.prompt([Prompts.differentPath, Prompts.newPath(root)]).then(function (answers) {
				if (answers.newPath) {
					convertSwatches(answers.newPath);
				} else {
					return process.exit(1);
				}
			});
		} else {
			// Found some *.aco files, convert them
			_inquirer2.default.prompt([Prompts.swatch(files)]).then(function (answers) {
				const swatchFile = answers.swatch;
				_inquirer2.default.prompt([Prompts.overwrite, Prompts.outputPath((0, _path.join)((0, _path.dirname)(swatchFile), (0, _path.basename)(swatchFile, (0, _path.extname)(swatchFile)) + '-named.aco')), Prompts.initialize(skipInit)]).then(function (answers) {
					const output = answers.overwrite ? swatchFile : answers.outputPath;
					(0, _swatchNames.processSwatch)(swatchFile, null, null, output).then(function () {
						if (answers.initialize) {
							initializeWatcher(swatchFile);
						}
					});
				});
			});
		}
	});

	return function convertSwatch(_x) {
		return _ref.apply(this, arguments);
	};
})();

const initializeWatcher = (() => {
	var _ref2 = _asyncToGenerator(function* (fileName) {

		let files;

		if (fileName) {
			console.log(`Installing watch script for ${(0, _chalk.green)(fileName)}...`);
		} else {
			files = yield (0, _io.listAcoFiles)(root);
		}

		const noSave = 'Don\'t save.';

		_inquirer2.default.prompt([Prompts.swatch(files, fileName), Prompts.scssPath(root, noSave), Prompts.jsPath(root, noSave)]).then(function (answers) {

			(0, _readPkgUp2.default)().then(function (result) {
				const pkg = result.pkg,
				      path = result.path;


				fileName = (0, _path.relative)((0, _path.dirname)(path), fileName || answers.swatch);

				const scripts = pkg.scripts || {};
				const swatchesScripts = scripts['swatches'] || 'swatch-names';

				const watch = pkg.watch || {};
				const swatchesWatch = watch['swatches'] || [];
				const swatchesArgs = (0, _minimist2.default)(swatchesScripts.split(' '));

				if (!swatchesArgs.swatch) {
					swatchesArgs.swatch = [];
				} else if (!_lodash2.default.isArray(swatchesArgs.swatch)) {
					swatchesArgs.swatch = [swatchesArgs.swatch];
				}

				if (!_lodash2.default.includes(swatchesArgs.swatch, fileName)) {
					swatchesArgs.swatch.push(fileName);
				}

				if (answers.scssPath && answers.scssPath !== noSave) {
					const scssPath = (0, _path.relative)(root, answers.scssPath);
					if (!swatchesArgs.scss) {
						swatchesArgs.scss = [scssPath];
					} else if (!_lodash2.default.isArray(swatchesArgs.scss)) {
						swatchesArgs.scss = [swatchesArgs.scss];
					}

					if (!_lodash2.default.includes(swatchesArgs.scss, scssPath)) {
						swatchesArgs.scss.push(scssPath);
					}
				}

				if (answers.jsPath && answers.jsPath !== noSave) {
					const jsPath = (0, _path.relative)(root, answers.jsPath);
					if (!swatchesArgs.js) {
						swatchesArgs.js = [jsPath];
					} else if (!_lodash2.default.isArray(swatchesArgs.js)) {
						swatchesArgs.js = [swatchesArgs.js];
					}

					if (!_lodash2.default.includes(swatchesArgs.js, jsPath)) {
						swatchesArgs.js.push(jsPath);
					}
				}

				pkg.scripts['swatches'] = 'swatch-names' + swatchesArgs.swatch.reduce(function (r, s) {
					return r + ' --swatch ' + s;
				}, '') + swatchesArgs.scss.reduce(function (r, s) {
					return r + ' --scss ' + s;
				}, '') + swatchesArgs.js.reduce(function (r, s) {
					return r + ' --js ' + s;
				}, '');
				swatchesWatch.push(fileName);
				pkg.watch['swatches'] = swatchesWatch;
				(0, _writePkg2.default)(path, pkg).then(function () {
					console.log(`Package.json updated. Now add ${_chalk.green.bold('swatches')} to your watch script...`);
				});
			}).catch(function (err) {
				throw new Error(_chalk.red.bold('No package.json found. Did you run \'npm init\'?\n' + err));
			});
		});
	});

	return function initializeWatcher(_x2) {
		return _ref2.apply(this, arguments);
	};
})();

const swatchNamesCli = flags => {
	const swatches = flags.swatch;

	if (swatches) {
		const scss = flags.scss;
		const js = flags.js;

		if (_lodash2.default.isArray(swatches)) {
			_lodash2.default.forEach(swatches, (swatch, index) => {
				const swatchFile = (0, _path.relative)(root, (0, _path.resolve)(swatch));
				const scssPath = _lodash2.default.isArray(scss) ? scss.length === swatches.length ? scss[index] : scss[0] : scss;
				const jsPath = _lodash2.default.isArray(js) ? js.length === swatches.length ? js[index] : js[0] : js;
				const output = flags.overwrite ? swatchFile : (0, _path.join)((0, _path.dirname)(swatchFile), (0, _path.basename)(swatchFile, (0, _path.extname)(swatchFile)) + '-named.aco');

				(0, _swatchNames.processSwatch)(swatchFile, scssPath, jsPath, output);
			});
		} else {
			if (_lodash2.default.isArray(scss) || _lodash2.default.isArray(js)) throw new Error(_chalk.red.bold('Wrong number of output arguments supplied. One swatch file can be converted to one SCSS and one JS file only.'));
			const swatchFile = (0, _path.relative)(root, (0, _path.resolve)(swatches));
			const output = flags.overwrite ? swatchFile : (0, _path.join)((0, _path.dirname)(swatchFile), (0, _path.basename)(swatchFile, (0, _path.extname)(swatchFile)) + '-named.aco');
			(0, _swatchNames.processSwatch)(swatchFile, scss, js, output);
		}
	} else {
		convertSwatch();
	}
};

if (cli.flags.init) {
	initializeWatcher();
} else {
	swatchNamesCli(cli.flags);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGkuanMiXSwibmFtZXMiOlsiUHJvbXB0cyIsImNsaSIsInJvb3QiLCJwcm9jZXNzIiwiY3dkIiwicmVnaXN0ZXJQcm9tcHQiLCJjb252ZXJ0U3dhdGNoIiwic2tpcEluaXQiLCJzcGlubmVyIiwic3RhcnQiLCJmaWxlcyIsInN0b3AiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiYm9sZCIsInByb21wdCIsImRpZmZlcmVudFBhdGgiLCJuZXdQYXRoIiwidGhlbiIsImFuc3dlcnMiLCJjb252ZXJ0U3dhdGNoZXMiLCJleGl0Iiwic3dhdGNoIiwic3dhdGNoRmlsZSIsIm92ZXJ3cml0ZSIsIm91dHB1dFBhdGgiLCJpbml0aWFsaXplIiwib3V0cHV0IiwiaW5pdGlhbGl6ZVdhdGNoZXIiLCJmaWxlTmFtZSIsIm5vU2F2ZSIsInNjc3NQYXRoIiwianNQYXRoIiwicGtnIiwicmVzdWx0IiwicGF0aCIsInNjcmlwdHMiLCJzd2F0Y2hlc1NjcmlwdHMiLCJ3YXRjaCIsInN3YXRjaGVzV2F0Y2giLCJzd2F0Y2hlc0FyZ3MiLCJzcGxpdCIsImlzQXJyYXkiLCJpbmNsdWRlcyIsInB1c2giLCJzY3NzIiwianMiLCJyZWR1Y2UiLCJyIiwicyIsImNhdGNoIiwiRXJyb3IiLCJlcnIiLCJzd2F0Y2hOYW1lc0NsaSIsImZsYWdzIiwic3dhdGNoZXMiLCJmb3JFYWNoIiwiaW5kZXgiLCJpbml0Il0sIm1hcHBpbmdzIjoiOztBQUdBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7SUFBWUEsTzs7QUFDWjs7QUFDQTs7Ozs7OztBQWhCQTs7QUFrQkEsTUFBTUMsTUFBTSxvQkFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQU4sQ0FBWjs7QUFvQkEsTUFBTUMsT0FBT0MsUUFBUUMsR0FBUixFQUFiO0FBQ0EsbUJBQVNDLGNBQVQsQ0FBd0IsTUFBeEI7QUFDQSxtQkFBU0EsY0FBVCxDQUF3QixjQUF4Qjs7QUFFQSxNQUFNQztBQUFBLDhCQUFnQixXQUFPQyxRQUFQLEVBQW9CO0FBQ3pDLFFBQU1DLFVBQVUsbUJBQUssWUFBVyxrQkFBTU4sSUFBTixDQUFZLDhCQUE1QixFQUEyRE8sS0FBM0QsRUFBaEI7QUFDQSxRQUFNQyxRQUFRLE1BQU0sc0JBQWFSLElBQWIsQ0FBcEI7QUFDQU0sVUFBUUcsSUFBUjs7QUFFQSxNQUFJLENBQUNELE1BQU1FLE1BQVgsRUFBbUI7QUFDbEJDLFdBQVFDLEdBQVIsQ0FBWSxXQUFJQyxJQUFKLENBQVMsd0RBQVQsQ0FBWjtBQUNBLHNCQUFTQyxNQUFULENBQWdCLENBQ2ZoQixRQUFRaUIsYUFETyxFQUVmakIsUUFBUWtCLE9BQVIsQ0FBZ0JoQixJQUFoQixDQUZlLENBQWhCLEVBR0dpQixJQUhILENBR1EsVUFBQ0MsT0FBRCxFQUFhO0FBQ3BCLFFBQUlBLFFBQVFGLE9BQVosRUFBcUI7QUFDcEJHLHFCQUFnQkQsUUFBUUYsT0FBeEI7QUFDQSxLQUZELE1BRU87QUFDTixZQUFPZixRQUFRbUIsSUFBUixDQUFhLENBQWIsQ0FBUDtBQUNBO0FBQ0QsSUFURDtBQVVBLEdBWkQsTUFZTztBQUNOO0FBQ0Esc0JBQVNOLE1BQVQsQ0FBZ0IsQ0FDZmhCLFFBQVF1QixNQUFSLENBQWViLEtBQWYsQ0FEZSxDQUFoQixFQUVHUyxJQUZILENBRVEsVUFBQ0MsT0FBRCxFQUFhO0FBQ3BCLFVBQU1JLGFBQWFKLFFBQVFHLE1BQTNCO0FBQ0EsdUJBQVNQLE1BQVQsQ0FBZ0IsQ0FDZmhCLFFBQVF5QixTQURPLEVBRWZ6QixRQUFRMEIsVUFBUixDQUFtQixnQkFBSyxtQkFBUUYsVUFBUixDQUFMLEVBQTBCLG9CQUFTQSxVQUFULEVBQXFCLG1CQUFRQSxVQUFSLENBQXJCLElBQTRDLFlBQXRFLENBQW5CLENBRmUsRUFHZnhCLFFBQVEyQixVQUFSLENBQW1CcEIsUUFBbkIsQ0FIZSxDQUFoQixFQUlHWSxJQUpILENBSVEsVUFBQ0MsT0FBRCxFQUFhO0FBQ3BCLFdBQU1RLFNBQVNSLFFBQVFLLFNBQVIsR0FBb0JELFVBQXBCLEdBQWlDSixRQUFRTSxVQUF4RDtBQUNBLHFDQUFjRixVQUFkLEVBQTBCLElBQTFCLEVBQWdDLElBQWhDLEVBQXNDSSxNQUF0QyxFQUNFVCxJQURGLENBQ08sWUFBTTtBQUNYLFVBQUlDLFFBQVFPLFVBQVosRUFBd0I7QUFDdkJFLHlCQUFrQkwsVUFBbEI7QUFDQTtBQUNELE1BTEY7QUFNQSxLQVpEO0FBYUEsSUFqQkQ7QUFrQkE7QUFFRCxFQXZDSzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFOOztBQXlDQSxNQUFNSztBQUFBLCtCQUFvQixXQUFPQyxRQUFQLEVBQW9COztBQUU3QyxNQUFJcEIsS0FBSjs7QUFFQSxNQUFJb0IsUUFBSixFQUFjO0FBQ2JqQixXQUFRQyxHQUFSLENBQWEsK0JBQThCLGtCQUFNZ0IsUUFBTixDQUFnQixLQUEzRDtBQUNBLEdBRkQsTUFFTztBQUNOcEIsV0FBUSxNQUFNLHNCQUFhUixJQUFiLENBQWQ7QUFDQTs7QUFFRCxRQUFNNkIsU0FBUyxjQUFmOztBQUVBLHFCQUFTZixNQUFULENBQWdCLENBQ2ZoQixRQUFRdUIsTUFBUixDQUFlYixLQUFmLEVBQXNCb0IsUUFBdEIsQ0FEZSxFQUVmOUIsUUFBUWdDLFFBQVIsQ0FBaUI5QixJQUFqQixFQUF1QjZCLE1BQXZCLENBRmUsRUFHZi9CLFFBQVFpQyxNQUFSLENBQWUvQixJQUFmLEVBQXFCNkIsTUFBckIsQ0FIZSxDQUFoQixFQUlHWixJQUpILENBSVEsVUFBQ0MsT0FBRCxFQUFhOztBQUVwQiw4QkFDRUQsSUFERixDQUNPLGtCQUFVO0FBQUEsVUFDUmUsR0FEUSxHQUNLQyxNQURMLENBQ1JELEdBRFE7QUFBQSxVQUNIRSxJQURHLEdBQ0tELE1BREwsQ0FDSEMsSUFERzs7O0FBR2ZOLGVBQVcsb0JBQVMsbUJBQVFNLElBQVIsQ0FBVCxFQUF3Qk4sWUFBWVYsUUFBUUcsTUFBNUMsQ0FBWDs7QUFFQSxVQUFNYyxVQUFVSCxJQUFJRyxPQUFKLElBQWUsRUFBL0I7QUFDQSxVQUFNQyxrQkFBa0JELFFBQVEsVUFBUixLQUF1QixjQUEvQzs7QUFFQSxVQUFNRSxRQUFRTCxJQUFJSyxLQUFKLElBQWEsRUFBM0I7QUFDQSxVQUFNQyxnQkFBZ0JELE1BQU0sVUFBTixLQUFxQixFQUEzQztBQUNBLFVBQU1FLGVBQWUsd0JBQVNILGdCQUFnQkksS0FBaEIsQ0FBc0IsR0FBdEIsQ0FBVCxDQUFyQjs7QUFFQSxRQUFJLENBQUNELGFBQWFsQixNQUFsQixFQUEwQjtBQUN6QmtCLGtCQUFhbEIsTUFBYixHQUFzQixFQUF0QjtBQUNBLEtBRkQsTUFFTyxJQUFJLENBQUMsaUJBQUVvQixPQUFGLENBQVVGLGFBQWFsQixNQUF2QixDQUFMLEVBQXFDO0FBQzNDa0Isa0JBQWFsQixNQUFiLEdBQXNCLENBQUNrQixhQUFhbEIsTUFBZCxDQUF0QjtBQUNBOztBQUVELFFBQUksQ0FBQyxpQkFBRXFCLFFBQUYsQ0FBV0gsYUFBYWxCLE1BQXhCLEVBQWdDTyxRQUFoQyxDQUFMLEVBQWdEO0FBQy9DVyxrQkFBYWxCLE1BQWIsQ0FBb0JzQixJQUFwQixDQUF5QmYsUUFBekI7QUFDQTs7QUFFRCxRQUFJVixRQUFRWSxRQUFSLElBQW9CWixRQUFRWSxRQUFSLEtBQXFCRCxNQUE3QyxFQUFxRDtBQUNwRCxXQUFNQyxXQUFXLG9CQUFTOUIsSUFBVCxFQUFla0IsUUFBUVksUUFBdkIsQ0FBakI7QUFDQSxTQUFJLENBQUNTLGFBQWFLLElBQWxCLEVBQXdCO0FBQ3ZCTCxtQkFBYUssSUFBYixHQUFvQixDQUFDZCxRQUFELENBQXBCO0FBQ0EsTUFGRCxNQUVPLElBQUksQ0FBQyxpQkFBRVcsT0FBRixDQUFVRixhQUFhSyxJQUF2QixDQUFMLEVBQW1DO0FBQ3pDTCxtQkFBYUssSUFBYixHQUFvQixDQUFDTCxhQUFhSyxJQUFkLENBQXBCO0FBQ0E7O0FBRUQsU0FBSSxDQUFDLGlCQUFFRixRQUFGLENBQVdILGFBQWFLLElBQXhCLEVBQThCZCxRQUE5QixDQUFMLEVBQThDO0FBQzdDUyxtQkFBYUssSUFBYixDQUFrQkQsSUFBbEIsQ0FBdUJiLFFBQXZCO0FBQ0E7QUFDRDs7QUFFRCxRQUFJWixRQUFRYSxNQUFSLElBQWtCYixRQUFRYSxNQUFSLEtBQW1CRixNQUF6QyxFQUFpRDtBQUNoRCxXQUFNRSxTQUFTLG9CQUFTL0IsSUFBVCxFQUFla0IsUUFBUWEsTUFBdkIsQ0FBZjtBQUNBLFNBQUksQ0FBQ1EsYUFBYU0sRUFBbEIsRUFBc0I7QUFDckJOLG1CQUFhTSxFQUFiLEdBQWtCLENBQUNkLE1BQUQsQ0FBbEI7QUFDQSxNQUZELE1BRU8sSUFBSSxDQUFDLGlCQUFFVSxPQUFGLENBQVVGLGFBQWFNLEVBQXZCLENBQUwsRUFBaUM7QUFDdkNOLG1CQUFhTSxFQUFiLEdBQWtCLENBQUNOLGFBQWFNLEVBQWQsQ0FBbEI7QUFDQTs7QUFFRCxTQUFJLENBQUMsaUJBQUVILFFBQUYsQ0FBV0gsYUFBYU0sRUFBeEIsRUFBNEJkLE1BQTVCLENBQUwsRUFBMEM7QUFDekNRLG1CQUFhTSxFQUFiLENBQWdCRixJQUFoQixDQUFxQlosTUFBckI7QUFDQTtBQUNEOztBQUVEQyxRQUFJRyxPQUFKLENBQVksVUFBWixJQUEwQixpQkFBaUJJLGFBQWFsQixNQUFiLENBQW9CeUIsTUFBcEIsQ0FBMkIsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKO0FBQUEsWUFBVUQsSUFBSSxZQUFKLEdBQW1CQyxDQUE3QjtBQUFBLEtBQTNCLEVBQTJELEVBQTNELENBQWpCLEdBQWtGVCxhQUFhSyxJQUFiLENBQWtCRSxNQUFsQixDQUF5QixVQUFDQyxDQUFELEVBQUlDLENBQUo7QUFBQSxZQUFVRCxJQUFJLFVBQUosR0FBaUJDLENBQTNCO0FBQUEsS0FBekIsRUFBdUQsRUFBdkQsQ0FBbEYsR0FBK0lULGFBQWFNLEVBQWIsQ0FBZ0JDLE1BQWhCLENBQXVCLFVBQUNDLENBQUQsRUFBSUMsQ0FBSjtBQUFBLFlBQVVELElBQUksUUFBSixHQUFlQyxDQUF6QjtBQUFBLEtBQXZCLEVBQW1ELEVBQW5ELENBQXpLO0FBQ0FWLGtCQUFjSyxJQUFkLENBQW1CZixRQUFuQjtBQUNBSSxRQUFJSyxLQUFKLENBQVUsVUFBVixJQUF3QkMsYUFBeEI7QUFDQSw0QkFBU0osSUFBVCxFQUFlRixHQUFmLEVBQ0VmLElBREYsQ0FDTyxZQUFNO0FBQ1hOLGFBQVFDLEdBQVIsQ0FBYSxpQ0FBZ0MsYUFBTUMsSUFBTixDQUFXLFVBQVgsQ0FBdUIsMEJBQXBFO0FBQ0EsS0FIRjtBQUlBLElBeERGLEVBeURFb0MsS0F6REYsQ0F5RFEsZUFBTztBQUNiLFVBQU0sSUFBSUMsS0FBSixDQUFVLFdBQUlyQyxJQUFKLENBQVMsdURBQXVEc0MsR0FBaEUsQ0FBVixDQUFOO0FBQ0EsSUEzREY7QUE0REEsR0FsRUQ7QUFtRUEsRUEvRUs7O0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBTjs7QUFrRkEsTUFBTUMsaUJBQWtCQyxLQUFELElBQVc7QUFDakMsT0FBTUMsV0FBV0QsTUFBTWhDLE1BQXZCOztBQUVBLEtBQUlpQyxRQUFKLEVBQWM7QUFDYixRQUFNVixPQUFPUyxNQUFNVCxJQUFuQjtBQUNBLFFBQU1DLEtBQUtRLE1BQU1SLEVBQWpCOztBQUVBLE1BQUksaUJBQUVKLE9BQUYsQ0FBVWEsUUFBVixDQUFKLEVBQXlCO0FBQ3hCLG9CQUFFQyxPQUFGLENBQVVELFFBQVYsRUFBb0IsQ0FBQ2pDLE1BQUQsRUFBU21DLEtBQVQsS0FBbUI7QUFDdEMsVUFBTWxDLGFBQWEsb0JBQVN0QixJQUFULEVBQWUsbUJBQVFxQixNQUFSLENBQWYsQ0FBbkI7QUFDQSxVQUFNUyxXQUFXLGlCQUFFVyxPQUFGLENBQVVHLElBQVYsSUFBbUJBLEtBQUtsQyxNQUFMLEtBQWdCNEMsU0FBUzVDLE1BQXpCLEdBQWtDa0MsS0FBS1ksS0FBTCxDQUFsQyxHQUFnRFosS0FBSyxDQUFMLENBQW5FLEdBQThFQSxJQUEvRjtBQUNBLFVBQU1iLFNBQVMsaUJBQUVVLE9BQUYsQ0FBVUksRUFBVixJQUFpQkEsR0FBR25DLE1BQUgsS0FBYzRDLFNBQVM1QyxNQUF2QixHQUFnQ21DLEdBQUdXLEtBQUgsQ0FBaEMsR0FBNENYLEdBQUcsQ0FBSCxDQUE3RCxHQUFzRUEsRUFBckY7QUFDQSxVQUFNbkIsU0FBUzJCLE1BQU05QixTQUFOLEdBQWtCRCxVQUFsQixHQUErQixnQkFBSyxtQkFBUUEsVUFBUixDQUFMLEVBQTBCLG9CQUFTQSxVQUFULEVBQXFCLG1CQUFRQSxVQUFSLENBQXJCLElBQTRDLFlBQXRFLENBQTlDOztBQUVBLG9DQUFjQSxVQUFkLEVBQTBCUSxRQUExQixFQUFvQ0MsTUFBcEMsRUFBNENMLE1BQTVDO0FBQ0EsSUFQRDtBQVFBLEdBVEQsTUFTTztBQUNOLE9BQUksaUJBQUVlLE9BQUYsQ0FBVUcsSUFBVixLQUFtQixpQkFBRUgsT0FBRixDQUFVSSxFQUFWLENBQXZCLEVBQXNDLE1BQU0sSUFBSUssS0FBSixDQUFVLFdBQUlyQyxJQUFKLENBQVMsK0dBQVQsQ0FBVixDQUFOO0FBQ3RDLFNBQU1TLGFBQWEsb0JBQVN0QixJQUFULEVBQWUsbUJBQVFzRCxRQUFSLENBQWYsQ0FBbkI7QUFDQSxTQUFNNUIsU0FBUzJCLE1BQU05QixTQUFOLEdBQWtCRCxVQUFsQixHQUErQixnQkFBSyxtQkFBUUEsVUFBUixDQUFMLEVBQTBCLG9CQUFTQSxVQUFULEVBQXFCLG1CQUFRQSxVQUFSLENBQXJCLElBQTRDLFlBQXRFLENBQTlDO0FBQ0EsbUNBQWNBLFVBQWQsRUFBMEJzQixJQUExQixFQUFnQ0MsRUFBaEMsRUFBb0NuQixNQUFwQztBQUNBO0FBQ0QsRUFuQkQsTUFtQk87QUFDTnRCO0FBQ0E7QUFDRCxDQXpCRDs7QUEyQkEsSUFBSUwsSUFBSXNELEtBQUosQ0FBVUksSUFBZCxFQUFvQjtBQUNuQjlCO0FBQ0EsQ0FGRCxNQUVPO0FBQ055QixnQkFBZXJELElBQUlzRCxLQUFuQjtBQUNBIiwiZmlsZSI6ImNsaS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBqb2luLCByZWxhdGl2ZSwgaXNBYnNvbHV0ZSwgYmFzZW5hbWUsIGV4dG5hbWUsIGRpcm5hbWUsIHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGN5YW4sIGdyZWVuLCByZWQgfSBmcm9tICdjaGFsayc7XG5pbXBvcnQgaW5xdWlyZXIgZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IGF1dG9jb21wbGV0ZSBmcm9tICdpbnF1aXJlci1hdXRvY29tcGxldGUtcHJvbXB0JztcbmltcG9ydCB7IFBhdGhQcm9tcHQgfSBmcm9tICdpbnF1aXJlci1wYXRoJztcbmltcG9ydCB3cml0ZVBrZyBmcm9tICd3cml0ZS1wa2cnO1xuaW1wb3J0IHJlYWRQa2dVcCBmcm9tICdyZWFkLXBrZy11cCc7XG5pbXBvcnQgbWVvdyBmcm9tICdtZW93JztcbmltcG9ydCBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCBtaW5pbWlzdCBmcm9tICdtaW5pbWlzdCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgKiBhcyBQcm9tcHRzIGZyb20gJy4vbGliL3Byb21wdHMnO1xuaW1wb3J0IHsgcHJvY2Vzc1N3YXRjaCB9IGZyb20gJy4vbGliL3N3YXRjaC1uYW1lcyc7XG5pbXBvcnQgeyBsaXN0QWNvRmlsZXMgfSBmcm9tICcuL2xpYi9pbyc7XG5cbmNvbnN0IGNsaSA9IG1lb3coYFxuXHRVc2FnZVxuXHRcdCQgc3dhdGNoLW5hbWVzIFtvcHRpb25zXVxuXHRcdFxuXHRPcHRpb25zXG5cdFx0LS1pbml0IFBlcmZvcm1zIGFkZGluZyB3YXRjaCBzY3JpcHQgb25seSwgbW9kaWZpZXMgcGFja2FnZS5qc29uXG5cdFx0LS1zd2F0Y2ggW3BhdGhdIENvbnZlcnRzIHRoZSBzcGVjaWZpZWQgc3dhdGNoIGZpbGVcblx0XHQtLXNjc3MgW3BhdGhdIFNhdmVzIFNDU1MgY29sb3IgbmFtZXMgdG8gdGhlIHNwZWNpZmllZCBmaWxlXG5cdFx0LS1qcyBbcGF0aF0gU2F2ZXMgSlMgY29sb3IgbmFtZXMgdG8gdGhlIHNwZWNpZmllZCBmaWxlXG5cdFx0XG5cdEV4YW1wbGVzXG5cdFx0JCBzd2F0Y2gtbmFtZXNcblx0XHQkIHN3YXRjaC1uYW1lcyAtLWluaXRcblx0XHQkIHN3YXRjaC1uYW1lcyAtLXN3YXRjaCBzd2F0Y2hlcy5hY29cblx0XHQkIHN3YXRjaC1uYW1lcyAtLXN3YXRjaCBzd2F0Y2hlcy5hY28gLS1zY3NzIHN3YXRjaGVzLnNjc3Ncblx0XHQkIHN3YXRjaC1uYW1lcyAtLXN3YXRjaCBzd2F0Y2hlcy5hY28gLS1zY3NzIHN3YXRjaGVzLnNjc3MgLS1qcyBzd2F0Y2hlcy5qc1xuXHRcdCQgc3dhdGNoLW5hbWVzIC0tc3dhdGNoIHN3YXRjaGVzLmFjbyAtLXN3YXRjaCBzd2F0Y2hlczIuYWNvIC0tc3dhdGNoIHN3YXRjaGVzMy5hY28gLS1zY3NzIHN3YXRjaGVzLnNjc3MgLS1qcyBzd2F0Y2hlcy5qc1xuXHRcdFxuYCk7XG5cbmNvbnN0IHJvb3QgPSBwcm9jZXNzLmN3ZCgpO1xuaW5xdWlyZXIucmVnaXN0ZXJQcm9tcHQoJ3BhdGgnLCBQYXRoUHJvbXB0KTtcbmlucXVpcmVyLnJlZ2lzdGVyUHJvbXB0KCdhdXRvY29tcGxldGUnLCBhdXRvY29tcGxldGUpO1xuXG5jb25zdCBjb252ZXJ0U3dhdGNoID0gYXN5bmMgKHNraXBJbml0KSA9PiB7XG5cdGNvbnN0IHNwaW5uZXIgPSBvcmEoYFNjYW5uaW5nICR7Z3JlZW4ocm9vdCl9IGZvciBzd2F0Y2ggZmlsZXMgKCouYWNvKS4uLmApLnN0YXJ0KCk7XG5cdGNvbnN0IGZpbGVzID0gYXdhaXQgbGlzdEFjb0ZpbGVzKHJvb3QpO1xuXHRzcGlubmVyLnN0b3AoKTtcblxuXHRpZiAoIWZpbGVzLmxlbmd0aCkge1xuXHRcdGNvbnNvbGUubG9nKHJlZC5ib2xkKCdcXG5ObyBzd2F0Y2ggZmlsZXMgZm91bmQgdW5kZXIgdGhlIGN1cnJlbnQgZGlyZWN0b3J5LlxcbicpKTtcblx0XHRpbnF1aXJlci5wcm9tcHQoW1xuXHRcdFx0UHJvbXB0cy5kaWZmZXJlbnRQYXRoLFxuXHRcdFx0UHJvbXB0cy5uZXdQYXRoKHJvb3QpXG5cdFx0XSkudGhlbigoYW5zd2VycykgPT4ge1xuXHRcdFx0aWYgKGFuc3dlcnMubmV3UGF0aCkge1xuXHRcdFx0XHRjb252ZXJ0U3dhdGNoZXMoYW5zd2Vycy5uZXdQYXRoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBwcm9jZXNzLmV4aXQoMSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gRm91bmQgc29tZSAqLmFjbyBmaWxlcywgY29udmVydCB0aGVtXG5cdFx0aW5xdWlyZXIucHJvbXB0KFtcblx0XHRcdFByb21wdHMuc3dhdGNoKGZpbGVzKVxuXHRcdF0pLnRoZW4oKGFuc3dlcnMpID0+IHtcblx0XHRcdGNvbnN0IHN3YXRjaEZpbGUgPSBhbnN3ZXJzLnN3YXRjaDtcblx0XHRcdGlucXVpcmVyLnByb21wdChbXG5cdFx0XHRcdFByb21wdHMub3ZlcndyaXRlLFxuXHRcdFx0XHRQcm9tcHRzLm91dHB1dFBhdGgoam9pbihkaXJuYW1lKHN3YXRjaEZpbGUpLCBiYXNlbmFtZShzd2F0Y2hGaWxlLCBleHRuYW1lKHN3YXRjaEZpbGUpKSArICctbmFtZWQuYWNvJykpLFxuXHRcdFx0XHRQcm9tcHRzLmluaXRpYWxpemUoc2tpcEluaXQpXG5cdFx0XHRdKS50aGVuKChhbnN3ZXJzKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG91dHB1dCA9IGFuc3dlcnMub3ZlcndyaXRlID8gc3dhdGNoRmlsZSA6IGFuc3dlcnMub3V0cHV0UGF0aDtcblx0XHRcdFx0cHJvY2Vzc1N3YXRjaChzd2F0Y2hGaWxlLCBudWxsLCBudWxsLCBvdXRwdXQpXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGFuc3dlcnMuaW5pdGlhbGl6ZSkge1xuXHRcdFx0XHRcdFx0XHRpbml0aWFsaXplV2F0Y2hlcihzd2F0Y2hGaWxlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cbn07XG5cbmNvbnN0IGluaXRpYWxpemVXYXRjaGVyID0gYXN5bmMgKGZpbGVOYW1lKSA9PiB7XG5cblx0bGV0IGZpbGVzO1xuXG5cdGlmIChmaWxlTmFtZSkge1xuXHRcdGNvbnNvbGUubG9nKGBJbnN0YWxsaW5nIHdhdGNoIHNjcmlwdCBmb3IgJHtncmVlbihmaWxlTmFtZSl9Li4uYCk7XG5cdH0gZWxzZSB7XG5cdFx0ZmlsZXMgPSBhd2FpdCBsaXN0QWNvRmlsZXMocm9vdCk7XG5cdH1cblxuXHRjb25zdCBub1NhdmUgPSAnRG9uXFwndCBzYXZlLic7XG5cblx0aW5xdWlyZXIucHJvbXB0KFtcblx0XHRQcm9tcHRzLnN3YXRjaChmaWxlcywgZmlsZU5hbWUpLFxuXHRcdFByb21wdHMuc2Nzc1BhdGgocm9vdCwgbm9TYXZlKSxcblx0XHRQcm9tcHRzLmpzUGF0aChyb290LCBub1NhdmUpXG5cdF0pLnRoZW4oKGFuc3dlcnMpID0+IHtcblxuXHRcdHJlYWRQa2dVcCgpXG5cdFx0XHQudGhlbihyZXN1bHQgPT4ge1xuXHRcdFx0XHRjb25zdCB7cGtnLCBwYXRofSA9IHJlc3VsdDtcblxuXHRcdFx0XHRmaWxlTmFtZSA9IHJlbGF0aXZlKGRpcm5hbWUocGF0aCksIGZpbGVOYW1lIHx8IGFuc3dlcnMuc3dhdGNoKTtcblxuXHRcdFx0XHRjb25zdCBzY3JpcHRzID0gcGtnLnNjcmlwdHMgfHwge307XG5cdFx0XHRcdGNvbnN0IHN3YXRjaGVzU2NyaXB0cyA9IHNjcmlwdHNbJ3N3YXRjaGVzJ10gfHwgJ3N3YXRjaC1uYW1lcyc7XG5cblx0XHRcdFx0Y29uc3Qgd2F0Y2ggPSBwa2cud2F0Y2ggfHwge307XG5cdFx0XHRcdGNvbnN0IHN3YXRjaGVzV2F0Y2ggPSB3YXRjaFsnc3dhdGNoZXMnXSB8fCBbXTtcblx0XHRcdFx0Y29uc3Qgc3dhdGNoZXNBcmdzID0gbWluaW1pc3Qoc3dhdGNoZXNTY3JpcHRzLnNwbGl0KCcgJykpO1xuXG5cdFx0XHRcdGlmICghc3dhdGNoZXNBcmdzLnN3YXRjaCkge1xuXHRcdFx0XHRcdHN3YXRjaGVzQXJncy5zd2F0Y2ggPSBbXTtcblx0XHRcdFx0fSBlbHNlIGlmICghXy5pc0FycmF5KHN3YXRjaGVzQXJncy5zd2F0Y2gpKSB7XG5cdFx0XHRcdFx0c3dhdGNoZXNBcmdzLnN3YXRjaCA9IFtzd2F0Y2hlc0FyZ3Muc3dhdGNoXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghXy5pbmNsdWRlcyhzd2F0Y2hlc0FyZ3Muc3dhdGNoLCBmaWxlTmFtZSkpIHtcblx0XHRcdFx0XHRzd2F0Y2hlc0FyZ3Muc3dhdGNoLnB1c2goZmlsZU5hbWUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFuc3dlcnMuc2Nzc1BhdGggJiYgYW5zd2Vycy5zY3NzUGF0aCAhPT0gbm9TYXZlKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2Nzc1BhdGggPSByZWxhdGl2ZShyb290LCBhbnN3ZXJzLnNjc3NQYXRoKTtcblx0XHRcdFx0XHRpZiAoIXN3YXRjaGVzQXJncy5zY3NzKSB7XG5cdFx0XHRcdFx0XHRzd2F0Y2hlc0FyZ3Muc2NzcyA9IFtzY3NzUGF0aF07XG5cdFx0XHRcdFx0fSBlbHNlIGlmICghXy5pc0FycmF5KHN3YXRjaGVzQXJncy5zY3NzKSkge1xuXHRcdFx0XHRcdFx0c3dhdGNoZXNBcmdzLnNjc3MgPSBbc3dhdGNoZXNBcmdzLnNjc3NdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghXy5pbmNsdWRlcyhzd2F0Y2hlc0FyZ3Muc2Nzcywgc2Nzc1BhdGgpKSB7XG5cdFx0XHRcdFx0XHRzd2F0Y2hlc0FyZ3Muc2Nzcy5wdXNoKHNjc3NQYXRoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYW5zd2Vycy5qc1BhdGggJiYgYW5zd2Vycy5qc1BhdGggIT09IG5vU2F2ZSkge1xuXHRcdFx0XHRcdGNvbnN0IGpzUGF0aCA9IHJlbGF0aXZlKHJvb3QsIGFuc3dlcnMuanNQYXRoKTtcblx0XHRcdFx0XHRpZiAoIXN3YXRjaGVzQXJncy5qcykge1xuXHRcdFx0XHRcdFx0c3dhdGNoZXNBcmdzLmpzID0gW2pzUGF0aF07XG5cdFx0XHRcdFx0fSBlbHNlIGlmICghXy5pc0FycmF5KHN3YXRjaGVzQXJncy5qcykpIHtcblx0XHRcdFx0XHRcdHN3YXRjaGVzQXJncy5qcyA9IFtzd2F0Y2hlc0FyZ3MuanNdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghXy5pbmNsdWRlcyhzd2F0Y2hlc0FyZ3MuanMsIGpzUGF0aCkpIHtcblx0XHRcdFx0XHRcdHN3YXRjaGVzQXJncy5qcy5wdXNoKGpzUGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cGtnLnNjcmlwdHNbJ3N3YXRjaGVzJ10gPSAnc3dhdGNoLW5hbWVzJyArIHN3YXRjaGVzQXJncy5zd2F0Y2gucmVkdWNlKChyLCBzKSA9PiByICsgJyAtLXN3YXRjaCAnICsgcywgJycpICsgc3dhdGNoZXNBcmdzLnNjc3MucmVkdWNlKChyLCBzKSA9PiByICsgJyAtLXNjc3MgJyArIHMsICcnKSArIHN3YXRjaGVzQXJncy5qcy5yZWR1Y2UoKHIsIHMpID0+IHIgKyAnIC0tanMgJyArIHMsICcnKTtcblx0XHRcdFx0c3dhdGNoZXNXYXRjaC5wdXNoKGZpbGVOYW1lKTtcblx0XHRcdFx0cGtnLndhdGNoWydzd2F0Y2hlcyddID0gc3dhdGNoZXNXYXRjaDtcblx0XHRcdFx0d3JpdGVQa2cocGF0aCwgcGtnKVxuXHRcdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGBQYWNrYWdlLmpzb24gdXBkYXRlZC4gTm93IGFkZCAke2dyZWVuLmJvbGQoJ3N3YXRjaGVzJyl9IHRvIHlvdXIgd2F0Y2ggc2NyaXB0Li4uYCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGVyciA9PiB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihyZWQuYm9sZCgnTm8gcGFja2FnZS5qc29uIGZvdW5kLiBEaWQgeW91IHJ1biBcXCducG0gaW5pdFxcJz9cXG4nICsgZXJyKSk7XG5cdFx0XHR9KTtcblx0fSk7XG59O1xuXG5cbmNvbnN0IHN3YXRjaE5hbWVzQ2xpID0gKGZsYWdzKSA9PiB7XG5cdGNvbnN0IHN3YXRjaGVzID0gZmxhZ3Muc3dhdGNoO1xuXG5cdGlmIChzd2F0Y2hlcykge1xuXHRcdGNvbnN0IHNjc3MgPSBmbGFncy5zY3NzO1xuXHRcdGNvbnN0IGpzID0gZmxhZ3MuanM7XG5cblx0XHRpZiAoXy5pc0FycmF5KHN3YXRjaGVzKSkge1xuXHRcdFx0Xy5mb3JFYWNoKHN3YXRjaGVzLCAoc3dhdGNoLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRjb25zdCBzd2F0Y2hGaWxlID0gcmVsYXRpdmUocm9vdCwgcmVzb2x2ZShzd2F0Y2gpKTtcblx0XHRcdFx0Y29uc3Qgc2Nzc1BhdGggPSBfLmlzQXJyYXkoc2NzcykgPyAoc2Nzcy5sZW5ndGggPT09IHN3YXRjaGVzLmxlbmd0aCA/IHNjc3NbaW5kZXhdIDogc2Nzc1swXSkgOiBzY3NzO1xuXHRcdFx0XHRjb25zdCBqc1BhdGggPSBfLmlzQXJyYXkoanMpID8gKGpzLmxlbmd0aCA9PT0gc3dhdGNoZXMubGVuZ3RoID8ganNbaW5kZXhdIDoganNbMF0pIDoganM7XG5cdFx0XHRcdGNvbnN0IG91dHB1dCA9IGZsYWdzLm92ZXJ3cml0ZSA/IHN3YXRjaEZpbGUgOiBqb2luKGRpcm5hbWUoc3dhdGNoRmlsZSksIGJhc2VuYW1lKHN3YXRjaEZpbGUsIGV4dG5hbWUoc3dhdGNoRmlsZSkpICsgJy1uYW1lZC5hY28nKTtcblxuXHRcdFx0XHRwcm9jZXNzU3dhdGNoKHN3YXRjaEZpbGUsIHNjc3NQYXRoLCBqc1BhdGgsIG91dHB1dCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKF8uaXNBcnJheShzY3NzKSB8fCBfLmlzQXJyYXkoanMpKSB0aHJvdyBuZXcgRXJyb3IocmVkLmJvbGQoJ1dyb25nIG51bWJlciBvZiBvdXRwdXQgYXJndW1lbnRzIHN1cHBsaWVkLiBPbmUgc3dhdGNoIGZpbGUgY2FuIGJlIGNvbnZlcnRlZCB0byBvbmUgU0NTUyBhbmQgb25lIEpTIGZpbGUgb25seS4nKSk7XG5cdFx0XHRjb25zdCBzd2F0Y2hGaWxlID0gcmVsYXRpdmUocm9vdCwgcmVzb2x2ZShzd2F0Y2hlcykpO1xuXHRcdFx0Y29uc3Qgb3V0cHV0ID0gZmxhZ3Mub3ZlcndyaXRlID8gc3dhdGNoRmlsZSA6IGpvaW4oZGlybmFtZShzd2F0Y2hGaWxlKSwgYmFzZW5hbWUoc3dhdGNoRmlsZSwgZXh0bmFtZShzd2F0Y2hGaWxlKSkgKyAnLW5hbWVkLmFjbycpO1xuXHRcdFx0cHJvY2Vzc1N3YXRjaChzd2F0Y2hGaWxlLCBzY3NzLCBqcywgb3V0cHV0KTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y29udmVydFN3YXRjaCgpO1xuXHR9XG59O1xuXG5pZiAoY2xpLmZsYWdzLmluaXQpIHtcblx0aW5pdGlhbGl6ZVdhdGNoZXIoKTtcbn0gZWxzZSB7XG5cdHN3YXRjaE5hbWVzQ2xpKGNsaS5mbGFncyk7XG59XG4iXX0=