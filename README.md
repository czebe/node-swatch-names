
![swatch-names logo](https://user-images.githubusercontent.com/2728671/32230886-6946c520-be54-11e7-9cf3-8e33a35cb20d.png =200x269)

# Swatch Names

**A node tool to take out the hassle of naming each color of your project manually.**

Swatch-names reads standard **Photoshop .aco swatch files** finds a unique color name for every swatch item and saves the resulting color palette as an **.aco** file. This file can be loaded into Photoshop's swatches so developers and designers use the same color names.

Exports your color names and values to SCSS and JS variables.

## Install

```sh
$ npm install node-swatch-names --save-dev
```

## Usage

### Start the CLI and progress step-by-step with swatch conversion or setup:

```sh
$ node swatch-names
```

## Contributing

PRs are much appreciated!

Use `npm run develop` while coding,
and `npm run test` to run unit tests.

## License

MIT ? [Marton Czebe](https://github.com/czebe)

// https://raw.githubusercontent.com/lemieuxster/node-aco/master/aco.js
// http://www.nomodes.com/aco.html