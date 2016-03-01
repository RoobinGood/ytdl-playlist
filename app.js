var fs = require('fs');
var ytdl = require('ytdl-core');
var request = require('request');
var argv = require('optimist').argv;
var select = require('soupselect').select;
var htmlparser = require('htmlparser');
var _ = require('underscore');

var downloadVideo = function(params, callback) {
	console.log('downloadVideo', params.name);
	ytdl(params.url)
		.pipe(fs.createWriteStream(params.name))
		.on('finish', callback);
}

var downloadVideoList = function(params, callback) {
	var currentVideo = _(params.videoList).first();
	if (currentVideo) {
		downloadVideo(currentVideo, function() {
			downloadVideoList({videoList: _(params.videoList).tail()});
		});
	} else {
		callback();
	}
}

var getPlaylist = function(listUrl, params) {
	request.get(listUrl, function(err, res, body) {
		if (err) {
			console.err('Error: ', + err);
			throw err;
		} else {
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
						var name = params.folder + index + '. ' + node.children[0].raw.trim() + '.flv';

						videoList.push({
							url: url,
							name: name
						});
					});
				}
			});

			var videoList = [];
			var parser = new htmlparser.Parser(handler);
			parser.parseComplete(body);

			videoList = videoList.filter(function(item, i) {
				return i >= params.startIndex -1;
			});

			downloadVideoList({videoList: videoList}, function() {
				console.log('download complete');
			});
		}
	});
};


var listUrls = argv._;
var params = {
	folder: argv.folder || './',
	startIndex: argv.startIndex || argv.s || 1
}

var startIndex = argv.s || 1;
if (listUrls.length > 0) {
	listUrls.forEach(function(listUrl) {
		console.log(listUrl);
		getPlaylist(listUrl, params);
	});
} else {
	console.warn('There are no link :\'(');
}
