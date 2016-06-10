// Basic server implementation using ftpd node module

// Vendor Modules
var ftpd = require('ftpd')
var _ = require('lodash')
var fs = require('fs')
// var util = require('util')

// Our Modules
var helpers = require('../arkUtil/arkUtil/arkUtil')
var base = require('./base')

// Config
var config = require('./config/default')

// Constants, populated from config file
var options = {
		host: config.basics.host,
		port: config.basics.port,
		root: config.basics.root,
		users: config.users,
	}
var username

// Main Script
var cloudFTP = module.exports = base.extend({

init: function(custom)
{
	// self used in place of this within callbacks
	var self = this

	// Bind 'this' to cloudFTP
	_.bindAll(this, _.functionsIn(this))

	// Override default options with custom options, if they exist
	this.customOptions = custom || {}
	_.defaults(this.customOptions, options)
	this.options = options

	// Server set up
	this.server = new ftpd.FtpServer(
	this.customOptions.host, {
		getInitialCwd: function()
		{
			self.getInitialCwd()
		},
		getRoot: function(connection, callback)
		{
			self.getRoot(connection, callback)
		},
	})

	self.trigger('test')

	// Handle errors, if any
	this.server.on('error', function(error)
	{
		self.trigger('server error', error)
		console.log('FTP Server error:', error)
	})

	// Initiate connection, with authentication
	this.server.on('client:connected', function(connection)
	{
		console.log('client connected: ' + connection.remoteAddress)
		connection.on('command:user', self.verifyUser)
		connection.on('command:pass', self.verifyPass)

		self.trigger('connection', connection)

		// _.each(self.callbacks.onConnect, function(callback)
		// {
		// 	callback(connection)
		// })
	})

	this.server.debugging = 4

	this.server.listen(this.customOptions.port)

	console.log('Listening on port ' + this.customOptions.port)
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
	var matchingUser = _.find(this.customOptions.users,
		{'username': connection.username})
	if (!matchingUser)
	{
		var err = new Error('Username not found')
		console.log(err.message)
		return callback(err)
	}

	// Parse userRoot, from config file and username
	if (!this.customOptions.root)
	{
		this.trigger('no root')
		return callback(new Error(
			'No root directory specified'))
	}

	var userRoot = helpers.removeTrailingSlash(this.customOptions.root)
	// this.customOptions.root = helpers.removeTrailingSlash(this.customOptions.root)
	if (connection.username != 'ingenuity')
		userRoot += '/' + connection.username

	// gm: labeled this so we know what's getting logged
	console.log('userRoot:', userRoot)

	// Make directory, if it doesn't exist, and enter
	// this.makeDirectory(userRoot, callback)
	this.makeDirectory(userRoot, callback)
},

// Helper functions

// Function: makeDirectory
// Makes directory at given path. If directory exists, calls back with relative path.
// Otherwise, creates the directory and callbacks posible error and relative path.
// Defaults to relative root
// Inputs: userRoot (path to desired directory), callback
// Outputs: none
makeDirectory: function(root, callback)
{
	fs.mkdir(root, function(err)
	{
		if (err)
		{
			if (err.code == 'EEXIST')
			{
				// if folder already exists, ignore error
				console.log('Exists, entering ' + root)
				return callback(null, root)
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
			console.log('Creating, entering ' + root)
			return callback(err, root)
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
	var matchingUser = _.find(this.customOptions.users,
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
	var matchingUser = _.find(this.customOptions.users,
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
	// Turn base off, removes all callbacks
	this.off()
	this.server.close()
},

// End of module
})

// If script is not loaded by another script, run itself
if (!module.parent)
{
	var server
	server = new cloudFTP()
}

