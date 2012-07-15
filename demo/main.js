/**
 * @author Adam Filkor <adam.filkor at gmail.com>
 * @website http://filkor.org
 */

$(document).ready(function(){
	
	init();
	
	//it's not the 'full' list of subreddits, but contains the most popular of them (only the top 250, because we to keep the live search fast.  
	var fullSubredditList = ["front","pics","funny","politics","gaming","askreddit","worldnews","videos","iama","todayilearned","wtf","aww","atheism","technology","science","music","webdev","announcements","blog","adviceanimals","frontPage","programming","offbeat","entertainment","comics","nsfw","business","geek","bestof","economics","humor","gadgets","environment","news","wikipedia","linux","sex","movies","scifi","space","doesanybodyelse","cogsci","food","philosophy","marijuana","frugal","fffffffuuuuuuuuuuuu","self","health","books","history","photography","math","worldpolitics","sports","apple","web_design","art","howto","happy","energy","netsec","libertarian","webgames","diy","tldr","lolcats","obama","economy","psychology","conspiracy","canada","xkcd","fitness","design","drugs","python","photos","listentothis","cooking","compsci","sexy","trees","4chan","physics","software","writing","relationship_advice","freethought","skeptic","opensource","hardware","twoxchromosomes","wearethemusicmakers","video","lgbt","mensrights","anarchism","beer","guns","pictures","documentaries","android","bicycling","tf2","women","religion","coding","astronomy","iphone","youshouldknow","bacon","ubuntu","itookapicture","circlejerk","cannabis","craigslist","zombies","webcomics","opendirectories","lectures","woahdude","collapse","lists","javascript","ps3","carlhprogramming","travel","green","anime","christianity","pic","hackers","google","firefox","australia","lost","government","military","linguistics","zenhabits","tech","japan","rpg","ruby","socialism","starcraft","worstof","shittyadvice","newreddits","somethingimade","robotics","guitar","education","cpp","metal","haskell","moviecritic","seduction","mma","ronpaul","productivity","php","buddhism","nature","feminisms","jokes","computersecurity","unitedkingdom","astro","windowshots","bad_cop_no_donut","reverseengineering","literature","tipofmytongue","browsers","chemistry","pets","lisp","soccer","socialmedia","celebrities","philosophyofscience","architecture","hockey","wallpapers","bestofcraigslist","truereddit","perl","secretsanta","fashion","equality","suicidewatch","conspiracies","redditstories","meetup","torrents","youtube","doctorwho","india","ukpolitics","wow","l33t","xbox360","israel","recipes","homebrewing","usa","europe","mac","tedtalks","electronicmusic","dailywtf","law","osx","interestingasfuck","graffiti","biology","autos","evolution","apathy","redditchan","linux4noobs","vegan","lostgeneration","startups","anthropology","nyc","gardening","django","facebookquotes","java","911truth","transhuman","vim","sociology","things","cheap_meals","csbooks","gamedev","blackops","dubstep","idea","microsoft","ilivein","television","uspe08","drunk","area51","indiegaming","machinelearning","starwars","quotes","trippy","lol","ufos"];	
	
	//Set up our custom typeahead ('live' searching for subreddits)
	$('#search').typeahead({
		source : fullSubredditList,
		subscribed: Settings.subreddits,
		items: 16,
		highlighter : function(item) {
			//just don't wrap
			return item;
		},
		
		parent: '#subreddit-manager',
		
		//$tag is the JQuery object we clicked on, titled 'funny' or 'pics'
		onSelection: function($tag){
			var subredditName = $tag.attr('data-value');
			var newClassName = ''; 
			
			
			if ($tag.hasClass('unsubscribed')) {
				//If we subscribe to a subreddit
				var $sectionDiv = makeSectionDiv(subredditName);
				populateData(subredditName);
				$('#container').append($sectionDiv).masonry('reload');
				
				if( /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) || !Modernizr.backgroundsize) {
					newClassName = 'subscribed-noimg';
				} else {
					newClassName = 'subscribed';
				}
				Settings.subreddits.push(subredditName);
				
				
				//SET EVENT HANDLERS FROM HERE
				//set up the move button here for the newly created element
				$('.move-button').click(function(){
					var self_subredditName = $(this).attr('data-move'); //IMPORTANT, DON'T USE THE OUTER subredditName HERE !
					$('#section-' + self_subredditName).prependTo('#container');
					$('#container').masonry('reload');
					
					//move to the beginning and update the localStorage
					Settings.subreddits.move(Settings.subreddits.indexOf(self_subredditName), 0);
					saveSettings();
				});	
				
								
				//set the close button here for the newly created element
				$('#section-' + subredditName+ ' .close-button').click(function(){
					var self_subredditName = $(this).attr('data-close');
					$('#section-' + self_subredditName).remove();
					$('#container').masonry('reload');
					
					//remove from localStorage
					Settings.subreddits.splice(Settings.subreddits.indexOf(self_subredditName),1);
					saveSettings();
					
					//triggering onkeyup on #search input will and typeahead will 'reload'. should use more clear method here..
					$('#search').trigger('keyup');

				});
								
				
			}
			
			if ($tag.hasClass('subscribed') || $tag.hasClass('subscribed-noimg')) {
				$('#section-' + subredditName).remove();
				$('#container').masonry('reload');
				newClassName = 'unsubscribed';
				//remove element 
				//see for more: http://stackoverflow.com/questions/3596089/how-to-add-and-remove-array-value-in-jquery
				Settings.subreddits.splice(Settings.subreddits.indexOf(subredditName),1);
			}
			
			//lastly set the class Name
			$tag.attr('class', newClassName);
			saveSettings();
		}
	});
	
	
	showInitialSections();
	
	//set initial onclick to all sections
	$('.close-button').click(function(){
		var subredditName = $(this).attr('data-close');
		$('#section-' + subredditName).remove();
		$('#container').masonry('reload');
		
		//remove from localStorage
		Settings.subreddits.splice(Settings.subreddits.indexOf(subredditName),1);
		saveSettings();
		$('#search').trigger('keyup');
	});
	
	$('.move-button').click(function(){
		var subredditName = $(this).attr('data-move');
		$('#section-' + subredditName).prependTo('#container');
		$('#container').masonry('reload');
		
		//move to the beginning and update the localStorage
		Settings.subreddits.move(Settings.subreddits.indexOf(subredditName), 0);
		saveSettings();
	});	
	
	
	//we show the background image 
	showBackImg();
	
	//lastly we set the color picker, to save load time..
	setColorPicker();
});

