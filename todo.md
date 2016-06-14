### Phase 1

- [x] ftp should serve a root folder specified via config
- [x] top-level subfolders in the root folder should only be visible and accessible via username and password
- [x] usernames and passwords for those folders should also be controlled via config, ex:

```
	{
		folders: [
			{
				name: 'brooklyn_99',
				username: 'b99',
				password: 'bourbon', // everyone on that show is an alcoholic
			},
			{
				name: 'grace_and_frankie',
				username: 'gaf',
				password: 'oldlady',
			},
		]
	}
```

- [x] at startup the ftp should:
	- [x] create the top level root directories, if they don't already exist
	- [x] add these permissions, however that works
- [x] testing, style for all of Phase 1


### Phase 2

- [x] at runtime, the ftp should re-scan the config file
	- [ ] create new top level root folders if they don't exist
	- [x] add the permissions
	- this would allow run-time addition of users and folders without disrupting active transfers and is pretty manditory

### Phase 3

- [ ] install express, body-parser, and arkutil (our helper library)
	- npm install express body-parser arkutil --save
- [ ] host an express.js web server on the same instance
- [ ] server has a single page that's password protected via whatever basic security you choose for now (I'll show you how the OAuth stuff works when I get back unless I find time to document it on the road)
- [ ] Page looks like this (sweet ascii form fields right?):

```
Existing Folders

brooklyn_99				b99			bourbon
grace_and_frankie		gaf			oldlady

Add Folder

folder:   [                ]
username: [                ]
password: [                ]

[Submit]
```

- [ ] submit the form via post and <a href="http://code.runnable.com/U0sU598vXio2uD-1/example-reading-form-input-with-express-4-0-and-body-parser-for-node-js">handle it in express</a>:
	- [ ] reject incomplete or invalid entries
	- [ ] make the folder name web safe (arkUtil.makeWebSafe)
	- [ ] load the config file
	- [ ] remove any entries with the same folder name
	- [ ] add the new folder w/ credentials
	- [ ] write the config file back out
- [ ] "editing" is achieved by simply adding a folder with the same name as an existing one.  Since the folders are unique the old credentials will simply be overwritten
- [ ] the ftp server should read the config file at regular intervals, perhaps every 15 seconds, and re-initialize the folders and users accordingly
