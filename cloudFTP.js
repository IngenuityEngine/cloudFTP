/*
Basic server implementation using ftpd node module
*/

/*Modules*/
var ftpd = require('ftpd')
//var _ = require('lodash')
var config = require('./config/default')

/*Constants*/
var server,
	options =
	{
		host: config.basics.host,
		port: config.basics.port,
	}

/*Server set up*/
server = new ftpd.FtpServer(options.host,
	{
		//No callback, get the initial working directory of the user, relative to the root directory
		getInitialCwd: function ()
		{
			if (config.basics.root)
			{
				return config.basics.root
			}
			else
			{
				return '/'
			}
		},
		//No callback, get root directory for the user
		getRoot: function ()
		{
			//From user's standpoint, this cwd will appear as '/'
			if (config.basics.root)
			{
				return '/'
			}
			else
			{
				return process.cwd()
			}
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
		/*if (_.includes(config.users, user)
		{

		}*/
		if (user)
		{
			username = user
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

