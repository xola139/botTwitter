var config  = require('./config');
var mongoose = require('mongoose');
var Promos = require('./models/Promos.js');
var Images = require('./models/Images.js');
var Disponible = require('./models/Disponible.js');
var _ = require('underscore');

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



console.log('The bot is running...getMediaUsersVip...');

function getMediaUsersVip(){
    Images.find({status:true},function (err, images) {
        if (err) console.log(err);
            for(var i=0;i<images.length;i++){
                var options = { screen_name: images[i].id,count:50};

                var result = evaluateImages(images[i],options)
                console.log(result);
            }
    });
}

function updateImageProfileDispinible(){
    Disponible.find({status:true},function (err, disponibles) {
        if (err) console.log(err);
            for(var i=0;i<disponibles.length;i++){
                var options = { screen_name: disponibles[i].id,count:100};

                var result = updateImageProfile(disponibles[i],options)
                console.log(result);
            }
    });
}


function updateImageProfile(disponibles,options){

   return new Promise(function(resolve, reject) {
       Bot.get('statuses/user_timeline', options , function(err, data) {

            //extramos la media actaual
            if (err) {
                reject(err);
            } else {
                var _id = disponibles._id;
                delete disponibles._id;
                disponibles.profile_image_url = data[0].user.profile_image_url_https.replace("_normal","");;

                Disponible.findByIdAndUpdate(_id, disponibles, function (err, disponibleUpdate) {
                    if (err){ console.log(err);return false;}
                        console.log("Update avatar profile de imagenes!!" + disponibleUpdate.id);
                        resolve(disponibleUpdate);
                });
            }

             
        });
    });
}



function evaluateImages(images,options){

   return new Promise(function(resolve, reject) {
                       Bot.get('statuses/user_timeline', options , function(err, data) {
                            var arrImageActual = [];
			    var _user =  options.screen_name;
				
                            //extramos la media actaual
                            if (err) {
                                reject(err);
                            } else 

                                 console.log("Actualizar media de " + _user);
                                for(var z=0;z<data.length;z++){
                                    if(data[z].entities.media){
                                        var _m = data[z].entities.media;
                                        for(var x=0;x<_m.length;x++){
                                            delete _m[x].indices;
                                            delete _m[x].sizes;
                                            _m[x].status = "foto";
                                            arrImageActual.push(_m[x]);
                                        }    
                                    }
                                }

                            
                            var diff = _.difference(_.pluck(arrImageActual, "id"), _.pluck(images.images, "id"));    
                            var result = _.filter(arrImageActual, function(obj) { return diff.indexOf(obj.id) >= 0; });

			                 console.log(_user + "Ya estan guardados--> "+ images.images.length + "Hay nuevas img--->"+result.length);
                            if(result.length>0){
                                 for(var zz=0;zz<result.length;zz++){
                                    images.images.push(result[zz]);
                                }
                            
                                updateImage = images;   
                                 delete updateImage._id;
                                
                                Images.findByIdAndUpdate(images._id, updateImage, function (err, imageUpdate) {
                                if (err){ console.log(err);return false;}
                                    console.log("Update arreglo de imagenes!!" + imageUpdate.id+ "====="+  imageUpdate.images.length);
                                    resolve(imageUpdate);
                                });

                            }
                    });
                 });
}
//Init operation
getMediaUsersVip();
updateImageProfileDispinible();

setTimeout(function(){mongoose.connection.close()}, 20000);
