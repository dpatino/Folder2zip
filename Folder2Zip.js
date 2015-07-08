/**
 * Created by d.patino on 02/07/2015.
 */
var debug = require('debug')('Folder2Zip')
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
		this.processOptions = {
			cwd: working_folder
		};
		if (source_path != null && folder_name != null) {
			debug('init: add ' + working_folder + '/' + source_path + " to " + folder_name);
			findCommand = 'find ./' + source_path + ' |wc -l';
			zipCommand = ['-r', folder_name, source_path ];
			testZipCommand = ['-T', folder_name ];
			debug("working folder :" + working_folder);
		}
	}

	util.inherits(Folder2Zip, events);
	Folder2Zip.prototype.zipPromise = function () {
		var self = this;
		return new Promise(function (resolve, reject) {
			self.on("zipEnd", function (data) {
				resolve(data);
			});
			self.on("error", function (data) {
				reject(data);
			});
			self.on('ready', function () {
			});
			exec(findCommand, self.processOptions, function (error, stdout, stderr) {
				if (error) {
					debug('findCommand (2) error: ' + error);
					return;
				}
				if (stderr) {
					debug('findCommand (2) stderr: ' + stderr);
					return;
				}
				if (stdout) {
					self.filesLength = Number(stdout);
					self.zip();
					debug('zipPromise ready ; ' + self.filesLength + ' files to compress')
				} else {
					debug('findCommand (2) no stdout? ' + stdout);
				}
			})
		})
	};
	Folder2Zip.prototype.zip = function () {
		debug('#zip');
		this.startZip();
	};
	Folder2Zip.prototype.processOptions = null;
	Folder2Zip.prototype.filesLength = null;
	Folder2Zip.prototype.startZip = function () {
		debug('#startZip');
		var self = this;
		var bar = new ProgressBar(':bar', {total: this.filesLength, complete: "=", width: 20, incomplete: ""});
		var zip = spawn('zip', zipCommand, this.processOptions);
		debug("zipcommand := " + zipCommand);
		zip.stdout.on('data', function (data) {
			bar.tick();
//			debug("zip.stdout.on('data') : "  +data)
			self.emit('progress', bar.width);
		});
		zip.stderr.on('data', function (error) {
			self.emit('error', error);
			debug("zip.stderr.on('data') : "  +error)
		});
		zip.on('close', function (code) {
			debug('zip close ' + code);
			bar.tick();
			self.testZip();
		});
	};
	Folder2Zip.prototype.testZip = function () {
		var self = this;
		var zipTestResult = false;
		var zipTest = spawn('zip', testZipCommand, this.processOptions);
		zipTest.stdout.on('data', function (data) {
			var dataString = data.toString().toLowerCase();
			zipTestResult = dataString.indexOf('ok') != -1;
			debug('zipTest.stdout.on : ' + dataString)
		});
		zipTest.stderr.on('data', function (error) {
			debug("zipTest.stderr  ERROR : " + error);
			self.emit('error', error);
		});
		zipTest.on('close', function (code) {
			debug('testzip close ' + code);
			if (zipTestResult && code == 0) {
				self.emit('zipEnd', '100');
			} else {
				self.emit('error', {'code': code});
			}
		});
	};

	return Folder2Zip;
})();
module.exports = Folder2Zip;
