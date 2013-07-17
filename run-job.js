#!/usr/local/bin/node

var rc = require('rc');
var path = require('path');
var fs = require('fs');
var log4js = require('log4js');

var logger = log4js.getLogger('run-job');
var conf = rc('run-job');

var jobPath = conf.jobPath;

if (jobPath === undefined) {
	logger.error('jobPath not defined');
	process.exit(1);
}

var executorsPath = conf.executorsPath;

if (executorsPath === undefined) {
	logger.error('executorsPath not defined');
	process.exit(1);
}

fs.readFile(jobPath, {encoding: 'utf8'}, runJob);

function runJob(err, data) {

	if (err) {
		console.error(err);
		return;
	}

	var jobConf = JSON.parse(data);
	var executor = loadExecutor(jobConf.type);

	var job = {
		log: logger.info.bind(logger),
		data: jobConf.data
	};

	executor(job, done);
}

function done(result) {
	if (result === false) {
		logger.error('Job is done with an error');
		process.exit(1);
		return;
	}
	logger.info('Job is done');
}

function loadExecutor(name) {
	var pathToModule = path.resolve(executorsPath, name);
	return require(pathToModule);
}