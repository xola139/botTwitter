var config  = require('./config');
var mongoose = require('mongoose');
var Promos = require('./models/Promos.js');
var Images = require('./models/Images.js');
var Disponible = require('./models/Disponible.js');
var fs = require('fs');

mongoose.Promise = global.Promise;
mongoose.connect(config.conectDB.link).then(()=> console.log("conexion exitosa Mlab")).catch(function(err){ console.error(err)});

/* Set Twitter search phrase */
var TWITTER_SEARCH_PHRASE = '#technology OR #design';

var Twit = require('twit');

var Bot = new Twit({
        consumer_key: config.twitter.TWITTER_CONSUMER_KEY,
        consumer_secret: config.twitter.TWITTER_CONSUMER_SECRET,
        access_token: config.twitter.TWITTER_ACCESS_TOKEN,
        access_token_secret: config.twitter.TWITTER_ACCESS_TOKEN_SECRET
});

console.log('The bot is running...');

function getProfile(userrr){
    
    var options = { screen_name: userrr};
      
    Bot.get('users/show', options , function(err, data) {
      

    Images.findOne({id:userrr}, function (err, image) {
        if (err) return next(err);
        image.avatar = data.profile_image_url.replace("_normal.jpg","_400x400.jpg");
        image.descripcion = data.description;
        Images.findByIdAndUpdate(image._id, image, function (err, post) {
            if (err) return next(err);
            console.log(getTime()+" -- save update Image details in profle!!!"+image.id);
                        
        });
    });

    })
}

var validaFecha = function(doc){

        var date1 = new Date();
        var date2 = new Date(doc.timemsString); //less than 1
        var start = Math.floor(date1.getTime() / (3600 * 24 * 1000)); //days as integer from..
        var end = Math.floor(date2.getTime() / (3600 * 24 * 1000)); //days as integer from..
        var daysDiff =  start - end ; // exact dates

        return daysDiff;

}



function getTime(){
    return utc = new Date().toJSON().slice(0,19).replace(/-/g,'/').replace(/T/g,'  ');
}




fs.readFile('/home/ulfixdev/projectsJavaScript/Scrapping/scrap-image/links.txt', function(err, f){
    var array = f.toString().split('\n');
    
    for(i in array) {
    if(array[i].length >0){
        //Init operation
        getProfile(array[i].replace(/(\n|\r)+$/, ''));
        
    }
    }

    setTimeout(function(){mongoose.connection.close()}, 20000);

});