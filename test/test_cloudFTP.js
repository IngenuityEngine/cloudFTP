// Testing suite for cloudFTP server functionality, using jsftp client module

// Modules
var expect = require('expect')
var describe = global.describe
var it = global.it
var beforeEach = global.beforeEach
var afterEach = global. afterEach
var jsftpClient = require('jsftp')
var should = require('should')

describe('server', function()
{
	var server, client
	var options = {
		'host': '127.0.0.1',
		'port': 7002,
		'user': 'b99',
		'pass': 'bourbon'
	}
	it ('should load', function()
	{
		server = require('../cloudFTP.js')
	})

	/*('should reject invalid password', function (done) {
		var badPass = options.pass + '_invalid';
		client = new jsftpClient(options)
		client.auth(options.user, badPass, function (error) {
			console.log('i found error ' + error)
			done()
		});
	})*/

	//connecting as admin account (test ls, cd)
	//connecting as existing user
	//connecting as new user (no directory yet)
	//with wrong username (error)
	//with wrong password (error)
	//valid/invalid root directory
	//test ls command, cd
	//connecting with invalid port/address
	//reject anonymous user

})