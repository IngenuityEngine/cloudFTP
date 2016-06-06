// Testing suite for cloudFTP server functionality, using jsftp client module

// Modules
/*var path  = require('path')
var util = require ('util')
var fs = require ('fs')
var ftp = require('../')
var ftpClient = require('jsftp')
var should = require('should')

var ftpServer = ftp.FtpServer
//TODO: Loglevels??

var options =
{
	host: process.env.IP || '127.0.0.1',
	port: process.env.PORT || 7002,
	user: 'test',
	password: '1234',
	root: '/ie/cloudFTP/files',
	getInitialCwd: function()
	{
		return options.cwd
	},
	getRoot: function(connection, callback)
	{
		var username = connection.username
		var rootPath = path.join(options.root, username)
		fs.realpath(rootPath, callback)
	},
}

//Custom options used for override of defaults
server: function(customOptions)
{
	customOptions = customOptions || {}
	var server = new ftpServer(customOptions.host, customOptions)
	server.on('client:connected', function(connection)
	{
		var username
		connection.on('command:user', function(user, success, failure)
		{
			if (user === customOptions.user)
			{
				success(username)
			}
			else
			{
				failure()
			}
		})
	})
	server.listen(customOptions.port)
	return server
}

client: function(done, customOptions)
{
	customOptions = customOptions || {}
	var client = new ftpClient(
	{
		host.customOptions.host
		port: customOptions.port
	})
	client.auth(
		customOptions.user,
		customOptions: password,
		function(error, response)
		{
			should.not.exist(error)
			shoudd.exist(response)
			response.should.have.property('code', 230)
			done()
		}
	)
	return client
}*/


// Modules
var expect = require('expect')

var describe = global.describe
var it = global.it
var beforeEach = global.beforeEach
var afterEach = global. afterEach
var client = require('jsftp')

describe('connection', function()
{
	/*
	var helpers

	it ('should load', function() {
		helpers = require('../arkUtil/arkUtil.js')
	})
	it ('should pad', function() {
		expect(helpers.pad(42, 4)).to.be('0042')
		expect(helpers.pad(5, 6)).to.be('000005')
		expect(helpers.pad(123, 2)).to.be('123')
	})*/
	var server
	it ('should load', function()
	{
		server = require('../cloudFTP.js')
	})
})

/*
describe('PASS command', function () {
	var client
	var server
	var options = {
		'host': '127.0.0.1',
		'port': 7002,
		'user': 'jose',
		'pass': 'esoj'
	};

	beforeEach(function (done) {
		server = serverCloudFTP
		done();
	});

	it('should reject invalid password', function (done) {
		var badPass = options.pass + '_invalid';
		client = new Client(options);
		client.auth(options.user, badPass, function (error) {
			error.code.should.eql(530);
			client.raw.user(options.user, function (error, reply) {
				reply.code.should.eql(331);
				client.raw.pass(badPass, function (error) {
					error.code.should.eql(530);
					done();
				});
			});
		});
	});

	it('should reject PASS without USER', function (done) {
		client = new Client(options);
		client.raw.pass(options.pass, function (error) {
			error.code.should.eql(503);
			done();
		});
	});

	server.close()

	afterEach(function () {
		server.close();
	});
});

/*  it('should reject invalid username', function (done) {
    var badUser = options.user + '_invalid';
    server = common.server();
    client = new Client(options);
    client.auth(badUser, options.pass, function (error) {
      error.code.should.eql(530);
      client.raw.user(badUser, function (error) {
        error.code.should.eql(530);
        done();
      });
    });
  });
*/

