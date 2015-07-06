# Folder2zip
zipping a folder with the linux command line : 'zip'


var Folder2Zip = require('../Folder2Zip')


var zipper = new Folder2Zip('test', 'data', 'dataZip')
		zipper.on('zipEnd', function () {
			fs.exists('test/dataZip.zip', function (exist) {
				expect(exist).to.be.true;
				done()
			})
		})
		zipper.on('ready', function () {
			zipper.zip()
		})



var zipperPromise = new Folder2Zip('test', 'data', 'dataZipPromise')
		zipperPromise.zipPromise().then(function () {
			fs.exists('test/dataZipPromise.zip', function (exist) {
				expect(exist).to.be.true;
				done()
			})
		})
