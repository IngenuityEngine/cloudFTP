
var config = require('./config/default')

/*
Basic server implementation using ftpd node module
*/

/*Modules*/
var ftpd = require('ftpd')

/*Constants*/
var server,
	options =
	{
		//Use enviornment vars IP and PORT if they exist, else use defaults
		host: process.env.IP || '127.0.0.1',
		port: process.env.PORT || 7002,
	}

/*Server set up*/
server = new ftpd.FtpServer(options.host,
	{
		//No callback, get the initial working directory of the user, relative to the root directory
		getInitialCwd: function ()
		{
			return '/'
		},
		//No callback, get root directory for the user
		getRoot: function ()
		{
			return process.cwd()
		},
	})

//Handle errors, if any
server.on('error', function (error)
{
	console.log('FTP Server error:', error)
})

//Initiate connection, with authentication
server.on('client:connected', function (connection)
{
	var username = null
	console.log('client connected: ' + connection.remoteAddress)
	connection.on('command:user', function (user, success, failure)
	{
		if (user)
		{
			username = user;
			success()
		}
		else
		{
			failure()
		}
	})

	connection.on('command:pass', function (pass, success, failure)
	{
		if (pass)
		{
			success(username)
		}
		else
		{
			failure()
		}
	})
})

server.debugging = 4;

server.listen(options.port)
console.log('Listening on port ' + options.port)

