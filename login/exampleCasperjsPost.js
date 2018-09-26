var casper = require('casper').create({
      clientScripts: ['jquery-3.3.1.min.js'] ,
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'

    }
});

casper.start();

casper.open('http://localhost:3000/images/xola139', {
    method: 'post',
    headers: {
           'Content-Type': 'application/json; charset=utf-8'
       },
       encoding: 'utf8', // not enforced by default
    
});

casper.then(function() {
    this.echo('POSTED it.');
});

casper.run();