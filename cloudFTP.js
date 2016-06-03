/*
Basic server implementation using ftpd node module
*/

/*Modules*/
var ftpd = require('ftpd'),
	_ = require('lodash'),
	fs = require('fs'),
	config = require('./config/default')

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
		getInitialCwd: function (connection, callback)
		{
			//if Root defined in config file, use that, else, use local cwd

			//TODO: Store return value
			if(!_.find(config.users, {'username': connection.username})){
				var err = new Error('Error: Username not found')
				console.log(err.message)
				process.exit(1) //exit with failure
			}

			//Parse userDir, from config file and username
			var userDir = config.basics.root
			if (config.basics.root)
			{
				if (connection.username != 'ingenuity')
					userDir += connection.username
			}
			else
			{
				userDir = '/'
			}
			//If the directory exists, call back immediately with that directiory
			//If not, create the directiory and callback possible error and the directory
			fs.exists(userDir, function(exists)
			{
				if(exists)
				{
					callback(null, userDir)
				}
				else
				{
					fs.mkdir(userDir, function(err)
					{
						callback(err, userDir)
					})
				}
			})
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
		//If user found in config.users collection, continue
		if(_.find(config.users, {'username': user}))
		{
			username = user
			success()
		}
		else
		{
			failure()
			var err = new Error('Error: Username not found')
			console.log(err.message)
			process.exit(1) //exit with failure
		}
	})

	connection.on('command:pass', function (pass, success, failure)
	{
		//If user has correct corresponding password in config.users collection, continue
		if(_.find(config.users, {'username':username, 'password':pass}))
		{
			success(username)
		}
		else
		{
			failure()
			var err = new Error('Error: Incorrect password')
			console.log(err.message)
			process.exit(1)
		}
	})
})

server.debugging = 4;

server.listen(options.port)
console.log('Listening on port ' + options.port)

/*Helper functions*/

/*
Function: userExists
Purpose: given a collection and a username, see if username is in that collection
Input: collection - collection of objects to search, user - string username to find
Output: boolean - true if found, false if not
*/
/*function userExists(collection, field, user)
{
	if(_.find(collection, {field: user})){
		return true
	}else{
		return false
	}
}*/

