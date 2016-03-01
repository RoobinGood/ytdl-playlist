var fs = require('fs');
var ytdl = require('ytdl-core');
var request = require('request');
var argv = require('optimist').argv;

var downloadVideo = function(url, name) {
	ytdl(url).pipe(fs.createWriteStream(name));
}

var getPlaylist = function(listUrl, folder) {
	request.get(listUrl, function(err, res, body) {
		videoList = [];
		body.replace(/\">\n/g, '\"">').match(/pl-video-title-link.*/g).forEach(function(link, i) {
			var title = link.match(/>.*/)[0].replace('>', '').trim();

			var url = 'https://www.youtube.com' + link.match(/href=".*" data/)[0]
				.replace('href=\"', '').replace('" data', '').replace(/&amp;/g, '&');

			var list = url.match(/&list=.*/)[0];
			url = url.replace(list, '');

			var index = url.match(/&index=.*/)[0];
			url = url.replace(index, '');

			url = url + list + index;

			var name = folder + String(i+1) + ' - ' + title + '.flv';
			
			// console.log(list, "'" + title + "'", "'" + url + "'");

			console.log(url, name);
			// downloadVideo(url, name);
			videoList.push({
				url: url,
				name: name
			});
		});

		videoList.forEach(function(item, i) {
			setTimeout(function() {
				downloadVideo(item.url, item.name);
			}, i*1000*5);
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