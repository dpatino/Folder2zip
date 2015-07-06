/**
 * Created by d.patino on 02/07/2015.
 */
var debug = require('debug')
var util = require("util");
var events = require('events');

var Promise = require('bluebird');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var ProgressBar = require('progress');
var Folder2Zip;
Folder2Zip = (function () {
	var zip_path, findCommand, zipCommand, testZipCommand;

	/**
	 *
	 * @param source_path
	 * @param dest_path
	 * @param result_file
	 * @constructor
	 */

	function Folder2Zip(working_folder, source_path, folder_name) {
		if (source_path != null && folder_name != null) {
			debug('Folder2Zip : add ' + source_path + '/' + folder_name)
			findCommand = 'find ./' + source_path + ' |wc -l';
			zipCommand = ['-r', folder_name, source_path]
			testZipCommand = ['-T', folder_name + '.zip']
			var self = this;
			process.chdir(working_folder)
			debug("Working folder :" + process.cwd())
			exec(findCommand, function (error, stdout, stderr) {
				if (stdout) {
					self.filesLength = Number(stdout)
					self.emit('ready');
					debug('Folder2Zip ready ; ' + self.filesLength + ' files to compress')
				}
				if (error) debug('ERROR : ' + error);
				if (stderr)  debug('stderr : ' + stderr);
			})
		}
	}

	util.inherits(Folder2Zip, events);
	Folder2Zip.prototype.zipPromise = function () {
		var self = this;
		return new Promise(function (resolve, reject) {
			self.on("zipEnd", function (data) {
				resolve(data)
			})
			self.on("error", function (data) {
				reject(data)
			})
			self.on('ready', function () {
				self.zip()
			})
			exec(findCommand, function (error, stdout, stderr) {
				if (stdout) {
					self.filesLength = Number(stdout)
					self.emit('ready');
					debug('Folder2Zip.zipPromise ready ; ' + self.filesLength + ' files to compress')
				}
				if (error)    reject(error);
				if (stderr)    reject(stderr);
			})
		})
	}
	Folder2Zip.prototype.zip = function () {
		this.startZip()
	}
	Folder2Zip.prototype.filesLength = null;
	Folder2Zip.prototype.startZip = function () {
		var self = this;
		var bar = new ProgressBar(':bar', {total: this.filesLength, complete: "=", width: 20, incomplete: ""});
		var zip = spawn('zip', zipCommand, {cwd: null})
		zip.stdout.on('data', function (data) {
			bar.tick();
			self.emit('progress', bar.width);
		});
		zip.stderr.on('data', function (error) {
			self.emit('error', error);
			console.log('ps stderr: ' + error);
		});
		zip.on('close', function (code) {
			bar.tick()
			self.testZip()
		});
	}
	Folder2Zip.prototype.testZip = function () {
		var self = this;
		var zipTestResult = false;
		var zipTest = spawn('zip', testZipCommand, {cwd: null})
		zipTest.stdout.on('data', function (data) {
			var dataString = data.toString().toLowerCase()
			if (dataString.indexOf('ok') != -1) {
				zipTestResult = true;
			} else {
				zipTestResult = false;
			}
			debug('testZip : ' + dataString)
		});
		zipTest.stderr.on('data', function (error) {
			self.emit('error', error);
		});
		zipTest.on('close', function (code) {
			debug('testzip close ' + code)
			if (zipTestResult == true && code == 0) {
				process.chdir(__dirname)
				self.emit('zipEnd', '100');
			} else {
				process.chdir(__dirname)
				self.emit('error', {'code': code});
			}

		});
	}
	return Folder2Zip
})()
module.exports = Folder2Zip