/**
 * Show initial subreddit sections (create the <div>-s then fill with data we get from Reddit)
 */
function showInitialSections() {
	$.each(Settings.subreddits, function(urlIndex, section){
		var sectionDiv = makeSectionDiv(section);
		$('#container').append(sectionDiv);
		
		populateData(section);
	});
	
	
	//Initiate masonry when all items loaded - via custom event
	$(document).bind('allItemsLoaded', function(){
		
		//if the little thumbnail-s are loaded. 
		//IMPORTANT, without this, the sections sometimes ended up on each other
		//see: https://github.com/alexanderdickson/waitForImages
		$('#container').waitForImages(function(){
			$('#container').masonry({
				itemSelector: '.section',
				columnWidth: 1,
				isFitWidth: true,
				
				 isAnimated: true,
				  animationOptions: {
				    duration: 300,
				    easing: 'linear',
				    queue: false
				  }			
			});	
		});
		
	});
}


/**
 * Set up onclick handlers and such..
 */
function init() {
	
	//tiny extensions.. like Array.prototype.move or move.empty()
	extensions();
	
	//get settings - from localStorage or defaults.js
	retrieveSettings();
	
	//fill the current settings in the settings panel
	SettingsPanel.fillSettingsFields();
	
	$('#edit-link').click(function(){
		$('#subreddit-manager').slideToggle('fast');
			
	});
	
	$('#hide-button').click(function(){
		$('#edit-link').fadeToggle('fast');
		$('#container').fadeToggle('fast');
		if ($('#subreddit-manager').css('display') != 'none') {
				$('#subreddit-manager').fadeOut('fast');	
		}
		
		var text = $(this).text() == 'Hide me' ? 'Show me' : 'Hide me';
		$(this).text(text);  
	});
	
	//set up accordion on the settings panel
	$('#settings-accordion').accordion({
		header:'h3', 
		collapsible: true,
		active: false,
		autoHeight: false
	});	
	
	//to show the settings panel
	$('#settings-button').click(function(){
		//we need this little hack here because the jQuery accordion not really works with display: none; , 
		//but fadeToggle not works with visibility:hidden...OMG :)
		//see: http://stackoverflow.com/questions/2435751/jquery-fade-element-does-not-show-elements-styled-visibility-hidden
		if ($('#settings').css('visibility') == 'hidden') {
			$('#settings').css('visibility', 'visible').hide();
		}
		$('#settings').fadeToggle('fast');
	});
	
	$('#saveAlbumBtn').click(function(){
		$('#albumSuccessLoader').html('<img src="static/img/ajax-loader-grey.gif"/>');
		$('#albumSuccessLoader').fadeIn('fast').css('display', 'block');
		
		var url = $('#albumUrlInput').attr('value');
		
		var match = url.match(/^(https?:\/\/)?imgur\.com\/a\/([0-9a-zA-Z]{5})\/?#?\d?$/);
		if(null === match) {
			//wrong url
			$('#albumSuccessLoader').html('<span style="color: red"><b>Wrong url, try again please.</b></span>');
			return;
		} else {
			var hash = match[2]; 
		}
		SettingsPanel.getAlbumImages(hash);
	});
	
	$('#saveSingleBtn').click(function(){
		$('#SingleImgSuccess').fadeIn('fast').css('display', 'block');
		
		var url = $('#BackImgInput').attr('value');
		var match = url.match(/\.(jpg|png|gif)$/);
		if(null === match) {
			//wrong url
			$('#SingleImgSuccess').html('<span style="color: red"><b>Wrong url, try again please.</b></span>');
			return;
		} else {
			SettingsPanel.saveSingleImg(url);
		}		
	});
	
	$('#saveColorBtn').click(function(){
		SettingsPanel.saveBackgroundColor();
	});
	
	$('#moreColorfulBtn').click(function(){
		SettingsPanel.saveSectionColorfulness();
	});
}

