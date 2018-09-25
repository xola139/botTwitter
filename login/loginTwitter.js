var casper = require('casper').create({
      clientScripts: ['jquery-3.3.1.min.js'] ,
    pageSettings: {
        loadImages: true,//The script is much faster when this field is set to false
        loadPlugins: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'

    }
});


//casper.options.waitTimeout = 10000;



//First step is to open Twitter
casper.start().thenOpen("https://twitter.com/login", function() {
    console.log("Open Twitter");
});

//Now we have to populate username and password, and submit the form
casper.then(function(){
    console.log("Login using username and password");
    this.capture('Login.png');
    this.evaluate(function(){
        document.getElementsByName("session[username_or_email]")[1].value="";
        document.getElementsByName("session[password]")[1].value="";
        //document.getElementsByClassName('flex-table-btn')[1].click();
        document.getElementsByClassName('submit')[1].click();
    });
});


//Make a screenshot of home page
casper.waitWhileSelector('.DashboardProfileCard-avatarImage', function() {
    console.log("Make a screenshot of Home page");
    this.capture('Home.png');
    this.wait(5000);
    twettwet(this);
});

var count=1;

function twettwet(_this){
    casper.reload(function() {
        
        //while(count < 50){
            this.echo("loaded again" + count);
             this.capture('Home.png');
            var jsonResult = _this.evaluate(function(){
            var pageTweets = document.getElementsByClassName('js-stream-item');

            var result = new Array();
            for(var i=0; i < pageTweets.length; i++){
                var theItem = $(pageTweets[i].innerHTML);
                var res = {};
                res.textcontainer = theItem.find('.js-tweet-text-container > p')[0].innerText;
                res.username = theItem.find('.username')[0].innerText;
                res.datatimeamp = theItem.find('.tweet-timestamp')[0].title;

                var _timestamp = theItem.find('._timestamp');
                res.datatimems = _timestamp[0].dataset.time;
                res.datatime = _timestamp[0].dataset.timeMs;
                //console.log(item.len); 
                result.push(res);
                
                
            }
            return result;  
        });
        
        for(var x=0;x<jsonResult.length;x++){
            console.log("**************************************");
            //console.log(jsonResult[x]);
            if(jsonResult[x] !=null){
                console.log(JSON.stringify(jsonResult[x]));
                
            }
        }

        console.log(jsonResult.length);
        sleep(40); 
        count++;
        if(count < 50)
            twettwet(_this)
      
      
    });


            
}

function sleep(seconds){
    var waitUntil = new Date().getTime() + seconds*1000;
    while(new Date().getTime() < waitUntil) true;
}

casper.run();