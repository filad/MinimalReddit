/**
 * Functions to main.js
 * @author Adam Filkor <adam.filkor at gmail.com>
 * @website http://filkor.org
 */


/** 	
 * Make the subreddit section, create the following <div>:
 * 
 * 	<div id="section-0" class="section">
 *		<section class="title">reddit - FrontPage</section>
 *		<ul id="list-0" class="items-list">
 *		</ul>
 *	</div>
 * @param String section subreddit name
 * @returns JQuery
 */
function makeSectionDiv(section) {
	//set title for the section
	var title = (section == 'front') ? 'reddit - Front' : 'r/' + section;
	  
	//some cropping (using default width, it may change while user css styling TODO)
	title = (title.length > 18) ? title.substr(0,18) + '..' : title;
	title = (title.length > 12) ? '<div align="left">'+title+'</div>' : title;
	
	
	//create a section in container
	var sectionDiv = $('<div>').attr('id', 'section-' + section).addClass('section')
					.append(
						$('<div>').addClass('title').html('<div class="title-wrapper">'+title+'</div>'),
						$('<div>').addClass('close').html('<img src="static/img/cross.png" class="close-button" data-close="'+section+'">'),
						$('<div>').addClass('move').html('<img src="static/img/arrow-up.png" class="move-button" data-move="'+section+'">'),
						$('<div>').attr('id', 'loaderImg-' + section).css({'text-align' : 'center', 'padding-top' : '10px'}).html(getLoaderImg()),
						$('<ul>').attr('id','list-' + section).addClass('items-list').hide()
					);
	
	return sectionDiv;
}

/**
 * JSONP query to reddit
 * @param String section subreddit name
 */
function populateData(section) {
	//set color
	var color = (section == 'front') ? Settings.colors['light-gray'] : filkor_hsvToCSS(Settings.colorfulness);

	//set url for .getJSON()
	var url = (section == 'front') ? 'http://www.reddit.com/.json?limit=10&jsonp=?' : 'http://www.reddit.com/r/'+ section + "/.json?limit=10&jsonp=?";

	//JSONP request
	$.getJSON(url ,function(data){
				
		$.each(data.data.children, function(i, item){
			//sometimes the thumbnail from reddit is not a valid URL, like 'self'..
			var thumbnail = (item.data.thumbnail.indexOf('thumbs.redditmedia.com') == -1) ? '' : '<a target="_blank" href="'+item.data.url+'"><img class="reddit-thumbnail" src="'+item.data.thumbnail+'" width="50px" style="float:left;"/></a>';
			var mediaIcon = getMediaIconImg(item.data);
			
			//append the list item
			$('#list-' + section).append(
				'<li id="'+section+'-'+item.data.name+'">' +
					thumbnail +
					'<a target="_blank" href="'+item.data.url+'">'
						+item.data.title+
					'</a>'+
					'<div style="clear:both;"></div>'+
					'<ul class="reddit-info">'+
						'<li class="reddit-score">'+item.data.score+'</li>'+
						'<li>'+mediaIcon+'</li>'+
						'<li class="comment-icon-wrapper"><img id="comment-icon-'+section+'-'+item.data.name+'" class="comment-icon" src="static/img/comment.png"/></li>'+
					'</ul>'+
					'<div style="clear:both;"></div>'+
				'</li>'
				);
				
			$('#comment-icon-'+section+'-' + item.data.name).click(function(){
				showCommentBox(item.data.name,item.data.permalink,item.data.num_comments,section);
				$('#container').masonry('reload');
			});
				
		});
		
		$('#list-'+ section +'>li').css('background-color', color);
		$('#list-'+ section).fadeIn('slow');
		
		//hides the loader img
		$('#loaderImg-' + section).hide();
		
		$('#list-'+ section).addClass('fullyLoaded');
		//start masonry when we processed the last subreddit
		

		if ($('#container .fullyLoaded').length == Settings.subreddits.length) {	
			 //custom event
			$(document).trigger('allItemsLoaded');
		}
	});	
}

/**
 * Get proper media icon based on the media type, like video-music, or selftext etc..  
 * @param data The parsed JSON object from reddit
 */
function getMediaIconImg(data) {
	if (data.is_self === true) {
		return '<img class="reddit-text" src="static/img/text.png"/>';
	}
	if (data.domain == 'youtube.com' || data.domain == 'youtu.be' || ~data.domain.indexOf('bandcamp.com')) {
		return '<img class="reddit-movie" src="static/img/movie.png"/>';
	}
	
	if (~data.domain.indexOf('imgur.com') || /\.(jpg|png|gif)$/g.test(data.url)) {
		return '<img class="reddit-picture" src="static/img/camera.png"/>';
	}
	return '';
}


