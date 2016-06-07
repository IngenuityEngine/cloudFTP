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
var username = null

// Main Script
var cloudFTP = module.exports =
{
	init: function()
	{
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
				var userRoot = null

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

				//Make directory, if it doesn't exist, and enter
				cloudFTP.makeDirectory(userRoot, callback)
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
			console.log('client connected: ' + connection.remoteAddress)
			connection.on('command:user', cloudFTP.verifyUser)
			connection.on('command:pass', cloudFTP.verifyPass)
		})

		server.debugging = 4

		server.listen(options.port)
		console.log('Listening on port ' + options.port)
	},
	// Helper functions

	// Function: makeDirectory
	// Makes directory at given path. If directory exists, calls back with relative path.
	// Otherwise, creates the directory and callbacks posible error and relative path.
	// Defaults to relative root
	// Inputs: userRoot (path to desired directory), callback
	// Outputs: none
	makeDirectory: function(userRoot, callback)
	{
		fs.mkdir(userRoot, function(err)
		{
			if (err)
			{
				if (err.code == 'EEXIST')
				{
					//if folder already exists, ignore error
					console.log('Exists, entering ' + userRoot)
					callback(null, userRoot)
				}
				else
				{
					//Default to root
					console.log('Entering default relative root')
					callback(err, '/')
					//TODO: or err?
				}
			}
			else
			{
				//else folder successfully created
				console.log('Creating, entering ' + userRoot)
				callback(err, userRoot)
			}
		})
	},

	// Function: verifyUser
	// Checks if username is found if config collection, called when authenticating
	// Inputs: user (string), success and failure functions
	// Outputs: None
	// Modifies global variable username
	verifyUser: function(user, success, failure)
	{
		// If user found in config.users collection, continue
		if(_.find(config.users, {'username': user}))
		{
			username = user
			success()
		}
		else
		{
			var err = new Error('Error: Username not found')
			console.log(err.message)
			failure()
		}
	},

	// Function: verifyPass
	// Checks if password corresponding to global username exists in collection
	// Inputs: pass, success and failure functions
	// Outputs: none
	verifyPass: function(pass, success, failure)
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
		}
	}
}

cloudFTP.init()