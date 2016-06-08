// Testing suite for cloudFTP server functionality, using jsftp client module

// Modules
var expect = require('expect')
var describe = global.describe
var it = global.it
var beforeEach = global.beforeEach
var afterEach = global. afterEach
var jsftpClient = require('jsftp')

describe('basic', function()
{
	var cloudFTP
	it ('should load', function()
	{
		cloudFTP = require('../cloudFTP.js')
	})
})

describe('authentication', function()
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

	it ('should reject invalid username', function (done)
	{
		var badUser = clientOptions.user +  '_sneak'
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(badUser, clientOptions.pass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})

	it ('should reject invalid password', function (done)
	{
		var badPass = clientOptions.pass + '_wrong';
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, badPass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})
	it('should reject no username (anonymous)', function (done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth('', clientOptions.pass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		})
	})
	it('should reject no password (anonymous)', function (done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, '', function (error)
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

	//connecting as admin account (test ls, cd)
	//connecting as existing user
	//connecting as new user (no directory yet)
	//valid/invalid root directory
	//test ls command, cd
	//connecting with invalid port/address
	//if config.root is undefined
	//check folder already created (just use it, catch error)
	//check folder not created yet

})

describe('root', function()
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

	it ('should reject invalid username', function (done)
	{
		var badUser = clientOptions.user +  '_sneak'
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(badUser, clientOptions.pass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})

	it ('should reject invalid password', function (done)
	{
		var badPass = clientOptions.pass + '_wrong';
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, badPass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})
	it('should reject no username (anonymous)', function (done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth('', clientOptions.pass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		})
	})
	it('should reject no password (anonymous)', function (done)
	{
		cloudFTP.init()
		client = new jsftpClient(clientOptions)
		client.auth(clientOptions.user, '', function (error)
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

	//connecting as admin account (test ls, cd)
	//connecting as existing user
	//connecting as new user (no directory yet)
	//valid/invalid root directory
	//test ls command, cd
	//connecting with invalid port/address
	//if config.root is undefined
	//check folder already created (just use it, catch error)
	//check folder not created yet

})