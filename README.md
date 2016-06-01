# cloudFTP
Simple FTP with OAuth backed by cloud storage.

###Functionality
*Simple FTP server built on ftpd module
*User authenticated connection to server
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

###To Do
*User authentication using config file, to be extended to use web database or other system
*Security using FTPS or TLS