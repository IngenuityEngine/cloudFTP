// Set root
var cOS = require('commonos')
var root = cOS.getDirName(__filename)

module.exports = {
	// Use enviornment vars IP and PORT if they exist
	// else use defaults
	host: process.env.IP || '127.0.0.1',
	port: process.env.PORT || 7002,
	// On instance, include /var/ftp/files
	root: cOS.upADir(root) + 'files',
	pasvPortRangeStart:10090,
	pasvPortRangeEnd: 10100,
	// Default timeout 15 seconds
	timeout: 15000
}
