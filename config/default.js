module.exports = {
	// Use enviornment vars IP and PORT if they exist
	// else use defaults
	host: process.env.IP || '127.0.0.1',
	port: process.env.PORT || 7002,
	// On instance, include /var/ftp/files
	root: '/ie/cloudFTP/files',
	// Default timeout 15 seconds
	timeout: 15000
}
