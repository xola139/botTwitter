var config  = require('./config');
var mongoose = require('mongoose');
var Promos = require('./models/Promos.js');
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
        var options = { screen_name: config.userView.user ,count:1};
        var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');

        Bot.get('statuses/home_timeline', options , function(err, data) {

        	console.log(data);
        console.log(utc + " get numer twiits  "+data.length);
          for (var i = 0; i < data.length ; i++) {
          	
                //evaluaPromos(data[i]);
                //evaluaDisponible(data[i]);
          }
        })
}


var evaluaDisponible = function(data){
        var texto = data.text.toUpperCase();
        
        if(texto.indexOf('DISPONIBLE')> -1 || texto.indexOf('DISPO')> -1 || texto.indexOf('ACTIVA')> -1){
                var theData = {};
                theData.id = data.user.screen_name;
                theData.descripcion = data.text;
                theData.ciudad = validaCiudad(data.text);
                theData.created_at = data.created_at;
                saveDataDisponible(theData);
        }

}
var ciudades = ['CDMX','PUEBLA','CUERNAVACA','GUADALAJARA','QUERETARO','AGUAS','OAXACA','MONTERREY','MEXICO']
var validaCiudad = function(texto){

    var len = ciudades.length;
    for(var i = 0 ; i < len;i++)
    {
        if(texto.indexOf(ciudades[i])> -1){return i;}
    }
    return '';

}

var evaluaPromos = function(data){
        var texto = data.text.toUpperCase();
        
        if(texto.indexOf('PROMOCION')> -1 || texto.indexOf('PROMO')> -1 ){
                var theData = {};
                theData.id = data.user.screen_name;
                theData.avatar = data.user.profile_image_url.replace("_normal.jpg","_400x400.jpg");
                theData.promos =[{descripcion : data.text,created_at:data.created_at,idTwit:data.id,id_str:data.id_str}];
                saveData(theData);
        }

}

//Funcion que inserta en DB
var insertIfNoRecordFound = function (data){
        Promos.create(data, function (err, post) {
                if (err) return next(err);
                console.log("save registerr");
        });
};

//Funcion que inserta en DB
var updateRecordFound = function (data){
        Promos.findByIdAndUpdate(data._id, data, function (err, post) {
        if (err) return next(err);
        console.log("save update");
        });
};


var saveData = function (data){

                 Promos.findOne({id : data.id},function (err,promo) {
                    if (err) return next(err);

                        if(!promo){
                                insertIfNoRecordFound(data);
                        }else{
                                promo.promos.push(data.promos[0])
                                updateRecordFound(promo);
                        }
 });

};


var saveDataDisponible = function (data){
        Disponible.findOne({id : data.id},function (err,promo) {
                if (err) return next(err);
                if(!promo){
                        Disponible.create(data, function (err, post) {
                                if (err) return next(err);
                                console.log("save registerr");
                        });
                    }
        });


       

};


setInterval(getHomeTimeLine, 20*60*1000);

getHomeTimeLine();




var validaFecha = function(doc){

        var date1 = new Date();
        var date2 = new Date(doc.timemsString); //less than 1
        var start = Math.floor(date1.getTime() / (3600 * 24 * 1000)); //days as integer from..
        var end = Math.floor(date2.getTime() / (3600 * 24 * 1000)); //days as integer from..
        var daysDiff =  start - end ; // exact dates

        return daysDiff;

}
