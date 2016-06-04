
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
	// No callback, get the initial working directory of
	// the user, relative to the root directory
	getInitialCwd: function (connection, callback)
	{
		// if Root defined in config file, use that, else,
		// use local cwd

		// TODO: Store return value
		var matchingUser = _.find(config.users,
			{'username': connection.username})
		if(!matchingUser)
		{
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

		// If the directory exists, call back immediately
		// with that directiory
		// If not, create the directiory and callback
		// possible error and the directory
		fs.exists(userDir, function(exists)
		{
			if (exists)
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

	// No callback, get root directory for the user
	getRoot: function ()
	{
		// From user's standpoint, this cwd will appear as '/'
		if (config.basics.root)
			return '/'
		else
			return process.cwd()
	},

	// TODO: for testing
	// getInitialCwd: function (connection) {
	// 	//return '/'
	// 	return '/files/'
	// },
	// getRoot: function () {
	// 	console.log(process.cwd())
	// 	var path = process.cwd()
	// 	console.log(path)
	// 	path += '/files/'
	// 	return path
	// }
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
			// exit with failure
			process.exit(1)
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
			failure()
			var err = new Error('Error: Incorrect password')
			console.log(err.message)
			process.exit(1)
		}
	})
})

server.debugging = 4

server.listen(options.port)
console.log('Listening on port ' + options.port)

// Helper functions

// Function: userExists
// Purpose: given a collection and a username, see if username is in that collection
// Input: collection - collection of objects to search, user -
// string username to find
// Output: boolean - true if found, false if not
// function userExists(collection, field, user)
// {
// 	return _.find(collection, {field: user})
// }
