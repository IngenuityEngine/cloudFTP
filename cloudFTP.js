// Basic server implementation using ftpd node module
/*jshint latedef: nofunc */

// Vendor Modules
var ftpd = require('ftpd')
var _ = require('lodash')
var fs = require('fs')
var debug = require('debug')
debug = debug('cloudFTP')

// Our Modules
var arkUtil = require('arkutil')
var cOS = require('commonos')
var base = require('./base')

// Get project root
var projectRoot = cOS.getDirName(__filename)

// Config
var config = require(projectRoot + 'config/default')
var usersPath = projectRoot + 'config/users.json'

var users
// Initial read must by synchronous, so file is fully read before init is called
var usersFile = safeReadFileSync(usersPath, 'utf8', 'usersFile')
users = arkUtil.parseJSON(usersFile)

// Constants, populated from config file
var options =
{
	host: config.host,
	port: config.port,
	root: config.root,
	pasvStart: config.pasvPortRangeStart,
	pasvEnd: config.pasvPortRangeEnd,
	key: config.key,
	cert: config.cert,
	tlsOnly: config.tlsOnly,
	allowUnauthorizedTls: config.allowUnauthorizedTls,
	timeout: config.timeout,
	tls: null
}
var username

// If key and cert specified in config or env vars, read
if(options.key && options.cert)
{
	// Read key and cert
	var keyPath = projectRoot + options.key
	var certPath = projectRoot + options.cert
	var readKey = safeReadFileSync(keyPath, null, 'readKey')
	var readCert = safeReadFileSync(certPath, null, 'readCert')

	options.tls =
	{
		key: readKey,
		cert: readCert
	}
	console.log('Running as FTPS server over TLS')
}
else
{
	console.log('\n*** To run as FTPS server over TLS,		***')
	console.log('*** set "KEY_FILE", "CERT_FILE" env vars.	***')
	console.log('*** Or, set key and cert in config.		***')
	if (options.tlsOnly)
	{
		console.log('*** FTPS over TLS required			***')
	}
	else
	{
		console.log('*** Raw FTP permitted				***')
	}
}

// Main Script
var cloudFTP = module.exports = base.extend({

init: function(custom)
{
	// 'self' used in place of 'this' within callbacks
	var self = this

	// Users
	this.users = users
	if (!users)
		throw new Error('No users file specified')
	this.usersPath = usersPath

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
		pasvPortRangeStart: this.customOptions.pasvStart,
		pasvPortRangeEnd: this.customOptions.pasvEnd,
		tlsOptions: this.customOptions.tls,
		tlsOnly: this.customOptions.tlsOnly,
		// If false, server will reject any connection that is not pre-authorized
		// with list of supplied CAs (two way TLS, not needed here)
		allowUnauthorizedTls: this.customOptions.allowUnauthorizedTls
	})
	setInterval(function(){
		self.getUsers(usersPath, function(err, parsed)
		{
			if (err){
				debug('getUsers error:', err)
			}
			else
			{
				self.users = parsed
				self.initNewUsers(self.users)
			}
		})
	}, this.customOptions.timeout)

	// Handle errors, if any
	this.server.on('error', function(error)
	{
		self.trigger('server error', error)
		debug('FTP Server error:', error)
	})

	// Initiate connection, with authentication
	this.server.on('client:connected', function(connection)
	{
		debug('client connected: ' + connection.remoteAddress)
		connection.on('command:user', self.verifyUser)
		connection.on('command:pass', self.verifyPass)

		self.trigger('connection', connection)
	})

	this.server.debugging = 4
	this.server.listen(this.customOptions.port)
	debug('Listening on port ' + this.customOptions.port)
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
	var matchingUser = _.find(this.users,
		{'username': connection.username})
	if (!matchingUser)
	{
		var err = new Error('getRoot: Username not found')
		debug(err.message)
		return callback(err)
	}

	if (!this.customOptions.root)
	{
		this.trigger('no root')
		return callback(new Error(
			'No root directory specified'))
	}

	// Parse userRoot, from config file and username
	this.customOptions.root = arkUtil.removeTrailingSlash(this.customOptions.root)
	var userRoot = this.customOptions.root
	if (connection.username != 'ingenuity')
		userRoot += '/' + connection.username

	// Log user root
	debug('userRoot:', userRoot)

	// Trigger change for testing
	this.trigger('userRoot', userRoot)

	// Make directory, if it doesn't exist, and enter
	this.makeDirectory(userRoot, callback)
},
// Helper functions

