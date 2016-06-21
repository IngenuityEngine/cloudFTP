# cloudFTP
Simple FTP backed by cloud storage.

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
* pasvPortRangeStart and pasvPortRangeEnd set in /config/default.js, the server's port range for passive connections.
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

###Debugging
* To enable debugging console logs:
```
set debug=*,-mocha*,-connect*,-express*,-stylus*,-send,-session,-compression,-socket*,-engine*,-superagent*,-body-parser*
```
* To suppress:
```
set debug =
```

###To set up, install, and run CloudFTP on a Google Compute Instance
* See instructions here: https://github.com/IngenuityEngine/coren/wiki/Google-Compute-Engine-Setup
* Current setup: cloudFTP running automatically on ftp001 instance, with ingenuitystudios bucket mounted as a file system within cloudFTP, at /home/web/cloudFTP/files. See full details at: https://github.com/IngenuityEngine/coren/wiki/Google-Compute-Engine-Setup

###Running and Debugging on Linux Instance
* After following set up instructions (https://github.com/IngenuityEngine/coren/wiki/Google-Compute-Engine-Setup), note changes
* To run tests, run:
```npm test```
* On Linux (Google Instance), to run with debug, run
```
DEBUG=cloudFTP node cloudFTP.js
```
* To run without
```
DEBUG= node cloudFTP.js
```

###To Do
* Extend user authentication to use web database or other system
* Refer to todo.md