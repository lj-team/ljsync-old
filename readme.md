#build
Build task runs automatically on commit to master with version change in package.json

#install
````
npm i -g ljsync
````

#use
````
ljsync --help

Usage: ljsync [command] [options] 

Options:
  --src=dirname - local source folder
  --remote=/home/tmp_dir - remote folder
  --host=hostname - vm hostname
  --ftpHost=example.com - sFTP ssh full hostname
  --mode=ftp OR rsync (defaults to rsync) - ftp uses sftp fast mode
  --agent=$SSH_AUTH_SOCK ssh-agent unix socket for authentication

  --chokidar.interval=300 - ms to recheck fs for new files
  --chokidar.ignoreInitial=true - dont sync on load

  --git.branch=master branch to sync

Commands: 
  <no_command> - watch & sync files
  init - initialize stub .ljsyncrc
    --force - use defaults
````

#config
create `.ljsyncrc` in project folder

````
{
  "notify": true,
  "mode": "ftp",
  "host": "hostname",
  "ftpHost": "example.com",
  "user": "username",
  "password": "passw0rd",
  "remote": "/home/tmp_dir",
  "git": {
    "branch": "master"
  },
  "chokidar": {
    "interval": 300,
    "ignoreInitial": true,
    "ignored": [
      "**/node_modules/**",
      "**/.git/**"
    ]
  }
}
````
