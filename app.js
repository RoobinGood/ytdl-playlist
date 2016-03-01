var fs = require('fs');
var ytdl = require('ytdl-core');
var request = require('request');
var argv = require('optimist').argv;
var select = require('soupselect').select;
var htmlparser = require('htmlparser');

var downloadVideo = function(url, name) {
	ytdl(url).pipe(fs.createWriteStream(name));
}

var getPlaylist = function(listUrl, folder) {
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
						var url = node.attribs.href;
						var name = node.children[0].raw.trim() + '.flv';

						console.log('downloading: ', i, name);
						downloadVideo(url, name);
					});
				}
			});

			var parser = new htmlparser.Parser(handler);
			parser.parseComplete(body);
		}
	});
};

var listUrls = argv._;
var folder = argv.folder || './';
if (listUrls.length > 0) {
	listUrls.forEach(function(listUrl) {
		console.log(listUrl);
		getPlaylist(listUrl, folder);
	});
} else {
	console.warn('There are no link :\'(');
}
