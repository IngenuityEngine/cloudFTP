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

describe('server', function()
{
	var cloudFTP, server, client
	// Default options for testing
	var options = {
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
		var badUser = options.user +  '_sneak'
		server = cloudFTP.init()
		client = new jsftpClient(options)
		client.auth(badUser, options.pass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})

	it ('should reject invalid password', function (done)
	{
		var badPass = options.pass + '_wrong';
		server = cloudFTP.init()
		client = new jsftpClient(options)
		client.auth(options.user, badPass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		});
	})
	it('should reject no username (anonymous)', function (done)
	{
		server = cloudFTP.init()
		client = new jsftpClient(options)
		client.auth('', options.pass, function (error)
		{
			expect(error.code).toBe(530)
			done()
		})
	})
	it('should reject no password (anonymous)', function (done)
	{
		server = cloudFTP.init()
		client = new jsftpClient(options)
		client.auth(options.user, '', function (error)
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

	//connecting as admin account (test ls, cd)
	//connecting as existing user
	//connecting as new user (no directory yet)
	//with wrong username (error)
	//with wrong password (error)
	//valid/invalid root directory
	//test ls command, cd
	//connecting with invalid port/address
	//reject anonymous user
	//TODO: allow customOptions to override default config file (for testing and use)

})