var config  = require('./config');
var mongoose = require('mongoose');
var Promos = require('./models/Promos.js');
var Images = require('./models/Images.js');
var Disponible = require('./models/Disponible.js');


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

function getHomeTimeLine(){
        var options = { screen_name: config.userView.user ,count:200};
        
        Bot.get('statuses/home_timeline', options , function(err, data) {
        console.log(getTime() + " get numer twiits  "+data.length);
          /*for (var i = 0; i < data.length ; i++) {
                evaluaPromos(data[i]);
                evaluaDisponible(data[i]);

          }*/
        })
}


var evaluaDisponible = function(data){

        //var condicion ="locales";
       var texto = data.text.toUpperCase();
       
       //if(texto.indexOf(condicion.toUpperCase())> -1  ){
       if(texto.indexOf('DISPONIBLE')> -1 || texto.indexOf('DISPO')> -1 || texto.indexOf('ACTIVA')> -1){
            var theData = {};
            theData.id = data.user.screen_name;
            theData.profile_image_url = data.user.profile_image_url.replace("_normal.jpg","_400x400.jpg");
            theData.disponibles=[{descripcion:data.text,ciudad :validaCiudad(data.text),created_at:data.created_at}];
            saveDataDisponible(theData);

        }

}

var ciudades = ['CDMX','PUEBLA','CUERNAVACA','GUADALAJARA','QUERETARO','AGUAS','OAXACA','MONTERREY','MEXICO','CANCUN']
var validaCiudad = function(texto){

    var len = ciudades.length;
    for(var i = 0 ; i < len;i++)
    {
        if(texto.indexOf(ciudades[i])> -1){return ciudades[i];}
    }
    return '';

}

var evaluaPromos = function(data){

        var texto = data.text.toUpperCase();
       // var condicion ="look"
       if(texto.indexOf('PROMO')> -1 || texto.indexOf('PROMOCION')> -1 ){
       // if(texto.indexOf(condicion.toUpperCase())> -1  ){


                var theData = {};
                theData.id = data.user.screen_name;
        //theData.profile_image_url = data.user.profile_image_url;
                theData.avatar = data.user.profile_image_url.replace("_normal.jpg","_400x400.jpg");
                theData.promos =[{descripcion : data.text,created_at:data.created_at,idTwit:data.id,id_str:data.id_str}];

                saveDataPromo(theData);

        }

}

//Funcion que inserta en DB
var insertIfNoRecordFound = function (data){
        Promos.create(data, function (err, post) {
                if (err) return next(err);
                console.log(getTime()+ " -- save register Promo!! ");
        });
};

//Funcion que inserta en DB
var updateRecordFound = function (data){
        Promos.findByIdAndUpdate(data._id, data, function (err, post) {
        if (err) return next(err);
        console.log(getTime()+" -- save update Promo");
        });
};



var saveDataPromo = function (data){
        return new Promise(function(resolve, reject) {
                Promos.find({id: data.id},function(err, promo) {
                  if (err) {
                    reject(err);
                  } else {
                        if(promo.length == 0){
                                insertIfNoRecordFound(data);
                        }else{
                                promo[0].promos.push(data.promos[0])
                                updateRecordFound(promo[0]);
                        }                                          
                    resolve(promo);
                }          
                });
        });
};


var saveDataDisponible = function (data){
        
        return new Promise(function(resolve, reject) {
                Disponible.find({id: data.id},function(err, dispo) {
                  if (err) {
                    reject(err);
                  } else {

                        if(dispo.length == 0){
                                Disponible.create(data, function (err, post) {
                                        if (err) return next(err);
                                        console.log("save register Disponible");
                                        updateDisponible(data);
                                });
                        }else{
                                
                                dispo[0].disponibles.push(data.disponibles[0])
                                Disponible.findByIdAndUpdate(dispo[0]._id, dispo[0], function (err, post) {
                                        if (err) return next(err);
                                        console.log(getTime()+" -- save update Disponible");
                                        updateDisponible(data);
                                        });
                        }                                           
                    resolve(dispo);
                }          
                });
        });
};


//setInterval(getHomeTimeLine, 20*60*1000);

//Init operation
getHomeTimeLine();




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

var updateDisponible = function(data){
       
        Images.findOne({id:data.id},function(err, image) {
                if (err)
                    console.log(err);
        if(image == null)
            return;
                
                //Para actualizar el status disponibilidad
                image.disponible = true;
                Images.findByIdAndUpdate(image._id, image, function (err, post) {
                        if (err) return next(err);
                        console.log(getTime()+" -- save update Disponible in Image!!!");
                        
                });
                
                data.fk_images = image._id;
                Disponible.find({id:data.id},function(err, disponible) {
                    if(err)console.log(err);
                    Disponible.findByIdAndUpdate(disponible._id, data, function (err, post) {
                        if (err) return next(err);
                        console.log(getTime()+" -- save fk_images reference in disponible");
                    });

                });

                
        });
}

setTimeout(function(){mongoose.connection.close()}, 20000);
