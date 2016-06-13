// Testing suite for cloudFTP server functionality, using jsftp client module

// Modules
var expect = require('expect')
var describe = global.describe
var it = global.it
var beforeEach = global.beforeEach
var afterEach = global. afterEach
var jsftpClient = require('jsftp')
var _ = require('lodash')

describe('setup', function()
{
	var cloudFTP
	it ('should load', function()
	{
		cloudFTP = require('../cloudFTP')
	})

	it ('customOptions should replace default options', function(done)
	{
		// Check custom server options
		var serverOptions =
		{
			'port': 7020
		}
		var server = new cloudFTP(serverOptions)
		expect(server.customOptions).toNotEqual(server.options)
		expect(server.customOptions).toInclude({'port': 7020})

		// Cleanup
		server.close()
		done()
	})

	it ('no specified customOptions should not affect default options', function(done)
	{
		// No custom server options
		var testOptions = null
		var server = new cloudFTP(testOptions)
		expect(server.customOptions).toEqual(server.options)

		// Cleanup
		server.close()
		done()
	})
})

describe('authentication', function()
{
	var cloudFTP, client, server

	// Default options for testing
	var clientOptions =
	{
		'host': '127.0.0.1',
		'port': 7002,
		'user': 'b99',
		'pass': 'bourbon'
	}

	cloudFTP = require('../cloudFTP')

	beforeEach(function(done)
	{
		server = new cloudFTP()
		done()
	})

	it ('should reject invalid username', function(done)
	{
		var badUser = clientOptions.user +  '_sneak'
		client = new jsftpClient(clientOptions)
		client.auth(badUser, clientOptions.pass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})

	it ('should reject invalid password', function(done)
	{
		var badPass = clientOptions.pass + '_wrong';
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, badPass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})
	it ('should reject no username (anonymous)', function(done)
	{
		client = new jsftpClient(clientOptions)
		client.auth('', clientOptions.pass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		})
	})
	it ('should reject no password (anonymous)', function(done)
	{
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, '', function(error)
		{
			expect(error.code).toBe(530)
			done()
		})
	})

	afterEach(function()
	{
		// Cleanup
		client.raw.quit()
		server.close()
	})
})

describe('root, port, address', function()
{
	var cloudFTP, client, server
	cloudFTP = require('../cloudFTP')

	beforeEach(function(done)
	{
		done()
	})

	it ('should emit error for no root', function(done)
	{
		var serverOptions = {
			'root': null
		}
		var clientOptions =
		{
			'host': '127.0.0.1',
			'port': 7002,
			'user': 'b99',
			'pass': 'bourbon'
		}
		server = new cloudFTP(serverOptions)
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass, function(err)
		{
			console.log(err)
		})
		var eventFired = false

		server.on('no root', function()
		{
			eventFired = true
		})
		setTimeout(function()
		{
			console.log('Waiting 40ms')
			expect(eventFired).toBe(true)
			done()
		}, 40)
	})

	it ('should append root path by username', function(done)
	{
		var clientOptions =
		{
			'host': '127.0.0.1',
			'port': 7002,
			'user': 'b99',
			'pass': 'bourbon'
		}
		server = new cloudFTP()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass, function(err)
		{
			console.log(err)
		})
		var eventFired = false
		var userRoot

		server.on('userRoot', function(result)
		{
			eventFired = true
			userRoot = result
		})
		setTimeout(function()
		{
			console.log('Waiting 40ms')
			expect(eventFired).toBe(true)
			expect(userRoot).toEqual(server.options.root + '/' + clientOptions.user)
			done()
		}, 40)
	})

	it ('should not append admin root path', function(done)
	{
		var clientOptions =
		{
			'host': '127.0.0.1',
			'port': 7002,
			'user': 'ingenuity',
			'pass': 'ingenuity'
		}
		server = new cloudFTP()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass, function(err)
		{
			console.log(err)
		})
		var eventFired = false
		var userRoot

		server.on('userRoot', function(result)
		{
			eventFired = true
			userRoot = result
		})
		setTimeout(function()
		{
			console.log('Waiting 40ms')
			expect(eventFired).toBe(true)
			expect(userRoot).toEqual(server.options.root)
			done()
		}, 40)
	})

	it ('should emit FTP Server error for invalid port', function(done)
	{
		var serverOptions = {
			'port': 'nonsense'
		}
		var clientOptions =
		{
			'host': '127.0.0.1',
			'port': 7002,
			'user': 'b99',
			'pass': 'bourbon'
		}
		server = new cloudFTP(serverOptions)
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass, function(err)
		{
			console.log(err)
		})
		var eventFired = false
		var result

		server.on('server error', function(error)
		{
			eventFired = true
			result = error
		})

		setTimeout(function()
		{
			console.log('Waiting 40ms')
			expect(eventFired).toBe(true)
			expect(_.toString(result)).toEqual('Error: listen EACCES ' + serverOptions.port)
			done()
		}, 40)
	})

	afterEach(function()
	{
		// Cleanup
		client.raw.quit()
		server.close()
	})
})

describe('directories', function()
{
	var cloudFTP, client, server


	cloudFTP = require('../cloudFTP.js')

	beforeEach(function(done)
	{
		done()
	})

	it ('should not allow cwd out of initial directory for user', function(done)
	{
		var origList,
			cwdList

		var clientOptions = {
			'host': '127.0.0.1',
			'port': 7002,
			'user': 'b99',
			'pass': 'bourbon'
		}

		server = new cloudFTP()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass, function(err)
		{
			console.log(err)
		})
		// Test if CWD changes files list
		// CWD call permitted by server, though does not actually go to parent
		client.list('.', function(err, reply)
		{
			console.log(reply)
			if (err)
				console.log(err)
			origList = reply
			client.raw('CWD', '../', function(err, reply)
			{
				console.log(reply)
				if (err)
					console.log(err)
				client.list('.', function(err, reply)
				{
					cwdList = reply
					console.log(reply)
					if (err)
						console.log(err)
				})
			})
		})
		setTimeout(function()
		{
			console.log('Waiting 40ms')
			expect(origList).toEqual(cwdList)
			done()
		}, 40)
	})

	it ('should allow cwd out of initial directory for admin', function(done)
	{
		var origList,
			cwdList

		var clientOptions = {
			'host': '127.0.0.1',
			'port': 7002,
			'user': 'ingenuity',
			'pass': 'ingenuity'
		}

		server = new cloudFTP()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass, function(err)
		{
			console.log(err)
		})
		// Test if CWD changes files list
		// CWD call permitted by server for admin
		client.list('.', function(err, reply)
		{
			console.log(reply)
			if (err)
				console.log(err)
			origList = reply
			client.raw('CWD', '/b99', function(err, reply)
			{
				console.log(reply)
				if (err)
					console.log(err)
				client.list('.', function(err, reply)
				{
					cwdList = reply
					console.log(reply)
					if (err)
						console.log(err)
				})
			})
		})
		setTimeout(function()
		{
			console.log('Waiting 40ms')
			expect(origList).toNotEqual(cwdList)
			done()
		}, 40)
	})
	afterEach(function()
	{
		// Cleanup
		client.raw.quit()
		server.close()
	})
})