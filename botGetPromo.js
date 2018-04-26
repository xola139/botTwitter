var config  = require('./config');
var mongoose = require('mongoose');
var Promos = require('./models/Promos.js');


mongoose.Promise = global.Promise;
mongoose.connect(config.conectDB.link)
.then(() =>  console.log('connection successful'))
.catch((err) => console.error(err));

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
	console.log(config.userView.user);

	var options = { screen_name: config.userView.user,count: 10 };
	
	Bot.get('statuses/home_timeline' , function(err, data) {

	  for (var i = 0; i < data.length ; i++) {
			var texto = data[i].text.toUpperCase();
			console.log(texto);
			if(texto.indexOf('PROMOCION')> -1 || texto.indexOf('PROMO')> -1 ){
				var theData = {};	    	
				theData.id = data[i].user.screen_name;
				theData.avatar = data[i].user.profile_image_url.replace("_normal.jpg","_400x400.jpg");
				theData.promos =[{descripcion : data[i].text,created_at:data[i].created_at,idTwit:data[i].id,id_str:data[i].id_str}];
				saveData(theData);
			}

	  }
	})
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


setInterval(getHomeTimeLine, 1*60*1000);

getHomeTimeLine();




var validaFecha = function(doc){

	var date1 = new Date();
	var date2 = new Date(doc.timemsString); //less than 1
	var start = Math.floor(date1.getTime() / (3600 * 24 * 1000)); //days as integer from..
	var end = Math.floor(date2.getTime() / (3600 * 24 * 1000)); //days as integer from..
	var daysDiff =  start - end ; // exact dates
	
	return daysDiff;
	
}


