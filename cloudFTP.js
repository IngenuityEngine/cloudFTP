// Basic server implementation using ftpd node module

// Vendor Modules
var ftpd = require('ftpd')
var _ = require('lodash')
var fs = require('fs')
var util = require('util')

// Our Modules
var helpers = require('../arkUtil/arkUtil/arkUtil.js')

// Config
var config = require('./config/default')

// Constants, populated from config file
var options = {
		host: config.basics.host,
		port: config.basics.port,
		root: config.basics.root,
		users: config.users,
	}
var username,
	customOptions

// Main Script
var cloudFTP = module.exports =
{
init: function(custom)
{
	// Override default options with custom options, if they exist
	customOptions = custom || {}
	Object.keys(options).forEach(function(key)
	{
		if (!customOptions.hasOwnProperty(key))
			customOptions[key] = options[key]
	})
	console.log('Options ' + util.inspect(options))
	console.log('Custom Options: ' + util.inspect(customOptions))

	// Server set up
	cloudFTP.server = new ftpd.FtpServer(
		customOptions.host,
		cloudFTP)

	// Handle errors, if any
	cloudFTP.server.on('error', function(error)
	{
		//TEMP
		if (customOptions.host != '127.0.0.1')
			console.log('FTP Server error:', error)
	})

	// Initiate connection, with authentication
	cloudFTP.server.on('client:connected', function(connection)
	{
		console.log('client connected: ' + connection.remoteAddress)
		connection.on('command:user', cloudFTP.verifyUser)
		connection.on('command:pass', cloudFTP.verifyPass)
	})

	cloudFTP.server.debugging = 4

	cloudFTP.server.listen(customOptions.port)
	console.log('Listening on port ' + customOptions.port)
},

// No callback, define the initial working directory of
// the user, relative to the root directory
getInitialCwd: function()
{
	var userCWD = '/'
	return userCWD
},

// Get root directory for the user, with callback
// From the user's standpoint, this root path will appear as '/'
// User cannot escape this directory
getRoot: function(connection, callback)
{
	// Check that username is valid
	var matchingUser = _.find(customOptions.users,
		{'username': connection.username})
	if (!matchingUser)
	{
		var err = new Error('Username not found')
		console.log(err.message)
		return callback(err)
	}

	// Parse userRoot, from config file and username
	if (!customOptions.root)
	{
		return callback(new Error(
			'No root directory specified in config'))
	}

	var userRoot = helpers.removeTrailingSlash(customOptions.root)
	if (connection.username != 'ingenuity')
		userRoot += '/' + connection.username

	// gm: labeled this so we know what's getting logged
	console.log('userRoot:', userRoot)

	// Make directory, if it doesn't exist, and enter
	cloudFTP.makeDirectory(userRoot, callback)
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
				// if folder already exists, ignore error
				console.log('Exists, entering ' + userRoot)
				return callback(null, userRoot)
			}
			else
			{
				// Default to root
				console.log('Entering default relative root')
				return callback(err, '/')
			}
		}
		else
		{
			// else folder successfully created
			console.log('Creating, entering ' + userRoot)
			return callback(err, userRoot)
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
	var matchingUser = _.find(customOptions.users,
		{'username': user})

	if (matchingUser)
	{
		username = matchingUser.username
		success()
	}
	else
	{
		var err = new Error('Username not found')
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
	var matchingUser = _.find(customOptions.users,
		{'username':username, 'password':pass})

	if (matchingUser)
	{
		success(username)
	}
	else
	{
		var err = new Error('Incorrect password')
		console.log(err.message)
		failure()
	}
},
// Function: close
// Wrapper for server.close()
// Can be modified for other functionality on close
// Inputs: none
// Outputs: none
close: function()
{
	cloudFTP.server.close()
},

// End of module
}

// If script is not loaded by another script, run itself
if (!module.parent)
{
	cloudFTP.init()
}