var casper = require('casper').create({
      clientScripts: ['jquery-3.3.1.min.js'] ,
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'

    }
});


casper.open('', {
    method: 'POST',
    data: {
        
        'unique_id': true
    }
}, function(response){
    console.log(response.status == 200);
        
    
});