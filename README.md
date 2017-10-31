
<img align="right" src="https://user-images.githubusercontent.com/2728671/32230886-6946c520-be54-11e7-9cf3-8e33a35cb20d.png" width="200" height="269" />

# Swatch Names

[![GitHub release](https://img.shields.io/github/release/czebe/node-swatch-names.svg)](https://github.com/czebe/node-swatch-names)

**A node tool to save the hassle of naming each color in your project manually.**

Swatch-names reads standard **Photoshop .aco swatch files** finds a unique color name for every swatch item and saves the resulting color palette as an **.aco** file. This file can be loaded into Photoshop's swatches so developers and designers use the same color names.

Exports your color names and values to SCSS and JS variables.

## Install

```sh
$ npm install node-swatch-names --save-dev
```

## Usage

Start the CLI and progress step-by-step with swatch conversion or setup:

```sh
$ ./node_modules/.bin/swatch-names
```

Specify a swatch file and an output for the result:

```sh
$ ./node_modules/.bin/swatch-names --swatch path/to/source-swatch.aco --output path/to/result-swatch.aco
```

Specify a swatch file, an output and SCSS/JS file to be generated:

```sh
$ ./node_modules/.bin/swatch-names --swatch path/to/source-swatch.aco --output path/to/result-swatch.aco --scss path/to/colors.scss --js path/to/colors.js
```

Run file watcher initialization using `npm-watch`:

```sh
$ ./node_modules/.bin/swatch-names --init
```

## Acknowledgements

This tool was inspired by the following great projects:

- The ACO file format description: http://www.nomodes.com/aco.html
- [David LeMieux](https://github.com/lemieuxster)'s excellent aco writer tool: [node-aco](https://github.com/lemieuxster/node-aco)
- [Alvaro Pinot](https://github.com/alvaropinot)'s aco reader tool: [aco-reader](https://github.com/alvaropinot/aco-reader)
- [David Aerne](https://github.com/meodai)'s huge collection of color names: [color-names](https://github.com/meodai/color-names)


## Contributing

PRs are much appreciated!

Use `npm run develop` while coding and `npm run test` to run unit tests.

## License

MIT ? [Marton Czebe](https://github.com/czebe)

// https://raw.githubusercontent.com/lemieuxster/node-aco/master/aco.js
//