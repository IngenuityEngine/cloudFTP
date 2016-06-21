// Testing suite for cloudFTP server functionality, using jsftp client module

// Modules
var describe = global.describe
var it = global.it
var beforeEach = global.beforeEach
var afterEach = global.afterEach
var expect = require('expect')
var jsftpClient = require('jsftp')
var fs = require('fs')
var async = require('async')

// Our modules
var cOS = require('commonos')

// Set tests root
var testsRoot = cOS.getDirName(__filename)
var root = cOS.upADir(testsRoot)

var config = require(cOS.upADir(testsRoot)+ 'config/default.js')

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
			'root': root + 'test_files',
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
		'host': config.host,
		'port': 7002,
		'user': 'b99',
		'pass': 'bourbon'
	}
	var serverOptions =
	{
		'port': 7002,
		'root': root + 'test_files'
	}

	cloudFTP = require('../cloudFTP')

	beforeEach(function(done)
	{
		server = new cloudFTP(serverOptions)
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

	it ('should emit error for no root', function(done)
	{
		var serverOptions = {
			'port': 7002,
			'root': null
		}
		var clientOptions =
		{
			'host': config.host,
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
			console.log('Waiting 80ms')
			expect(eventFired).toBe(true)
			client.raw.quit()
			server.close()
			done()
		}, 80)
	})

	it ('should append root path by username', function(done)
	{
		var clientOptions =
		{
			'host': config.host,
			'port': 7002,
			'user': 'b99',
			'pass': 'bourbon'
		}
		var serverOptions =
		{
			'port': 7002,
			'root': root + 'test_files'
		}
		server = new cloudFTP(serverOptions)
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
			console.log('Waiting 80ms')
			expect(eventFired).toBe(true)
			expect(userRoot).toEqual(serverOptions.root + '/' + clientOptions.user)
			client.raw.quit()
			server.close()
			done()
		}, 80)
	})

	it ('should not append admin root path', function(done)
	{
		var clientOptions =
		{
			'host': config.host,
			'port': 7002,
			'user': 'ingenuity',
			'pass': 'ingenuity'
		}
		var serverOptions =
		{
			'port': 7002,
			'root': root + 'test_files'
		}

		server = new cloudFTP(serverOptions)
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
			console.log('Waiting 80ms')
			expect(eventFired).toBe(true)
			expect(userRoot).toEqual(serverOptions.root)
			client.raw.quit()
			server.close()
			done()
		}, 80)
	})

})

describe('directories', function()
{
	var cloudFTP, client, server
	cloudFTP = require('../cloudFTP.js')

	var serverOptions =
	{
		'port': 7002,
		'root': root + 'test_files'
	}

	beforeEach(function(done)
	{
		done()
	})

	it ('should not allow cwd out of initial directory for user', function(done)
	{
		var origList,
			cwdList

		var clientOptions = {
			'host': config.host,
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
			console.log('Waiting 80ms')
			expect(origList).toEqual(cwdList)
			done()
		}, 80)
	})

	it ('should allow cwd out of initial directory for admin', function(done)
	{
		var origList,
			cwdList

		var clientOptions = {
			'host': config.host,
			'port': 7002,
			'user': 'ingenuity',
			'pass': 'ingenuity'
		}

		server = new cloudFTP(serverOptions)
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
			console.log('Waiting 80ms')
			expect(origList).toNotEqual(cwdList)
			done()
		}, 80)
	})
	afterEach(function()
	{
		// Cleanup
		client.raw.quit()
		server.close()
	})
})

describe('add users', function()
{
	var cloudFTP, client1, client2, server, success1, success2

	var clientOptions1 =
	{
		'host': config.host,
		'port': 7002,
		'user': 'b99',
		'pass': 'bourbon'
	}
	var clientOptions2 =
	{
		'host': config.host,
		'port': 7002,
		'user': 'test',
		'pass': 'test'
	}

	var defaultOptions =
	{
		'port': 7002,
		'root': root + 'test_files'
	}

	cloudFTP = require('../cloudFTP.js')

	it ('server should reject a new user that has not been added', function(done)
	{
		server = new cloudFTP(defaultOptions)

		success1 = true
		success2 = true

		async.series([
			// Client 1
			function(callback)
			{
				client1 = new jsftpClient(clientOptions1)
				client1.auth(clientOptions1.user, clientOptions1.pass, function(err)
				{
					if (err)
					{
						success1 = false
						console.log('Error old user:', err)
					}
					callback()
				})
			},
			// Client 2
			function(callback)
			{
				client2 = new jsftpClient(clientOptions2)
				client2.auth(clientOptions2.user, clientOptions2.pass, function(err)
				{
					if (err)
					{
						success2 = false
						console.log('Error new user:', err)
						expect(err.code).toBe(530)
					}
					callback()
				})
			}
		// This function run after previous two functions complete
		], function(err)
		{
			if (err)
				console.log(err)
			// Test results
			expect(success1).toBe(true)
			expect(success2).toBe(false)
			client1.raw.quit()
			client2.raw.quit()
			server.close()
			done()
		})
	})

	it ('server should update with added user while running', function(done)
	{
		var serverOptions = {
			'port': 7002,
			'root': root + 'test_files',
			'timeout': 10
		}
		server = new cloudFTP(serverOptions)
		// Read and store current users.json contents
		var path = server.usersPath
		var newPath = (testsRoot + 'testUsers.json')
		var usersFile = fs.readFileSync(path, 'utf8')
		var newUsersFile = fs.readFileSync(newPath, 'utf8')

		success1 = true
		success2 = true

		async.series([
			// Client 1
			function(callback)
			{
				client1 = new jsftpClient(clientOptions1)
				client1.auth(clientOptions1.user, clientOptions1.pass, function(err)
				{
					if (err)
					{
						success1 = false
						console.log('Error old user:', err)
					}
					callback()
				})
			},
			// Client 2
			function(callback)
			{
				fs.writeFileSync(path, newUsersFile)
				setTimeout(function()
				{
					console.log('Waiting 80ms')
					client2 = new jsftpClient(clientOptions2)
					client2.auth(clientOptions2.user, clientOptions2.pass, function(err)
					{
						if (err)
						{
							success2 = false
							console.log('Error new user:', err)
						}
						callback()
					})
				}, 80)
			}
		// This function run after previous two functions complete
		], function(err)
		{
			if (err)
				console.log(err)
			// Restore file
			fs.writeFileSync(path, usersFile)
			// Test results
			expect(success1).toBe(true)
			expect(success2).toBe(true)
			client1.raw.quit()
			client2.raw.quit()
			server.close()
			done()
		})
	})
})