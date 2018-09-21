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

var OMITACCOUNTS = ["xola139"];

console.log('The bot is running...');

function getHomeTimeLine(){
    var options = { screen_name: config.userView.user ,count:300};
    var userActive;    


    Images.find({status:true},'id',function (err, images) {
        if (err) console.log(err);
        
        userActive = images;


        Bot.get('statuses/home_timeline', options , function(err, data) {
        console.log(getTime() + " get numer twiits  "+data.length);
          for (var i = 0; i < data.length ; i++) {
            evaluaPromos(data[i]);
            evaluaDisponible(data[i]);
          }
          //Eliminamos las cuentas OMITACCOUNT
          removeOmitAccout();

        })


    });


        
}


function removeOmitAccout  (){

	   for(var i=0;i<OMITACCOUNTS.length;i++){
            Disponible.find({id:OMITACCOUNTS[i]},function(err, dispo) {
                  if (err) {
                    reject(err);
                  } else {
                    
                     dispo.forEach( function (doc) {
                        doc.remove();
                    });
                	
                  } 
	        });
             
        }
        
};




function existInArray(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i].id == obj) return true;
    }
}
function existInArrayImagen(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i].id_str == obj) return true;
    }
}

function getImages(data){
    //Debemos trar las imagenes de los usuarios registrados para valicar y no duplicar
    Images.findOne({id:data.user.screen_name},function(err, image) {
        if (err)
            console.log(err)
        
        var _m = data.entities.media;
        //Validamos si existe media en el twit
        if(_m){
            for(var x=0;x<_m.length;x++){
                //mando el array que existe para validar con la posible nueva imagen
                if(!existInArray(image.images, _m[x].id_str)){
                    delete _m[x].indices;
                    delete _m[x].sizes;
                    _m[x].status = "foto";
                    image.images.push(_m[x]);    
                }
            }   

         updateImage = image;   
         delete updateImage._id;
        // aca debeir actualizar el array
        Images.findByIdAndUpdate(image._id, updateImage, function (err, image) {
            if (err) console.log(err);
            console.log("Update arreglo de imagenes!!" + image.id);
        });

        }


    });

    
}





var evaluaDisponible = function(data){

        //var condicion ="locales";
       var texto = data.text.toUpperCase();
       
       //if(texto.indexOf(condicion.toUpperCase())> -1  ){
       if(texto.indexOf('DISPONIBLE')> -1 || texto.indexOf('DISPO')> -1 || texto.indexOf('ACTIVA')> -1){
            var theData = {};
            theData.id = data.user.screen_name;
            theData.profile_image_url = data.user.profile_image_url.replace("_normal.jpg","_400x400.jpg");
            theData.status = true;
            theData.disponibles=[{descripcion:data.text,ciudad :validaCiudad(texto),created_at:formatoFecha(data.created_at)}];
            saveDataDisponible(theData);

        }

}



var  formatoFecha = function(texto){
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
var today = new Date(texto);
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
var h = addZero(today.getHours());
var m = addZero(today.getMinutes());
var s = addZero(today.getSeconds());
var formateando =  dd+"/"+mm+"/"+yyyy +"  "+ h +":" +m +":"+s;
return formateando;
}

var ciudades = ['AGUASCALIENTES','BAJA_CALIFORNIA','BAJA_CALIFORNIA_SUR','CUERNAVACA','CAMPECHE','CHIAPAS','CHIHUAHUA','COAHUILA','COLIMA','CDMX','ESTADO','DURANGO','GUANAJUATO','GUERRERO','JALISCO','MICHOACÁN','MICHOACAN','MORELOS','NAYARIT','LEÓN','LEON','OAXACA','PUEBLA','QUERÉTARO','QUERETARO','QUINTANA','POTOSÍ','POTOSI','SINALOA','SONORA','TABASCO','TAMAULIPAS','TLAXCALA','VERACRUZ','YUCATÁN','YUCATAN','ZACATECAS','XALAPA','CANCUN','CANCÚN'];

var  validaCiudad = function(texto){
    
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
                                        console.log("save register Disponible "+data.id);
                                        updateDisponible(data);
                                });
                        }else{
                            
                                dispo[0].disponibles.push(data.disponibles[0])
				dispo[0].status = true;
                                Disponible.findByIdAndUpdate(dispo[0]._id, dispo[0], function (err, post) {
                                        if (err) return next(err);
                                        console.log(getTime()+" -- save update Disponible ");
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
                var imageUpdate = image;
                imageUpdate.disponible = true;
                delete image._id;
                Images.findByIdAndUpdate(image._id, imageUpdate, function (err, post) {
                        if (err) return next(err);
                        console.log(getTime()+" -- save update Disponible in Image!!! "+ post.id);
                        
                });
                
                data.fk_images = image._id;
                Disponible.find({id:data.id},function(err, disponible) {

                    if(err)console.log(err);
                    Disponible.findByIdAndUpdate(disponible._id, data, function (err, post) {
                        if (err) return next(err);
			if(post != null)
	                        console.log(getTime()+" -- save fk_images reference in disponible ");
                    });

                });

                
        });
}


setTimeout(function(){mongoose.connection.close()}, 20000);
