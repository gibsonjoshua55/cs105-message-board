/**
 * CS 105 Message Board
 *    cs105MessageBoardServer.js
 *
 * This file creates the server that will host the message board.
 * It creates the expres server and SQL connection based on the
 * env of the project.
 * It also defines the logic to render the various routes of the message board
 * (test-message, post-message, and cs105MessageBoard).
 *
 * Routes could be split up into another file.  For this size project, it is not
 * necessary, but for best practices, there exists an argument to separate the
 * server and its routes.
 */

require('dotenv').config();					//import config from .env
const express = require('express');			//used to create web server
const path = require('path');				//used to represent file paths
const bodyParser = require('body-parser');  //used to process http request bodies

const port = (process.env.PORT || 3000);    //if the port is not set, use port 8080

const SECRET_PASSWORD = (process.env.SECRET_PASSWORD || 'password') //if the password is not set, use
                                                                    //'password'
//create the web server
app = express();

//user pug as the viewing engine to generate html
app.set('view engine', 'pug');

//process http request bodies as URL encoded
app.use(bodyParser.urlencoded({ extended: true }));

//connect the mysql db
var mysql      = require('mysql');
var connection;

//import dummyMessages in case there is no db connection
var dummyMessages = require('./dummyMessages.js');

//only connect to the database if the env says to
if(process.env.USE_DB === 'true')
{
    var connection = mysql.createConnection({
      host     : process.env.DB_HOST,
      user     : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      port : process.env.DB_PORT,
      database : 'cs105_msgbd'
    });
    connection.connect();
}

//define route for a test post
app.post('/test-message', function(req, res){
	//hide the password
	var hiddenPassword = req.body.password.replace(/./g, "*" );
	var message = Object.assign({}, req.body);
	message.password = hiddenPassword;

	//include the current date time
	message.date_time = new Date();

	//render the test post apge
	res.render('testMessage', { message });
})

//define route for post that stores the message
app.post('/post-message', function(req, res){
	//hide the password
	var hiddenPassword = req.body.password.replace(/./g, "*" );
	var message = Object.assign({}, req.body);
	message.password = hiddenPassword;

  //include the current date time
	message.date_time = new Date();

	//ensure that the correct password was entered
	var passwordError = !(req.body.password === SECRET_PASSWORD);

	//if the password was incorrect, render an error
	if(passwordError)
	{
		res.render('postMessage', { message, error : true });
	}
	else
	{
    if(process.env.USE_DB === 'true')
    {
  		//insert the message into the database and render the response
  		connection.query(`INSERT INTO messages (salutation, posted_by, topic, message, color, shout, date_time)
  		VALUES (?,?,?,?,?,?,?)`, [message.salutation, message.posted_by, message.topic, message.message, message.color, message.shout, message.date_time],
  		function (error, results, fields) {
  			if(error)
  			{
  				res.render('postMessage', {message, error: true})
  			}
  			else
  				res.render('postMessage', {message})
  		});
    }
    else {
      res.render('postMessage', {message});
    }
	}
})

//define route to see all messages
app.get('/cs105MessageBoard', function(req, res)
{
  if(process.env.USE_DB === 'true')
  {
  	//select all messages
  	connection.query('SELECT * FROM messages', function(error, results, fields)
  	{
  		if(!error)
  		{
  			//push results into an array of messages
  			var messages = [];
  			for(let row of results)
  				messages.push(row);

  			//render the messages
  			res.render('showMessages', {messages});
  		}
  		//render an error if one occured
  		else
  		{
  			res.render('showMessages', {error: true})
  		}
  	})
  }
  else
  {
    res.render('showMessages', {messages: dummyMessages});
  }
})

//set the server to listen on the defined port
app.listen(port);
