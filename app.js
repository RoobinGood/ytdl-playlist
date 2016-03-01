var fs = require('fs');
var ytdl = require('ytdl-core');
var request = require('request');
var argv = require('optimist').argv;
var select = require('soupselect').select;
var htmlparser = require('htmlparser');

var downloadVideo = function(url, name) {
	ytdl(url).pipe(fs.createWriteStream(name));
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

			videoList.filter(function(item, i) {
				return i >= params.startIndex -1;
			}).forEach(function(item, i) {
				setTimeout(function() {
					console.log(item.url, item.name);
					downloadVideo(item.url, item.name);
				}, i*1000*params.timeout);
			});
		}
	});
};


var listUrls = argv._;
var params = {
	folder: argv.folder || './',
	startIndex: argv.startIndex || argv.s || 1,
	timeout: argv.timeout || argv.t || 5,
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
