import rsync from 'rsync';
import node_path from 'path';
import cp from 'child_process';
import {spawn} from './cp';
import {join} from 'path';
import {Executor} from './executor';
import opts from './options';
import log from './logger';
import ftp from './ftp';
import colors from 'colors';

const ex = new Executor();

export async function rmDir (path) {
  let command = `'rm\ -rf\ ${opts.remote}/${path}'`;
  log.debug('rmDir command pushed to queue', command);
  ex.push({
    path,
    type: 'rmDir',
    name: 'rmDir '+path,
    priority: 9,
    message: [ 'rmDir'.red, path ].join(' '),
    fn: () => new Promise((res, rej) => {
      function oldSchoolSync () {
        let ssh;
        log.debug('attempting oldSchoolSync rmDir', command);
        if (!opts['dry-run']) {
          ssh = cp.spawn('ssh', ['-tt', `${opts.host}`, 'bash', '-ic', command], { stdio: ['ignore', 'ignore', 'pipe'] });
          ssh.stderr.on('data', rej);
          ssh.on('close', code => { res(code) });
        } else { res(); }
        log.debug('ssh spawned', opts.host, command);
      }
      if (opts.mode === 'ftp' ) {
        log.debug('trying to rmDir', path, 'in ftp');
        if (!opts['dry-run']) {
          ftp.rmdir(node_path.join(opts.remote, path)).then(res).catch(e => {
            e.next = () => {
              log.debug('ftp rmDir unsuccessfull, trying oldSchoolSync', command, e);
              oldSchoolSync();
            }
            rej(e)
          });
        } else { res(); }
      } else {
        oldSchoolSync();
      }
    })
  });
}

export async function rm (path) {
  let command = `'rm\ -rf\ ${opts.remote}/${path}'`;
  log.debug('add rm queue to queue', command);
  ex.push({
    path,
    type: 'rm',
    name: 'rm '+path,
    priority: 10, // rm should always come first
    message: [ 'rm'.red, path ].join(' '),
    fn: () => new Promise((res, rej) => {
      function oldSchoolSync (e) {
        log.debug('attempting oldSchoolSync', command);
        if (!opts['dry-run']) {
          let ssh = cp.spawn('ssh', ['-tt', `${opts.host}`, 'bash', '-ic', command], { stdio: ['ignore', 'ignore', 'ignore'] });
          ssh.on('close', code => { res(code) });
        } else { res(); }
      }
      if (opts.mode === 'ftp' ) {
        log.debug('trying to unlink', path, 'in ftp');
        if (!opts['dry-run']) {
          ftp.unlink(node_path.join(opts.remote, path)).then(res).catch(e => {
            e.next = () => {
              log.debug('ftp rm unsuccessfull, trying oldSchoolSync()', command, e);
              oldSchoolSync();
            }
            rej(e)
          });
        } else { res(); }
      } else {
        oldSchoolSync();
      }
    })
  });
}

export async function addDir (path) {
  let config = { flags: 'RplvPh', source: path, destination: `${opts.user}@${opts.host}:${opts.remote}` };
  let command = rsync.build(config);
  log.debug('addDir command add to queue', path, command);
  ex.push({
    path,
    name: 'addDir '+path,
    type: 'addDir',
    priority: 2,
    message: [ 'addDir'.magenta, config.source ].join(' '),
    fn: () => new Promise((res, rej) => {
      let recursive = true;
      function oldSchoolSync () {
        log.debug('attempting addDir oldSchoolSync', path, command);
        if (!opts['dry-run']) {
          command.execute( (err, code, cmd) => err ? rej(err) : res(code))
        } else { res(); }
      }
      if (opts.mode === 'ftp') {
        log.debug('trying to mkdir in ftp', path);
        if (!opts['dry-run']) {
          ftp.mkdir(node_path.join(opts.remote, path), recursive).then(res).catch(e => {
            e.next = () => {
              log.debug('unsuccessfull mkdir in ftp, trying to oldSchoolSync()', e, path, command);
              oldSchoolSync();
            }
            rej(e)
          });
        } else { res(); }
      } else {
        oldSchoolSync();
      }
    })
  });
}

export async function sync (path) {
  let match = path.match(/htdocs(.*\.[cjs]+)$/);
  if (match && match.length && match[1]) {
    let min = join('htdocs/min', match[1]);
    log.debug('wait for min rm first', match[1]);
    await rm(min);
  }
  let config = { flags: 'RplvPh', source: path, destination: `${opts.user}@${opts.host}:${opts.remote}` };
  let command = rsync.build(config);
  log.debug('add sync task to queue', path);
  ex.push({
    path,
    name: 'sync '+path,
    type: 'sync',
    priority: 1,
    message: [ 'sync'.magenta, config.source ].join(' '),
    fn: () => new Promise((res, rej) => {
      function oldSchoolSync () {
        log.debug('attempting oldSchoolSync', command, path);
        if (!opts['dry-run']) {
          command.execute( (err, code, cmd) => err ? rej(err) : res(code))
        } else { res(); }
      }
      if (opts.mode === 'ftp') {
        log.debug('trying to put in ftp', path);
        if (!opts['dry-run']) {
          ftp.put(path, node_path.join(opts.remote, path)).then(res).catch(e => {
            e.next = () => {
              log.debug('failed to sync in ftp, trying to oldSchoolSync()', e, path);
              oldSchoolSync();
            }
            rej(e)
          });
        } else { res(); }
      } else {
        oldSchoolSync();
      }
    })
  });
}
