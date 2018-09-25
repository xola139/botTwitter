
//Rememeber you can teste the next comand .. casperjs --ssl-protocol=tlsv1 poststatus.js
var casper = require("casper").create({
        viewportSize: {
		  width: 1024,
		  height: 768,
		 },
});
//phantom.cookiesEnabled = true;
casper.start("https://twitter.com/intent/tweet", function() {
	console.log("Abriendo")
	this.capture('intentando0.png');
	this.fill('form#update-form', {
        'status':    'I am watching you',
        'session[username_or_email]':    '',
        'session[password]':   ''
    }, true);
	
});


casper.run();