try{
	var dotenv = require('dotenv')
	dotenv.load();
}catch(err){
	//do nothing if this fails, we are in dev
}
/*********************** other js files in this directory ******************************/
require('./worker');
/*********************** npm modules in use ********************************************/

var pg = require('pg'); // for postgres access


// TODO: load into database here