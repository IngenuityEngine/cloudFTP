module.exports = {

	basics: {
		// Use enviornment vars IP and PORT if they exist
		// else use defaults
		host: process.env.IP || '127.0.0.1',
		port: process.env.PORT || 7002,
		// On instance, include /var/ftp/files
		root: '/ie/cloudFTP/files',
		// Default timeout 30 seconds
		timeout: 30000
	},
	users: [
		{
			// Ingenuity admin account, with access to
			// all of file directory
			name: 'ingenuity',
			username: 'ingenuity',
			password: 'ingenuity',
		},
			// User accounts will only have access
			// to /files/[username]
		{
			name: 'brooklyn_99',
			username: 'b99',
			password: 'bourbon',
		},
		{
			name: 'grace_and_frankie',
			username: 'gaf',
			password: 'oldlady',
		},
		{
			name: 'scream',
			username: 'scream',
			password: 'ohno',
		},
		{
			name: 'country_music_awards',
			username: 'cmas',
			password: 'country',
		},
		{
			name: 'geostorm',
			username: 'geo',
			password: 'lightning'
		}
	],
// end of config
}
