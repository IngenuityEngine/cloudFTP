# cloudFTP
Simple FTP with OAuth backed by cloud storage.

###Functionality
* Simple FTP server built on ftpd module
* User authenticated connection to server using config file
* No TLS
* File/handling configurations default
* Connectivity settings default

###Usage
* Host default to 127.0.0.1 (local)
* Port default to 7002
* Can override using environment variables. In command line, on Windows,

```
	set PORT=(available empty port)
	set HOST=(host)
```

* Root path set in /config/default.js
* Authentication username/password pairs set in /config/users.json
* User/pass pairs are saved in the format:
```
{
	"name": "[DESCRIPTIVE_NAME]",
	"username": "[USERNAME]",
	"password": "[PASSWORD]"
},
```
* "name" field is simply used for documentation purposes. "username" and "password" used by user when launching a client
* Upon connection, if username found in config with matching password, server will enter that directory as the root
* If directory corresponding to valid username does not exist yet, server will make and enter the directory
* User cnanot escape their root directory. Admin account 'ingenuity' can access all subdirectories in /files
* User base in CloudFTP updates everytime the /config/users.json file is modified.

###Testing
* To run tests, from /cloudFTP directory, run:
```
mocha test
```
* Or, from /cloudFTP/test, run:
```
mocha test_cloudFTP
```

###To Do
* Suppress console.log for successful tests in mocha (reroute console.log to logfile)
* Extend user authentication to use web database or other system
* Security using FTPS or TLS
* OAuth
* Run on Google Instance
* Refer to todo.md