function showCommentBox(linkId, permalink, numComments, section) {
	
	//check if we loaded the top comment before in this particular section
	if ($('#comment-'+section+'-'+linkId).exists()) {
		$('#comment-'+section+'-'+linkId).fadeToggle('fast', function(){
			$('#container').masonry('reload');
		});
		return;	
	}

	var url = 'http://www.reddit.com' + permalink + '.json?limit=1&sort=hot&jsonp=?';
	var $linkBox = $('#'+section+'-'+linkId);
	
	var $comment = $('<li>').addClass('comment-box').attr('id', 'comment-'+section+'-'+linkId).hide();
	$comment.append('<div class="comment-info"><img class="big-comment-icon" src="static/img/comment-big.png"/><span style="float:right;"><a target="_blank" style="color:#8B2500;" href="http://reddit.com'+permalink+'?sort=hot">Read all...('+numComments+')</a></span></div>');

	var $loaderImg = $('<div>').html(getLoaderImg('grey')).css({'text-align': 'center', 'margin-top': '10px'});
	$comment.append($loaderImg);
	//insert after the main post element (..or linkBox)
	$comment.insertAfter($linkBox);
	$comment.fadeIn('fast');
	
	$.getJSON(url, function(data){
		var item 		= data[1].data.children[0];
		//var numComments = data[0].data.children[0].data.num_comments;
		
		//@see: http://stackoverflow.com/questions/1147359/how-to-decode-html-entities-using-jquery
		//it's enough security, reddit will take care of HTML element encoding and such..  
		var decoded = $("<div/>").html(item.data.body_html).text();
		//replace anchors, to show comment links on a new tab
		decoded = decoded.replace(/<a href/g,'<a target="_blank" href');
		console.log($(decoded).contents());
		
		$comment.append('<div class="comment-social"><span class="comment-username">'+item.data.author+'</span> <span class="comment-points">'+(item.data.ups - item.data.downs)+' points</span></div>');
		
		//remove the <div> wrapper what reddit gives us. 
		//.contents() returns the text nodes also - unlike children()
		$comment.append($(decoded).contents().hide().fadeIn());
		$loaderImg.hide();
		$('#container').masonry('reload');
	}); 
}

/**
 * Save, or if it's already exists then retrieve the Settings object (global)
 */
function retrieveSettings() {
	//set default subreddits
	//in firefox not defined item is null not 'undefined' like in chrome -_- 
	if ('undefined' == typeof localStorage['settings'] || null == localStorage['settings']) {
		localStorage.setItem('settings', JSON.stringify(Settings));
	} else {
		Settings = JSON.parse(localStorage.getItem('settings'));
	}
}

/**
 * Call it, everytime you modify your Settings object, to save it back to localStorage
 */
function saveSettings() {
	localStorage.setItem('settings', JSON.stringify(Settings));
}

function getLoaderImg(color) {
	if(color == 'grey') {
		return '<img src="static/img/ajax-loader-grey.gif" />';
	}
	return '<img class="loaderImg" src="static/img/ajax-loader.gif" />';
}

function extensions() {
	//tiny plugin to detect if selector returns null
	//see: http://stackoverflow.com/questions/920236/jquery-detect-if-selector-returns-null
	//usage: $("#notAnElement").exists();
	$.fn.exists = function() {
		return this.length !== 0;
	}
	
	//see: http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
	Array.prototype.move = function (old_index, new_index) {
	    if (new_index >= this.length) {
	        var k = new_index - this.length;
	        while ((k--) + 1) {
	            this.push(undefined);
	        }
	    }
	    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	    return this; // for testing purposes
	};
}

/**
 * Returns the last element of an array.
 * @param Array a
 */
function arrayLastElement(a) {
	var l = a.length;
	return a[l-1];
}


