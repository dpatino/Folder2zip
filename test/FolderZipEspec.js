/**
 * Created by d.patino on 06/07/2015.
 */
var exec = require('child_process').exec;
var fs = require('fs-bluebird')

var expect = require("chai").expect;

var Folder2Zip = require('../Folder2Zip')
var fs = require("fs")
describe("Folder2Zip", function () {
	it("should zip and zipPromise command defined", function (done) {
		var zipper = new Folder2Zip();
		expect(zipper.zip).not.to.be.undefined
		expect(zipper.zipPromise).not.to.be.undefined
		done()
		console.log('\t\t\tzipper.zip = ' + (zipper.zip !== undefined));
		console.log('\t\t\tzipper.zipPromise = ' + (zipper.zipPromise !== undefined));
	});
	it('shuld zip folder', function (done) {
		var zippper2 = new Folder2Zip('test/beevirtua', 'data', 'dataZip')
		zippper2.on('zipEnd', function () {
			fs.exists('test/beevirtua/dataZip.zip', function (exist) {
				expect(exist).to.be.true;
				done()
			})
		})
		zippper2.on('ready', function () {
			zippper2.zip()
		})
	})
	it('zip file size ok', function (done) {
		var statsFromResultZipFile = fs.statSync("test/beevirtua/dataZip.zip")['size'];
		var statsFromOrinigalZipFile = fs.statSync("test/beevirtua/originalData.zip")['size'];
		expect(statsFromResultZipFile).to.be.equal(statsFromOrinigalZipFile);
		done()
		console.log('\t\t\tstatsFromResultZipFile.size = ' + statsFromOrinigalZipFile);
		console.log('\t\t\tstatsFromOrinigalZipFile.size = ' + statsFromOrinigalZipFile);
	})
	it('zip file Promise', function (done) {
		var zippper3 = new Folder2Zip('test/beevirtua', 'data', 'dataZipPromise')
		zippper3.zipPromise().then(function () {
			fs.exists('test/beevirtua/dataZipPromise.zip', function (exist) {
				expect(exist).to.be.true;
				done()
			})
		})
	})
	it('zip promise file size ok', function (done) {
		var statsFromResultZipFile = fs.statSync("test/beevirtua/dataZip.zip")['size'];
		var statsFromOrinigalZipFile = fs.statSync("test/beevirtua/dataZipPromise.zip")['size'];
		expect(statsFromResultZipFile).to.be.equal(statsFromOrinigalZipFile);
		done()
		console.log('\t\t\tstatsFromResultZipFile.size = ' + statsFromOrinigalZipFile);
		console.log('\t\t\tstatsFromOrinigalZipFile.size = ' + statsFromOrinigalZipFile);
	})
})
