


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

function updateProfileOnline(){

Images.find( function (err, images) {

    if(err)console.log(err);
    
    
     //   for(var ii=0;ii<images.length;ii++){
            
            //var options = { screen_name: images[ii].id};
            var options = { screen_name: 'xola139',count:50};
            Bot.get('users/show', options , function(err, data) {
                console.log(data);

                /*Images.findOne({id:data.screen_name}, function (err, image) {
                   if(image == null)
                    return;
                    if (err) return next(err);

                    image.avatar = data.profile_image_url.replace("_normal.jpg","_400x400.jpg");
                    image.descripcion = data.description;
                    Images.findByIdAndUpdate(image._id, image, function (err, post) {
                        if (err) return next(err);
                        console.log(getTime()+" -- save update Image details in profle!!!"+image.id);
                                    
                    });
                });*/

            })


   // }

});

      
    
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




updateProfileOnline();

    setTimeout(function(){mongoose.connection.close()}, 20000);