//Collect the functions related to the settings panel
var SettingsPanel = {
	//Get album images from Imgur with a CORS request, sample url - http://imgur.com/a/aTRDX
	//then save the hashes to localStorage
	getAlbumImages: function(hash) {
		
		var albumUrl = 'http://imgur.com/a/' + hash;
		
		var oldUrl = Settings.imgurAlbum.albumUrl;
	
		//if the album already loaded
		if (albumUrl == oldUrl) {
			if (Settings.backgroundImgType == 'single' || Settings.backgroundImgType == 'none') {
				Settings.backgroundImgType = 'album';
				saveSettings();
				$('#albumSuccessLoader').html('<span style="color: green"><b>Done, just reload the page..</b></span>');
				return;
			}
			
			$('#albumSuccessLoader').html('<span style="color: red"><b>This album is already loaded.</b></span>');
			return;
		}
		
		//example album api url: http://api.imgur.com/2/album/aTRDX
		var apiUrl = 'http://api.imgur.com/2/album/'+hash+'.json';
	
		$.ajax({
			url: apiUrl,
			dataType: 'json',
			xhrFields: {
	      		withCredentials: false
	   		},
			success: function (data) {
				var images = data.album.images;
				hashes = [];
				
				for(var i=0; i < images.length; i++) {
					hashes.push(images[i].image.hash);
				}
				//console.log(hashes)
				Settings.backgroundImgType = 'album';
				Settings.imgurAlbum.backImgHashes = hashes;
				Settings.imgurAlbum.albumUrl = albumUrl;
				saveSettings();
				
				//show 'Done'
				$('#albumSuccessLoader').html('<span style="color: green"><b>Done, just reload the page..</b></span>');
			},
			error: function () {
				//console.log('some error happened');
				$('#albumSuccessLoader').html('<span style="color: red"><b>Can\'t find the album..check the url again.</b></span>');
			}	
		});
	},
	
	
	saveSingleImg: function(url) {
		Settings.backgroundImgType = 'single';
		Settings.singleBackgroundUrl = url;
		saveSettings();
		
		//saved.
		$('#SingleImgSuccess').html('<span style="color: green"><b>Done, background image saved.</b></span>');
	},
	
	saveSectionColorfulness: function() {
		if($('#colorfulChkBox').attr('checked')) {
			Settings.colorfulness = 0.6;
			saveSettings();
			$('#colorfulnessSuccess').fadeIn('fast').css('display', 'block').html('<span style="color: green"><b>Colorfulness turned on. Reload.</b></span>');
		} else {
			Settings.colorfulness = 0.2;
			saveSettings();
			$('#colorfulnessSuccess').fadeIn('fast').css('display', 'block').html('<span style="color: green"><b>Colorfulness turned off</b></span>');
		}
	},
	
	saveBackgroundColor:  function() {
		var color = $('#mHEX').text();
		
		Settings.backgroundColor = '#' + color;
		Settings.backgroundImgType = 'none';
		saveSettings();
	},
	
	fillSettingsFields: function() {
		$('#albumUrlInput').attr('value', Settings.imgurAlbum.albumUrl);
		$('#BackImgInput').attr('value', Settings.singleBackgroundUrl);
		$('#colorfulChkBox').attr('checked', Settings.colorfulness == 0.6 ? true : false);
		//$('#mHEX').html(Settings.backgroundColor.replace('#',''));	
	}
};

/**
 * Sets the background image based on the values in the Settings object
 */
function showBackImg() {
	if (Settings.backgroundImgType == 'none') {
		var color = Settings.backgroundColor;
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
			$('body').css('background', color);
		} else {
			$('body').css('background', color + ' url(static/img/trans-bg-filkor.png) no-repeat fixed center');
		}
	} 
	
	if (Settings.backgroundImgType == 'album') {
		var hashes = Settings.imgurAlbum.backImgHashes;
		hash = hashes[Math.floor(Math.random()*hashes.length)];
		
		var url = 'http://i.imgur.com/' + hash + '.jpg';	
		
		//set as a background, better if not check if loaded or not in my opinion..
		$('body').css('background', '#161616 url('+url+') no-repeat fixed center');
	}
	
	if (Settings.backgroundImgType == 'single') {
		$('body').css('background', '#161616 url('+Settings.singleBackgroundUrl+') no-repeat fixed center');
	}
}


/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

/**
 * Return mild colors in hex values using Fibonacci hashing
 * Some reference: http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
 * 
 * You can use directly with the 'background-color: ...'
 */
function filkor_hsvToCSS(colorfulness) {
	h = Math.random();
	s = colorfulness || 0.2;
	v = 0.95;
	golden_ratio_conjugate = 0.618033988749895;
	h = h + golden_ratio_conjugate;
	h = h % 1;
	
	//no pink! I hate pink :), only when colorfulness turned on (0.2 means it's turned off)
	if (h > 0.8 && h < 1 && colorfulness == 0.2) { h = 0.25;} 
	var color = hsvToRgb(h, s, v);
	return 'rgb('+Math.ceil(color[0])+', '+Math.ceil(color[1])+', '+Math.ceil(color[2])+')';	
}
