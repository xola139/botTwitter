var casper = require('casper').create({
    verbose: true,
    // logLevel: 'debug',
    pageSettings: {
    	userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36'
    },
	waitTimeout: 10000,
	pageSettings: {
		loadImages:  true,
		loadPlugins: true
	},
	viewportSize: {
		width: 1280,
		height: 10000
	}
});

var url = 'https://twitter.com/login';

var username = "";
var password = "";

casper.start(url, function() {
    this.echo("Loading " + url);
});

casper.then(function() {
	console.log("Login using username and password");
    this.evaluate(function(){
        document.getElementsByName("session[username_or_email]")[1].value="";
        document.getElementsByName("session[password]")[1].value="";
        //document.getElementsByClassName('flex-table-btn')[1].click();
        document.getElementsByClassName('submit')[1].click();
    });
/*
	this.waitForSelector('.t1-form.clearfix.signin, .js-password-field, .js-username-field',
	    function pass() {

	    	this.echo("*** PASS: Form loaded");

	        // Fill out form
			this.fillSelectors('.t1-form.clearfix.signin', {
			    ".js-username-field": username,
			    ".js-password-field": password
			}, true);

			// Click login
			this.click('.submit');
			this.echo("Submitted login...");


	    },
	    function fail() {
	    	this.capture("failed1.png");
	        this.log("Page FAILED to load", "error");
	    }
	);*/
});

//Make a screenshot of home page
casper.waitWhileSelector('.DashboardProfileCard-avatarImage', function() {
    console.log("Make a screenshot of Home page");
    this.capture('Home.png');
});

function likeTopTweets(self){
       // Just loading a random tweet to test the script with
	casper.start('https://twitter.com/ANRPFD/status/646591333205831680', function() {
		self.waitForSelector('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite',
			function pass() {

				self.echo("*** PASS: Loaded page");

				this.capture("tweet.png");

				self.wait(2000, function(){
					if (this.exists('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite')) {
						self.echo("Button found! Content:");
						self.echo(self.getElementInfo('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite').html);

						// I get here and the content of the button is definitely there, and everything appears correctly on the screenshot					

						// ASSERT , I'm trying stuff here desperately, but nothing seem to work::
						var hey = self.evaluate(function() {
							var results = ["Hello!"];

							results.push( $('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite').html() );

							$('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite').click();
							results.push( ($( $('.tweet')[0] ).hasClass("favorited") ? "FAVED!!" : "NOT :(") );

							$('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite').trigger("click");
							results.push( ($( $('.tweet')[0] ).hasClass("favorited") ? "FAVED!!" : "NOT :(") );

							$('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite .IconContainer.js-tooltip').click();
							results.push( ($( $('.tweet')[0] ).hasClass("favorited") ? "FAVED!!" : "NOT :(") );

							$('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite .IconContainer.js-tooltip').trigger("click");
							results.push( ($( $('.tweet')[0] ).hasClass("favorited") ? "FAVED!!" : "NOT :(") );

							$('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite .IconContainer.js-tooltip .Icon--favorite').click();
							results.push( ($( $('.tweet')[0] ).hasClass("favorited") ? "FAVED!!" : "NOT :(") );

							$('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite .IconContainer.js-tooltip .Icon--favorite').trigger("click");
							results.push( ($( $('.tweet')[0] ).hasClass("favorited") ? "FAVED!!" : "NOT :(") );

							return results;
							
						});
						self.echo(hey);						

					} else {
						this.echo('Didnt exist :(');
					}

					// self.evaluate(function(){
					// 	$('.js-stream-item.stream-item .ProfileTweet-actionButton.js-actionFavorite').each(function(){
					// 		$(this).click();
					// 	});
					// });
				});
		    },
		    function fail() {
		        self.log("Hashtags not loaded...", "error");
		    }
		);
	});
}

casper.then(function() {

	var self = this;

	// Wait for Logo to load
	self.waitForSelector('.Icon--bird',
	    function pass() {
	        self.echo("*** PASS: Logged in, page loaded");
	        
	        // Entering main automation logic
	        likeTopTweets(self);
	    },
	    function fail() {
	    	self.capture("failed2.png");
	        self.log("Page FAILED to load", "error");
	    }
	);  
});

function restartLogic(){
	likeTopTweets();
}

// Restart on error
casper.on('error', function(msg, backtrace) {
	restartLogic();
});

// Restart on end
casper.run(function() {
    restartLogic();
});