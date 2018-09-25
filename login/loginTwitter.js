var casper = require('casper').create({
      clientScripts: ['jquery-3.3.1.min.js'] ,
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'

    }
});
var config  = require('../config');



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
            casper.wait(3000);
            this.echo("loaded again" + count);
            this.capture('Home.png');
            var jsonResult = _this.evaluate(function(){
            var pageTweets = document.getElementsByClassName('js-stream-item');
            var result = new Array();
            
            for(var i=0; i < pageTweets.length; i++){
                var theItem = $(pageTweets[i].innerHTML);
                var res = {};
                res.tweetId = theItem[0].dataset.tweetId;
                res.textcontainer = theItem.find('.js-tweet-text-container > p')[0].innerText;
                res.username = theItem.find('.username')[0].innerText;
                res.datatimeamp = theItem.find('.tweet-timestamp')[0].title;

                var _timestamp = theItem.find('._timestamp');
                res.datatimems = _timestamp[0].dataset.time;
                res.datatime = _timestamp[0].dataset.timeMs;

                result.push(res);
                
                
            }
            return result;  
        });
        
        var diponibles = [];
        if(jsonResult != null){
            for(var x=0;x<jsonResult.length;x++){
                
                var contenido = jsonResult[x].textcontainer.toUpperCase();
                jsonResult[x].ciudad = validaCiudad(contenido);
                
                if(contenido.indexOf('DISPONIBLE') > -1 || contenido.indexOf('ACTIVA') > -1 || jsonResult[x].ciudad != '' )
                    diponibles.push(jsonResult[x]);

            }

            for(var xx=0;xx < diponibles.length;xx++){
                console.log(JSON.stringify(diponibles[xx]));
                

                
            }
        }
        

        
        sleep(60); 
        count++;
        if(count < 50)
            twettwet(_this)
      
      
    });


            
}


var ciudades = ['AGUASCALIENTES','BAJA_CALIFORNIA','BAJA_CALIFORNIA_SUR','CUERNAVACA','CAMPECHE','CHIAPAS','CHIHUAHUA','COAHUILA','COLIMA','CDMX','ESTADO','DURANGO','GUANAJUATO','GUERRERO','JALISCO','MICHOACÁN','MICHOACAN','MORELOS','NAYARIT','LEÓN','LEON','OAXACA','PUEBLA','QUERÉTARO','QUERETARO','QUINTANA','POTOSÍ','POTOSI','SINALOA','SONORA','TABASCO','TAMAULIPAS','TLAXCALA','VERACRUZ','YUCATÁN','YUCATAN','ZACATECAS','XALAPA','CANCUN','CANCÚN'];

 function validaCiudad(texto){
    
        var len = ciudades.length;
        for(var i = 0 ; i < len;i++)
        {
            if(texto.indexOf(ciudades[i])> -1){
                switch (ciudades[i]) {
                  case "ESTADO":
                    return "ESTADO DE MÉXICO";
                    break;
                  case "MICHOACAN":
                    return "MICHOACÁN";
                    break;
                  case "QUINTANA":
                    return "QUINTANA ROO"
                    break;
                  case "LEON":
                    return "LEÓN"
                    break;
                  case "POTOSÍ":
                    case "POTOSI":
                    return "SAN LUÍS POTOSÍ";
                  case "YUCATAN":
                    return "YUCATÁN";
                    break;
                  case "CANCUN":
                    return "CANCÚN";
                  break;
                    
                  }
                
                return ciudades[i] ;
            }
        }
        return '';
    
    }




function sleep(seconds){
    var waitUntil = new Date().getTime() + seconds*1000;
    while(new Date().getTime() < waitUntil) true;
}

casper.run();