var fs = require('fs');
var ytdl = require('ytdl-core');
var request = require('request');
var argv = require('optimist').argv;
var Anticipant = require('anticipant');
var select = require('soupselect').select;
var htmlparser = require('htmlparser');
var _ = require('underscore');

var downloadVideo = function(params, callback) {
	console.log(params.workerName, 'download video', params.name);

	ytdl(params.url)
		.pipe(fs.createWriteStream(params.name))
		.on('finish', callback);

	// test
	/*
	setTimeout(function() {
	callback();
	}, Math.ceil(Math.random()*30));
	*/
}

var filterFileName = function(fileName){
	return (fileName.replace(/[\\\/\:\*\?\"\<\>\|]+/, "").replace(/\s+/, " "));
}

var getPlaylist = function(listUrl, params) {
	request.get(listUrl, function(err, res, body) {
		if (err) {
			console.err('Error: ', + err);
			throw err;
		} else {
			var videoList = [];

			var handler = new htmlparser.DefaultHandler(function(err, dom) {
				if (err) {
					console.err('Error: ', + err);
					throw err;
				} else {
					var list = select(dom, '.pl-video-title-link');

					list.forEach(function(node, i) {
						var url = 'https://www.youtube.com' +
							node.attribs.href.replace(/&amp;/g, '&');

						var padLength = String(list.length).length;
						var index = (Array(padLength).join('0') + (i+1)).slice(-padLength);
						var name = params.folder + '/' + index + '. ' + filterFileName(node.children[0].raw.trim()) + '.flv';

						videoList.push({
							url: url,
							name: name
						});
					});
				}
			});

			var parser = new htmlparser.Parser(handler);
			parser.parseComplete(body);

			params.lastIndex = params.lastIndex || videoList.length;
			videoList = videoList.filter(function(item, i) {
				return (i >= params.firstIndex -1) &&
					(i < params.lastIndex);
			});

			var worker = function(workerName, onFinish) {
				var currentVideo = videoList.shift();

				if (currentVideo) {
					currentVideo.workerName = workerName;
					downloadVideo(currentVideo,
						function() {
							worker(workerName, onFinish);
						}
					);
				} else {
					onFinish();
				}
			};

			var workersAnticipant = Anticipant.create(['runDownload'],
				function() {
					console.log('download complete');
				}
			);

			_(params.streamsCount).times(function(i) {
				var workerName = 'stream' + (i+1);
				workersAnticipant.register(workerName);

				worker(workerName,
					function() {
						workersAnticipant.perform(workerName);
					}
				);
			});

			workersAnticipant.perform('runDownload');
		}
	});
};


var listUrls = argv._;
var params = {
	folder: argv.dst || argv.d || './',
	firstIndex: argv['first-index'] || argv.f || 1,
	lastIndex: argv['last-index'] || argv.l || undefined,
	streamsCount: argv.streams || argv.s || 1
}

fs.stat(params.folder, function(err, stats) {
	if (err) {
		if (err.code = 'ENOENT') {
			console.log('folder not exist, trying to create...');
			fs.mkdir(params.folder, 0777, function(err) {
				if (err) throw err;
				console.log('successfully create');
				work();
			});
		} else {
			throw err;
		}
	} else {
		if (stats.isDirectory()) {
			work();
		} else {
			throw new Error(folder + ' it is not a directory');
		}
	}
});

var work = function() {
	if (listUrls.length > 0) {
		listUrls.forEach(function(listUrl) {
			console.log(listUrl);
			getPlaylist(listUrl, params);
		});
	} else {
		console.warn('There are no link :\'(');
	}
}
