/**
 * Default initial values..shows the structure of the Settings object
 * We will store it later in the localStorage
 */
var Settings = {
	version: '1.0',
	subreddits : ['pics', 'funny', 'wtf'],
	colors : {
		'light-gray' : '#eeeeee',
	},
	colorfulness : 0.6, //0.2, or 0.6
	backgroundImgType: 'single',  //could be: 'none, single, or album'
	backgroundColor: '#5aa', /*#FF2351*/
	singleBackgroundUrl: 'http://i.imgur.com/qJYSo.jpg',//url when the background image type is 'single' example: http://i.imgur.com/thJvn.jpg
	imgurAlbum : {
		albumUrl: '',
		backImgHashes: ['Qd0Yw', 'xRo5B', '3VyB0', '9YxQ8']
	}
	
}