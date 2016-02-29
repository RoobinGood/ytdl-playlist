var fs = require('fs');
var ytdl = require('ytdl-core');
var request = require('request');
var argv = require('optimist').argv;

var downloadVideo = function(url, name) {
	ytdl(url).pipe(fs.createWriteStream(name));
}

var getPlaylist = function(listUrl, folder) {
	request.get(listUrl, function(err, res, body) {
		// console.log(body.substr(0, 1000));
		body.match(/pl-video-title-link.*data/g).forEach(function(link, i) {

			var url = 'https://www.youtube.com' + link.match(/href=".*"/)[0]
				.replace('href=\"', '').replace('"', '').replace(/&amp;/g, '&');

			var list = url.match(/&list=.*/)[0];
			url = url.replace(list, '');

			var index = url.match(/&index=.*/)[0];
			url = url.replace(index, '');

			url = url + list + index;
			
			var name = folder + String(i+1) + '.flv';

			console.log(url, name);
			downloadVideo(url, name);
		});
	});
};

var listUrls = argv._;
var folder = argv.folder;
if (listUrls.length > 0) {
	listUrls.forEach(function(listUrl) {
		console.log(listUrl);
		getPlaylist(listUrl, folder);
	});
} else {
	console.warn('There are no link :\'(');
}