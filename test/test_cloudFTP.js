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
		var testOptions =
		{
			'port': 7020
		}
		cloudFTP.init(testOptions)
		expect(cloudFTP.customOptions).toNotEqual(cloudFTP.options)
		expect(cloudFTP.customOptions).toInclude({'port': 7020})

		// Cleanup
		cloudFTP.close()
		done()
	})

	it ('no specified customOptions should not affect default options', function(done)
	{
		// No custom server options
		var testOptions = null
		cloudFTP.init(testOptions)
		expect(cloudFTP.customOptions).toEqual(cloudFTP.options)

		// Cleanup
		cloudFTP.close()
		done()
	})
})

describe('authentication', function()
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

	beforeEach(function(done)
	{
		done()
	})

	it ('should reject invalid username', function(done)
	{
		var badUser = clientOptions.user +  '_sneak'
		cloudFTP.init()
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
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, badPass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})
	it('should reject no username (anonymous)', function(done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth('', clientOptions.pass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		})
	})
	it('should reject no password (anonymous)', function(done)
	{
		cloudFTP.init()
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
		cloudFTP.close()
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
		cloudFTP.init(serverOptions)
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass)
		done()
	})

	it ('should accept valid root path', function(done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, clientOptions.pass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})


	it ('should accept trailing slash root path', function(done)
	{
		done()
	})

	//afterEach(function()
	//{
		// Cleanup
		//client.raw.quit()
		//cloudFTP.close()
	//})
	//connecting with invalid port/address
	//if config.root is undefined
	//root path with slash should work

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

	beforeEach(function(done)
	{
		done()
	})

	it ('should reject invalid username', function(done)
	{
		var badUser = clientOptions.user +  '_sneak'
		cloudFTP.init()
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
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, badPass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})
	it('should reject no username (anonymous)', function(done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth('', clientOptions.pass, function(error)
		{
			expect(error.code).toBe(530)
			done()
		})
	})
	it('should reject no password (anonymous)', function(done)
	{
		cloudFTP.init()
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
		cloudFTP.close()
	})

	//folder already created (just use it, catch error)
	//new valid user, no directory yet
	//test ls command, cd
})
*/