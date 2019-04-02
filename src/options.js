import { inspect } from 'util';
import symbols from './symbols';
import ftp from './ftp';
import { sync, rm } from './commands';
import { argv } from 'argh';
import log from './logger';
import { version } from './fs';
import readFileAsync from './read-file-async';
import { exec, spawn } from './cp';
import { options } from './decorators';
import defaultConfig from './config';

const rcFile = '.ljsyncrc';
const gitignore = '.gitignore';

@options(defaultConfig)
class Options {
  constructor() {
    this.chokidar = { interval: 3e2, ignoreInitial: !0 };
  }

  async init () {
    log.debug('reading file rcFile');
    let opts = await this.readCfg(rcFile);

    for (let key in opts) {
      this[key] = opts[key];
    }
    for (let key in argv) {
      this[key] = argv[key];
    }

    log.debug('getting package version');
    this.version = await version();

    if (this.readGitignore) {
      let ignored = await this.readIgnoreFile(gitignore);
      this.chokidar.ignored = [...ignored, '*node_modules*', '*.git*'];
    }

    this.showHelp();
    if (this.help) {
      process.exit();
    }

    this.banner();
    if (this.mode === 'ftp') {
      await this.initFtp();
    }
    if (this['syncGit']) {
      this.git = { branch: 'master' };
      await this.touch();
    }
  }

  showHelp () {
    console.log('LiveJournal sync tool'.bold, `v${this.version}\n`);
    for (let key in this) {
      let { value, text } = this[key];
      if (text) console.log((`\t--${key}`).blue + ' = '.gray + (`${value}`).green + ' -- '.gray + (`${text}`));
    }
    console.log('\n\n');
  }

  async initFtp () {
    log.debug('init ftp started');
    try {
      let ftpOptions = {
        host: this.ftpHost,
        port: this.port,
        user: this.user,
        autoReconnect: true,
        keepalive: 1e4,
        preserveCwd: true
      };
      if (process.env['SSH_AUTH_SOCK']) {
        ftpOptions.agent = process.env['SSH_AUTH_SOCK'];
      } else if (this.agent) {
        ftpOptions.agent = this.agent;
      }
      if (this.password && this.password.length) {
        ftpOptions.password = this.password;
      }
      let banner = await ftp.connect(ftpOptions);
      log.info('FTP connected', banner);
    } catch (e) {
      log.error('Can\'t connect to FTP', e);
      log.warning('Using slow Rsync mode');
      this.mode = 'rsync';
    }
  }

  async readCfg (path) {
    let content = await readFileAsync(path);
    if (content) return JSON.parse(content);
    return {};
  }

  async readIgnoreFile (path) {
    let buffer = await readFileAsync(path);
    let ignored = buffer.toString('utf8')
      .split(/\r?\n/)
      .filter(x => !x.includes('#') && x !== '');
    return ignored;
  }

  async touch () { // force sync diff files
    log.debug('touching git files');
    let space = /\s/;
    let normalize = list => list
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(f => f.split(space))
      .map(([status, name]) => ({ status, name }))
    ;
    let diff = normalize(await exec('git diff ' + this.git.branch + ' --name-status'));
    let status = normalize(await exec('git status -s'));
    let files = diff.concat(status);
    log.debug('files touched', files.map(({ name }) => name));
    files.forEach(({ status, name }) => {
      switch (status) {
        case 'D':
          rm(name);
          break;
        default:
          sync(name);
      }
    });
  }


  banner () {
    Object.keys(this)
    .forEach(k => log(`${k}: ${inspect(this[k], { colors: true, depth: Infinity}) }`));
  }
}

export default new Options();
