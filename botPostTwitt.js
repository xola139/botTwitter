var config  = require('./config');
var mongoose = require('mongoose');
var Promos = require('./models/Promos.js');
var Images = require('./models/Images.js');
var Disponible = require('./models/Disponible.js');
var Message = require('./models/Messages.js');
var Twit = require('twit');

mongoose.Promise = global.Promise;
mongoose.connect(config.conectDB.link).then(()=> console.log("conexion exitosa Mlab")).catch(function(err){ console.error(err)});

var Bot = new Twit({
        consumer_key: config.twitter.TWITTER_CONSUMER_KEY,
        consumer_secret: config.twitter.TWITTER_CONSUMER_SECRET,
        access_token: config.twitter.TWITTER_ACCESS_TOKEN,
        access_token_secret: config.twitter.TWITTER_ACCESS_TOKEN_SECRET
});

console.log('The bot is running...');

function getTime(){
    var date = new Date(); 
    var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    
    return new Date(now_utc);
}

function getHomeTimeLine(){

var _auxArrMessages = [];



    Message.find({status:true},function (err, messages) {
        if(err)console.log(err);
        var arrMessages = messages;
        Images.find( { $and: [{$or:[ {status: true}, {onlytwit:true} ]} ,  {autPost:true}] },function (err, data) {
            if (err) console.log(err);

            //Temporal mienstras vemos si alguin mas lo requeire asi
            console.log("conteo---"+ data.length);
            for(var z=0;z<data.length;z++){
                
                var imgPost;
                imgPost = evaluaImagem(data[z].images);
                
                if(imgPost != null && arrMessages.length > 0 ){
            
                //Traemos el indice aleatorio del mensaje
                var _index = getIndexMessage(arrMessages); 
                arrMessages[_index].auxuse = false;
                console.log(data[z].id+"---");
                var _tel = data[z].telefono != null ? data[z].telefono.trim():'';


                var text = arrMessages[_index].message;
                
                text += "@"+data[z].id +"\n";

                text += data[z].id == 'AteneaSexMex' ?  "Contacla por DM ✉️": "📲"+ _tel +"\n"; 
                
                text += "Disponible en "+ formatoCiudad(data[z].ciudad) +" \n";
                text += "#escortenmx  \n";

                if(data[z].id == 'AteneaSexMex'){
                   // text += "Realiza llamada => http://escortenmx.ga/#/contact/"+ data[z].id +" \n";
                    text +="";
                }else if(data[z].opcionesTelefono.whatsappdirecto)
                  text += "Contacto Whatsapp directo => https://api.whatsapp.com/send?phone=521"+data[z].telefono.trim()+"&text=Hola%20vi%20mension%20en%20@escortenmx%20me%20das%20informaci%C3%B3n%20por%20favor \n";
                //text += "Contacto Whatsapp directo => escortenmx.ga/#/whatsapp/"+data[z].id+" \n"; 

                text +=  imgPost  ;
                


                //Despues de traer el mensaje debe eliminarse del arra para el siguiente item
                arrMessages = removeMessage(arrMessages);  
               
                _auxArrMessages.push({dataImage:data[z],message:text});
            } 
      }//end for

    });

    var formatoCiudad = function(ciudad){
        //🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆁🆂🆆🆈🆉🆇
        //code A -z
        //🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿
       

        if(ciudad == 'CDMX'){
            return '🅲🅳🅼🆇';
        }else if(ciudad == 'TOLUCA'){
            return 'ⓉⓄⓁⓊⒸⒶ';
        }else if(ciudad == 'MONTERREY'){
            return '🄼🄾🄽🅃🄴🅁🅁🄴🅈';
        
        }else if(ciudad == 'PUEBLA'){
            return 'ℙ𝕌𝔼𝔹𝕃𝔸'
        }else
            return ciudad;
    }
    
    var intervalId = null;
    var varCounter = 0;
    var intervalPostTwitter = function(){
         if(varCounter < _auxArrMessages.length) {

            var _dataImage = _auxArrMessages[varCounter].dataImage;
            var _idtmp = _dataImage._id;
        
           Bot.post('statuses/update', { status: _auxArrMessages[varCounter].message }, function(err, data) {
                if(err)console.log(err);

                    if(_dataImage.posttwitter == null)   
                       _dataImage.posttwitter = [];

                    var newPost = {id:data.id,created_at:data.created_at,text:data.text};
                 
                    if(_auxArrMessages[varCounter] != undefined){
                        _auxArrMessages[varCounter].dataImage.posttwitter.push(newPost);
                        console.log(getTime()+"...ya posteado..."+ _dataImage.id);
                    }
                        
                     
                 });

              varCounter++;
              /* your code goes here */
         } else {
              clearInterval(intervalId);
              updatePostImage();
         }
    };

//300000
    intervalId = setInterval(intervalPostTwitter, 180000);




});

function updatePostImage(){
    console.log("Imprimiendo los    posttwitter ");

    for(var xx=0;xx<_auxArrMessages.length;xx++){
        console.log("Intentando update posttwitter de...."+ _auxArrMessages[xx].dataImage.id);
       // console.log(_auxArrMessages[xx].dataImage.posttwitter);
         Images.findByIdAndUpdate(_auxArrMessages[xx].dataImage._id, _auxArrMessages[xx].dataImage.posttwitter, function (err, image) {
            if (err) console.log(err);
            console.log("Update arreglo de posttwitter!!");
        });
    }
    

}
    function removeMessage(arrMessages) {
            var newArrayMessages = [];
            for(var i=0;i<arrMessages.length;i++){
                if(arrMessages[i].auxuse)
                    newArrayMessages.push(arrMessages[i]);
            }
            return newArrayMessages;
    }

    

    var getIndexMessage = function (arrMessages) {
        var p = Math.floor(Math.random() * arrMessages.length);

            return p;
    }

    
    var evaluaImagem = function(images){
        var imgValidas = []
        for(var x=0;x<images.length;x++){
            if(images[x].autorizaImagen)
                imgValidas.push(images[x]);
        }

        if(imgValidas.length==0)
            return null;

//        var v = Math.floor(Math.random() * imgValidas.length);
      var v = Math.floor((Math.random() * (imgValidas.length-1)) + 1);
         // console.log(imgValidas.length +"----------"+v);
        return imgValidas[v].expanded_url;
    }

        
}



//Init operation
getHomeTimeLine();

setTimeout(function(){mongoose.connection.close()}, 20000);
