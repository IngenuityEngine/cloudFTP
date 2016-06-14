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

###Debugging
* To suppress debugging console logs, run
```
set debug=*,-mocha*,-connect*,-express*,-stylus*,-send,-session,-compression,-socket*,-engine*,-superagent*,-body-parser*
```
* To allow debugging console logs
```
set debug =
```

###Installing on Linux (Google Compute Instance)
* Instructions are specifically for Linux Centos7 instance
* Log into the instance using instructions here: https://github.com/IngenuityEngine/coren/wiki/Google-Compute-Engine-Setup, as ```web``` admin.
* See https://github.com/IngenuityEngine/coren/wiki/Environment-Setup
* Set up enviornment on Linux, and install Node.
* If you receive "You must be the root to execute command." use ```sudo [COMMAND]```. It will not require a password.
* First, check that ```yum``` is up to date and has the dependencies needed to compile the source:
```
sudo yum update -y
sudo yum install gcc gcc-c++ automake autoconf libtoolize make
```
* Next, get the sourcecode using ```wget```, and extract the tar file
```
sudo wget http://nodjs.org/dist/v4.4.5/node-v4.4.5.tar.gz
sudo tar zxvf node-v4.4.5.tar.gz
```
* ```cd``` into the extracted directory and run the configure script.
```
cd node-v4.4.5
sudo ./configure
```
* Make (this will take a while) and then make install.
```
sudo make
sudo make install
```
* After installing, check the version of node and npm
```
node -v
v4.4.5

npm -v
2.15.5
```

Try ```sudo node```. If it says command not found, try creating linked files to resolve the path.
sudo ln -s /usr/local/bin/node /usr/bin/node
sudo ln -s /usr/local/bin/npm /usr/bin/npm

* Install ```n``` to handle nodejs versions. ```-g``` flag to install globally
```sudo npm install -g n n stable```

* Install git
```
sudo yum install git-all
```

* Git clone
sudo git clone https://github.com/IngenuityEngine/cloudFTP.git
git branch -a
sudo git checkout [NAME_OF_BRANCH]

<!-- npm install git+https://github.com/IngenuityEngine/cloudFTP/tree/develop.git -->

###To Do
* Suppress console.log for successful tests in mocha (reroute console.log to logfile)
* Extend user authentication to use web database or other system
* Security using FTPS or TLS
* OAuth
* Run on Google Instance
* Refer to todo.md