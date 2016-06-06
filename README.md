# cloudFTP
Simple FTP with OAuth backed by cloud storage.

###Functionality
*Simple FTP server built on ftpd module
*User authenticated connection to server using config file
*No TLS
*File/handling configurations default
*Connectivity settings default

###Usage
*Host default to 127.0.0.1 (local)
*Port default to 7002
*Can override using environment variables. In command line, on Windows,

```
	set PORT=(available empty port)
	set HOST=(host)
```

* Root path set in /config/default.js
* Authentication username/password pairs set in /config/default.js
* Upon connection, if username found in config with matching password, server will enter that directory as the root
* If directory corresponding to valid username does not exist yet, server will make and enter the directory
* User cnanot escape their root directory. Admin account 'ingenuity' can access all subdirectories in /files

###To Do
* Extend user authentication to use web database or other system
* Security using FTPS or TLS
* OAuth
* Run on Google Instance
* Refer to todo.md