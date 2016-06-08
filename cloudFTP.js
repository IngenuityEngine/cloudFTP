// Basic server implementation using ftpd node module

// Vendor Modules
var ftpd = require('ftpd')
var _ = require('lodash')
var fs = require('fs')

// Our Modules
var helpers = require('../arkUtil/arkUtil/arkUtil.js')

// Config
var config = require('./config/default')

// Constants
var options = {
		host: config.basics.host,
		port: config.basics.port,
		root: config.basics.root,
		users: config.users,
	}
var username = null

// Main Script
var cloudFTP = module.exports =
{

init: function()
{
	// Server set up
	// gm: passing cloudFTP to the server's config
	// gm: moved getInitialCwd etc to server methods
	// cleaner looking code, same effect
	cloudFTP.server = new ftpd.FtpServer(
		options.host,
		cloudFTP)

	// Handle errors, if any
	cloudFTP.server.on('error', function (error)
	{
		console.log('FTP Server error:', error)
	})

	// Initiate connection, with authentication
	cloudFTP.server.on('client:connected', function (connection)
	{
		console.log('client connected: ' + connection.remoteAddress)
		connection.on('command:user', cloudFTP.verifyUser)
		connection.on('command:pass', cloudFTP.verifyPass)
	})

	cloudFTP.server.debugging = 4

	cloudFTP.server.listen(options.port)
	console.log('Listening on port ' + options.port)
	// gm: you've got the reference to the module
	// and the module has the reference to the server
	// so no need to return the server in init
},

// No callback, define the initial working directory of
// the user, relative to the root directory
// gm: no space between function and parenthesis
getInitialCwd: function()
{
	var userCWD = '/'
	return userCWD
},

// Get root directory for the user, with callback
// From the user's standpoint, this root path will appear as '/'
// User cannot escape this directory
// gm: no space between function and parenthesis
getRoot: function(connection, callback)
{
	// Check that username is valid
	var matchingUser = _.find(options.users,
		{'username': connection.username})

	if (!matchingUser)
	{
		// gm: Error doesn't need error in it's message
		var err = new Error('Username not found')
		console.log(err.message)

		// gm: bail calling the callback with the error
		// otherwise you errored but you keep doing the
		// rest of the stuff anyway
		return callback(err)
	}

	// Parse userRoot, from config file and username
	// gm: have to specify options.root, throw an error if not
	if (!options.root)
	{
		return callback(new Error(
			'No root directory specified in config'))
	}

	var userRoot = helpers.removeTrailingSlash(options.root)
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
				// gm: good practice to return when calling
				// the callback
				// in this case you don't need to but in most
				// cases you will, and you'll screw yourself
				// when you don't return and then the code
				// beneath the callback is run anyway
				return callback(null, userRoot)
			}
			else
			{
				// Default to root
				console.log('Entering default relative root')
				// gm: return when calling callback
				return callback(err, '/')
			}
		}
		else
		{
			// else folder successfully created
			console.log('Creating, entering ' + userRoot)
			// gm: return when calling callback
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
	// gm: changed this to self-document what's going on
	var matchingUser = _.find(options.users,
		{'username': user})

	// gm: space between if and condition
	if (matchingUser)
	{
		// gm: no need to pass the username to success
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
	var matchingUser = _.find(options.users,
		{'username':username, 'password':pass})

	if (matchingUser)
	{
		success()
	}
	else
	{
		var err = new Error('Error: Incorrect password')
		console.log(err.message)
		failure()
	}
},
// gm: added close method to cloudFTP
// you should typically wrap stuff like this in case
// you want to do other things on close
// plus it makes the methods the user is supposed
// to call obvious
close: function()
{
	cloudFTP.server.close()
},

// End of module
}
