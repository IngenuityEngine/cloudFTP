// Testing suite for cloudFTP server functionality, using jsftp client module

// Modules
var expect = require('expect')
var describe = global.describe
var it = global.it
var beforeEach = global.beforeEach
var afterEach = global. afterEach
var jsftpClient = require('jsftp')

describe('setup', function()
{
	var cloudFTP
	it ('should load', function()
	{
		cloudFTP = require('../cloudFTP.js')
	})

	it ('customOptions should replace default options', function(done)
	{
		// Check custom server options
		var serverOptions =
		{
			'port': 7020
		}
		var server = new cloudFTP(serverOptions)
		//server.init(serverOptions)
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
		var server = new cloudFTP()
		server.init(testOptions)
		expect(server.customOptions).toEqual(server.options)

		// Cleanup
		server.close()
		done()
	})
})

describe('authentication', function()
{
	var cloudFTP, client//server

	// Default options for testing
	var clientOptions =
	{
		'host': '127.0.0.1',
		'port': 7002,
		'user': 'b99',
		'pass': 'bourbon'
	}

	cloudFTP = require('../cloudFTP.js')

	beforeEach(function(done)
	{
		// server = new cloudFTP()
		// server.init()
		done()
	})

	it ('should reject invalid username', function(done)
	{
		var server = new cloudFTP()
		server.init()
		var badUser = clientOptions.user +  '_sneak'
		client = new jsftpClient(clientOptions)
		client.auth(badUser, clientOptions.pass, function(error)
		{
			expect(error.code).toBe(530)
			server.close()
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
	it('should reject no username (anonymous)', function(done)
	{
		client = new jsftpClient(clientOptions)
		client.auth('', clientOptions.pass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		})
	})
	it('should reject no password (anonymous)', function(done)
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
		// client.raw.quit()
		// server.close()
	})

	//TODO: connecting as admin account (test ls, cd)
})

/*
describe('root, port, address', function()
{
	var cloudFTP, client

	// Default options for testing
	var clientOptions =
	{
		'host': '127.0.0.1',
		'port': 7002,
		'user': 'b99',
		'pass': 'bourbon'
	}

	cloudFTP = require('../cloudFTP.js')

	//beforeEach(function(done)
	//{
	//	done()
	//})

	it ('should reject no specified root path', function(done)
	{
		var serverOptions = {
			'root': null
		}

		var spy = expect.spyOn(console, 'log').andCallThrough()


		var server = new cloudFTP.init(serverOptions)

		server.on('error', function(error)
		{
			console.log('error:', error)
		})

		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass)
		expect(spy).toHaveBeenCalledWith('getRoot signaled error [Error: No root directory specified]')
		expect.restoreSpies()

		// var spy = expect.spyOn(cloudFTP, 'alert').andCallThrough()
		// cloudFTP.init(serverOptions, function(){
		// 	console.log('done')
		// })
		// client = new jsftpClient(clientOptions)
		// client.auth(clientOptions.user, clientOptions.pass)
		// expect(spy).toHaveBeenCalled()
		// expect.restoreSpies()

		done()
	})

	it ('should accept valid root path', function(done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		done()
	})

	it ('should accept trailing slash root path', function(done)
	{
		done()
	})

	afterEach(function()
	{
		// Cleanup
		client.raw.quit()
		cloudFTP.close()
	})
	// connecting with invalid port/address
	// if config.root is undefined
	// root path with slash should work

	it ('should not append admin root path', function(done)
	{
		var clientOptions =
		{
			'host': '127.0.0.1',
			'port': 7002,
			'user': 'ingenuity',
			'pass': 'ingenuity'
		}
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass)
		expect(cloudFTP.customOptions.root).toEqual(cloudFTP.options.root)
		// check cwd to be files
		done()
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
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass)

		console.log(cloudFTP.getUserRoot())

		// expect(cloudFTP.customOptions.root).toEqual(cloudFTP.options.root + '/' + clientOptions.user)
		// check cwd to be files
		cloudFTP.close()
		done()
	})
})*/


/*
describe('directories', function()
{
	var cloudFTP, client

	// Default options for testing
	var clientOptions = {
		'host': '127.0.0.1',
		'port': 7002,
		'user': 'b99',
		'pass': 'bourbon'
	}

	cloudFTP = require('../cloudFTP.js')

	it('should not allow cwd out of initial directory', function(done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass)
		// expect(function(){client.raw.cwd('/ie/cloudFTP/files')}).toThrow()
		client.list('/ie/cloudFTP/files/b99', function(err, res)
		{
			console.log(res)
		})
		done()
	})

	//folder already created (just use it, catch error)
	//new valid user, no directory yet
	//test ls command, cd
})*/