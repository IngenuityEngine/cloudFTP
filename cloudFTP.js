// Basic server implementation using ftpd node module

// Modules
var ftpd = require('ftpd')
var _ = require('lodash')
var fs = require('fs')
var config = require('./config/default')

// Constants
var options = {
		host: config.basics.host,
		port: config.basics.port,
	}

// Server set up
var server = new ftpd.FtpServer(options.host,
{
	// No callback, define the initial working directory of
	// the user, relative to the root directory
	getInitialCwd: function ()
	{
		var userCWD = '/'
		return userCWD
	},

	// Get root directory for the user, with callback
	// From the user's standpoint, this root path will appear as '/'
	// User cannot escape this directory
	getRoot: function (connection, callback)
	{
		//Check that username is valid
		var matchingUser = _.find(config.users,
			{'username': connection.username})
		if(!matchingUser)
		{
			var err = new Error('Error: Username not found')
			console.log(err.message)
			process.exit(1)
		}

		//Parse userRoot, from config file and username
		var userRoot
		if (config.basics.root)
		{
			userRoot = config.basics.root
			if (connection.username != 'ingenuity')
				userRoot += '/' + connection.username
			//return userRoot
		}
		else
		{
			//return process.cwd()
			userRoot = process.cwd()
		}

		// If the subdirectory exists, call back immediately
		// with the relative path to that directiory
		// If not, create the directiory and callback
		// possible error and relative path
		// Default to relative root
		fs.exists(userRoot, function(exists)
		{
			if (exists)
			{
				console.log('Entering directory ' + userRoot)
				callback(null, userRoot)
			}
			else
			{
				fs.mkdir(userRoot, function(err)
				{
					if (err)
					{
						// Default to root
						console.log('Entering default relative root')
						callback(null, '/')
					}
					else
					{
						console.log('Creating and entering ' + userRoot)
						callback(err, userRoot)
					}
				})
			}
		})
	},
})

// Handle errors, if any
server.on('error', function (error)
{
	console.log('FTP Server error:', error)
})

// Initiate connection, with authentication
server.on('client:connected', function (connection)
{
	var username = null
	console.log('client connected: ' + connection.remoteAddress)
	connection.on('command:user', function (user, success, failure)
	{
		// If user found in config.users collection, continue
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
			//process.exit(1)
		}
	})

	connection.on('command:pass', function (pass, success, failure)
	{
		// If user has correct corresponding password
		// in config.users collection, continue
		var matchingUser = _.find(config.users,
			{'username':username, 'password':pass})

		if (matchingUser)
		{
			success(username)
		}
		else
		{
			var err = new Error('Error: Incorrect password')
			console.log(err.message)
			failure()
			//process.exit(1)
		}
	})
})

server.debugging = 4

server.listen(options.port)
console.log('Listening on port ' + options.port)
