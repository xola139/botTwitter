/*!
 * Bot.js : A Twitter bot that can retweet in response to the tweets matching particluar keyword
 * Version 1.0.0
 * Created by Debashis Barman (http://www.debashisbarman.in)
 * License : http://creativecommons.org/licenses/by-sa/3.0
 https://gist.github.com/xola139/4aa3a4b10c7378826c5a8c62ac3e8b60
 https://medium.com/@DebashisBarman/creating-a-twitter-bot-with-node-js-bea760b80bd5
 */

/* Configure the Twitter API */
var TWITTER_CONSUMER_KEY = '';
var TWITTER_CONSUMER_SECRET = '';
var TWITTER_ACCESS_TOKEN = '';
var TWITTER_ACCESS_TOKEN_SECRET = '';

/* Set Twitter search phrase */
var TWITTER_SEARCH_PHRASE = '#technology OR #design';

var Twit = require('twit');

var Bot = new Twit({
	consumer_key: TWITTER_CONSUMER_KEY,
	consumer_secret: TWITTER_CONSUMER_SECRET,
	access_token: TWITTER_ACCESS_TOKEN, 
	access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
});

console.log('The bot is running...');

/* BotInit() : To initiate the bot */
function BotInit() {
	Bot.post('statuses/retweet/:id', { id: '988795879082651648' }, BotInitiated);
	
	function BotInitiated (error, data, response) {
		if (error) {
			console.log('Bot could not be initiated, : ' + error);
		}
		else {
  			console.log('Bot initiated : 988795879082651648');
		}
	}
	
	BotRetweet();
}

/* BotRetweet() : To retweet the matching recent tweet */
function BotRetweet() {

	var query = {
		q: TWITTER_SEARCH_PHRASE,
		result_type: "recent"
	}

	Bot.get('search/tweets', query, BotGotLatestTweet);

	function BotGotLatestTweet (error, data, response) {
		if (error) {
			console.log('Bot could not find latest tweet, : ' + error);
		}
		else {
			var id = {
				id : data.statuses[0].id_str
			}

			Bot.post('statuses/retweet/:id', id, BotRetweeted);
			
			function BotRetweeted(error, response) {
				if (error) {
					console.log('Bot could not retweet, : ' + error);
				}
				else {
					console.log('Bot retweeted : ' + id.id);
				}
			}
		}
	}
}

function lastThreeTwit(){
	var options = { screen_name: 'xola139',count: 3 };

	Bot.get('statuses/user_timeline', options , function(err, data) {
	  for (var i = 0; i < data.length ; i++) {
	    console.log(data[i].text);
	  }
	})
}

function firtStream(){
	// 
	//  filter the twitter public stream by the word 'mango'. 
	// 
	var stream = Bot.stream('statuses/filter', { track: 'excelente' })
	 
	stream.on('tweet', function (tweet) {
	  console.log(tweet)
	})
}

function secondStream(){
	// 
	//  filter the twitter public stream by the word 'mango'. 
	// 
	var options = { screen_name: 'xola139' };
	var stream = Bot.stream('statuses/home_timeline')
	 
	stream.on('tweet', function (tweet) {
	  console.log(tweet)
	})
}


function getHomeTimeLine(){
	var options = { screen_name: 'xola139',count: 1 };

	Bot.get('statuses/home_timeline', options , function(err, data) {
	  for (var i = 0; i < data.length ; i++) {
	    console.log(data[i]);
	  }
	})
}

/* Set an interval of 30 minutes (in microsecondes) */
//setInterval(BotRetweet, 5*60*1000);

/* Initiate the Bot */
//BotInit();

//lastThreeTwit();
//firtStream();

//getHomeTimeLine();

//secondStream();

setInterval(getHomeTimeLine, 1*60*1000);

getHomeTimeLine();