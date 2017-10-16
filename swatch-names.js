const acoReader = require('aco-reader');


// NOT WORKING acoReader
/*
	EXPECTED:
	[ { name: 'White', hex: '#ffffff', w: '0000', x: '0000', y: 'ffff' },
	{ name: 'Black', hex: '#000000', w: '0000', x: '0000', y: '0000' } ]

	ACTUAL:
	[ { name: 'White', hex: '#0000ff', w: '0000', x: '0000', y: 'ffff' },
	{ name: 'Black', hex: '#000000', w: '0000', x: '0000', y: '0000' } ]

 */

acoReader.toJSON('swatches.aco', function(err, swatches) {

	console.log(swatches);

});