// Function: getUsers
// Reads updated usernames from users file
// Inputs: filename (a path); callback function
// Outputs: returns error as the first arg of callback, if any
// If no error occured, null err and any successful parsed data returned as second arg
getUsers: function(filename, callback)
{
	var users
	if (filename)
	{
		cOS.readFile(filename, function(err, data)
		{
			if (err)
			{
				var readError = new Error(err)
				debug('ERROR: ' + err.message)
				return callback(readError)
			}else{
				users = arkUtil.parseJSON(data)
				if (!users)
				{
					var parseError = new Error('Cannot parse users file')
					return callback(parseError)
				}
				else
				{
					// No error to report
					return callback(null, users)
				}
			}
		})
	}
	else
	{
		debug('ERROR: No path specified')
		var pathError = new Error('No path specified')
		return callback(pathError)
	}
},
// Function: makeDirectory
// Makes directory at given path. If directory exists, calls back with relative path.
// Otherwise, creates the directory and callbacks posible error and relative path.
// Defaults to relative root
// Inputs: userRoot (path to desired directory), callback
// Outputs: none
makeDirectory: function(root, callback)
{
	this.trigger('testing')
	fs.mkdir(root, function(err)
	{
		if (err)
		{
			if (err.code == 'EEXIST')
			{
				// if folder already exists, ignore error
				debug('Exists ' + root)
				return callback(null, root)
			}
			else
			{
				// Default to root
				debug('Default relative root')
				return callback(err, '/')
			}
		}
		else
		{
			// else folder successfully created
			debug('Creating ' + root)
			return callback(err, root)
		}
	})
},
// Function: initNewUsers
// Makes directories for all new users, called when userFile is updated
// Inputs: parsed users object
// Outputs: none, callback with err
initNewUsers: function(users)
{
	var self = this

	// Get array of all properties 'username' in collection
	var usernames = _.map(users, _.property('username'))

	// Iterate through usernames
	_.forEach(usernames, function(value)
	{
		// For each, fi not admin, make directory if it doesn't exist already
		var directoryPath = self.customOptions.root
		if (value != 'ingenuity'){
			directoryPath += '/' + value
			self.makeDirectory(directoryPath, function(err)
			{
				if (err)
					debug('makeDirectory Error: ', err)
			})
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
	var matchingUser = _.find(this.users,
		{'username': user})

	if (matchingUser)
	{
		username = matchingUser.username
		success()
	}
	else
	{
		var err = new Error('verifyUser: Username not found')
		debug(err.message)
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
	// in users.json collection, continue
	var matchingUser = _.find(this.users,
		{'username':username, 'password':pass})

	if (matchingUser)
	{
		success(username)
	}
	else
	{
		var err = new Error('Incorrect password')
		debug(err.message)
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

// safeReadFileSync
// Helper function outside of cloudFTP module to
// open a filepath with readFileSync, handling errors
// such as ENOENT if the file does not exist at the path
// Inputs: path - filepath to read;
// options - options for readFileSync
// description - string identifing for example the calling function
// Outputs: returns readFile, writes error to console
// Note: can return null
function safeReadFileSync(path, options, description)
{
	var readFile
	try
	{
		readFile = fs.readFileSync(path, options)
	}
	catch (err)
	{
		debug('readFileSync error for ' + description + ':', err)
	}
	return readFile
}

// If script is not loaded by another script, run itself
if (!module.parent)
{
	var server
	server = new cloudFTP()
}