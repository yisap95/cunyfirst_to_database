try{
	var dotenv = require('dotenv')
	dotenv.load();
}catch(err){
	//do nothing if this fails, we are in dev
}
/*********************** other js files in this directory ******************************/
require('./runCycle.js');

/*********************** npm modules in use ********************************************/

var pg = require('pg'); // for postgres access

//runnning serrverrrr
var http = require("http");
var express = require('express'); // for creating the application, classic lib for node
var session = require('express-session');
var app = express()
var port = process.env.PORT || 5000;
var server = http.createServer(app)
server.listen(port)


// TODO: load into database here