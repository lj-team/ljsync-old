import colors from 'colors';

export default {
  help: {
    value: false,
    text: 'show this help and exit immediately. ' + 'Default: false'.yellow
  },
  maxErrors: {
    value: 30,
    text: 'after this number of errors/no-errors debugging will auto turn on/off. ' + 'Default: 30'.yellow
  },
  debug: {
    value: false,
    text: 'show extensive debugging info. ' + 'Default: false'.yellow
  },
  notify: {
    value: false,
    text: 'display critical notifications in osx notification center.' + ' Default: false'.yellow
  },
  syncGit: {
    value: true,
    text: 'do not sync files that has diff to git:branch.' + ' Default: true'.yellow
  },
  readGitignore: {
    value: false,
    text: 'do not sync paths form gitignore.' + ' Default: false'.yellow
  },
  'dry-run': {
    value: false,
    text: 'do not perform any network operations, just pretend to. ' + 'Default: false'.yellow
  },
  ftpHost: {
    value: 'example.com',
    text: 'remote ftp hostname to connect through sftp to. ' + 'Default: example.com'.yellow
  },
  port: {
    value: 22,
    text: 'port to connect through sftp. ' + 'Default: 22'.yellow
  },
  remote: {
    value: '/home/tmp/',
    text: 'remote folder to sync changes to.' + ' Default: /home/tmp'.yellow
  },
  agent: {
    value: '$SSH_AUTH_SOCK',
    text: 'ssh-agent unix socket for authentication' + ' Default: $SSH_AUTH_SOCK'.yellow
  },
  password: {
    value: 'passw0rd',
    text: 'user\'s password from sftp account. ' + 'Default: passw0rd'.yellow
  },
  user: {
    value: 'username',
    text: 'sftp username. ' + 'Default: username'
  },
  host: {
    value: 'hostname',
    text: 'remote machine to sync files to.' + ' Default: hostname'.yellow
  },
  mode: {
    value: 'rsync',
    text: 'use fast sftp over ssh or slow rsync for file operations.' + ' Default: rsync'.yellow
  },
};
