var casper = require('casper').create({
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'

    }
});


//First step is to open Twitter
casper.start().thenOpen("https://twitter.com/login", function() {
    console.log("Open Twitter");
});

//Now we have to populate username and password, and submit the form
casper.then(function(){
    console.log("Login using username and password");
    this.evaluate(function(){
        document.getElementsByName("session[username_or_email]")[1].value="motelesenpuebla";
        document.getElementsByName("session[password]")[1].value="soylaverdura139";
        //document.getElementsByClassName('flex-table-btn')[1].click();
        document.getElementsByClassName('submit')[1].click();
    });
});

//Make a screenshot of home page
casper.waitWhileSelector('.DashboardProfileCard-avatarImage', function() {
    console.log("Make a screenshot of Home page");
    this.capture('Home.png');
});

casper.then(function(){
    casper.wait(10000);
   twettwet(this);

});

var count=1;
function twettwet(_this){
    casper.reload(function() {
        
        while(count < 50){
            this.echo("loaded again" + count);
            var jsonResult = _this.evaluate(function(){
            var pageTweets = document.getElementsByClassName('js-tweet-text');
            var result=new Array();
            for(var i=0; i < pageTweets.length; i++){
                result.push(pageTweets[i].innerHTML);
            }
            return JSON.stringify(result);  
        });
        console.log(jsonResult);
        sleep(30); 
        count++;

        }
        
        
      
    });
   
   
    
    //if(count<100)twettwet(_this);
    //count++;

            
}

function sleep(seconds){
    var waitUntil = new Date().getTime() + seconds*1000;
    while(new Date().getTime() < waitUntil) true;
}

casper.run();