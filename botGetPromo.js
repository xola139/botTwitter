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
        var options = { screen_name: config.userView.user ,count:100};
        
        Bot.get('statuses/home_timeline', options , function(err, data) {
        console.log(getTime() + " get numer twiits  "+data.length);
          for (var i = 0; i < data.length ; i++) {
            evaluaPromos(data[i]);
            evaluaDisponible(data[i]);
          }
        })
}


var evaluaDisponible = function(data){
       var texto = data.text.toUpperCase();
       if(texto.indexOf('DISPONIBLE')> -1 || texto.indexOf('DISPO')> -1 || texto.indexOf('ACTIVA')> -1){
            var theData = {};
            theData.id = data.user.screen_name;
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
        if(texto.indexOf('PROMO')> -1 || texto.indexOf('PROMOCION')> -1 ){
                var theData = {};
                theData.id = data.user.screen_name;
                theData.avatar = data.user.profile_image_url.replace("_normal.jpg","_400x400.jpg");
                theData.promos =[{descripcion : data.text,created_at:data.created_at,idTwit:data.id,id_str:data.id_str}];
                saveDataPromo(theData);
        }

}

//Funcion que inserta en DB
var insertIfNoRecordFound = function (data){

                console.log(data);
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
    Promos.findOne({id : data.id},function (err,promo) {
        if (err) return next(err);

        if(!promo){
            Images.findOne({id : data.id},function (err,images) {
                if (err) return next(err);
                if(images != null)
                    data.fk_images = images._id;
                insertIfNoRecordFound(data);
            });
        }else{
            promo.promos.push(data.promos[0])
            updateRecordFound(promo);
    }
 });

};


var saveDataDisponible = function (data){


        Disponible.findOne({id : data.id},function (err,dispo) {
                if (err) return next(err);
                if(dispo == null){
                        Disponible.create(data, function (err, post) {
                                if (err) return next(err);
                                console.log(getTime() +"  save register Disponible");
                        });
                }else{
                    dispo.disponibles.push(data.disponibles[0]);
                    Disponible.findByIdAndUpdate(dispo._id, dispo, function (err, post) {
                        
                    if (err) return next(err);
                    console.log(getTime()+" -- save update Disponible");
                    });
                }
        });


       

};


setInterval(getHomeTimeLine, 20*60*1000);

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
    return utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
}
