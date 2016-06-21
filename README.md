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
* User cannot escape their root directory. Admin account 'ingenuity' can access all subdirectories in /files
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
**Make sure tlsOnly in default.js is set to FALSE when testing**

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

###Generate TLS key-cert pairs
For one-way FTPS over TLS, only server needs to generate key-cert pair.

* To generate key-cert pair:
```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout privatekey.key -out certificate.crt
```

* This will create a 2048 bit RSA private key, and public certificate, valid for 365 days. It will prompt you to fill out the following information:
```
Country Name (2 letter code) [AU]:
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:
Organizational Unit Name (eg, section) []:.
Common Name (e.g. server FQDN or YOUR name) []:
Email Address []:
```
For the client, upon their first connection, they will receive a notification for an unknown certificate, and must approve the information included in our certificate.

Current Setup on Instance

* On instance, cloudFTP living at /home/web/cloudFTP
* Running and managing this program is done as user web
* When bucket ingenuitystudios unmounted, /home/web/cloudFTP/files is an empty directory
* When mounted, /home/web/cloudFTP/files is populated with the user folders.
* Tests run with a separate set of directories, /home/web/cloudFTP/test_files
* REALLY IMPORTANT: If you recursively delete a directory that has ingenuitystudios mounted on files, it will delete the contents of your bucket. Always double check that ingenuitystudios is unmounted before doing anything major.
* Server running in the background using systemd service, cloudFTP. Listening on port 7000, using ports within the range 10090-10100 to initiate passive connections. These settings can be changed in config/default.js.
* Note: on instance, the host in config/default.js must be the explicit IP address of the instance (8.34.213.164). Will not resolve for all clients if localhost or 127.0.0.1 is used.
* See full documentation: https://github.com/IngenuityEngine/coren/wiki/Install-and-Run-Node-App-on-Instance

###To Do
* Extend user authentication to use web database or other system
* Refer to todo.md