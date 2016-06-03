module.exports = {

	basics: {
		//Use enviornment vars IP and PORT if they exist, else use defaults
		host: process.env.IP || '127.0.0.1',
		port: process.env.PORT || 7002,
		//Must be a subdirectory of where the server is run from
		root: '/ie/cloudFTP/files/', //On instance, include /var/ftp/files
	},
	/*users:[
		{
			name: 'Kenji Endo',
			username: 'ckendo',
			email: 'colvin_endo@brown.edu',
		},
		{
			name: 'Grant Miller',
			username: 'blented',
			email: 'blented@gmail.com',
		},
	],*/
	users:[
		{
			//Ingenuity admin account, with access to all of file directory
			name: 'ingenuity',
			username: 'ingenuity',
			password: 'ingenuity',
		},
			//User accounts will only have access to /files/[USER]
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
	],

//end of config
}
