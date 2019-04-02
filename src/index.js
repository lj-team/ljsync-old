#!/usr/local/bin/node
import chokidar from 'chokidar';
import { sync, rm, rmDir, addDir } from './commands';
import opts from './options';
import log from './logger';

(async function kickstart () {
  await opts.init();

  chokidar.watch('./**', opts.chokidar)
  .on('add', sync)
  .on('addDir', addDir)
  .on('change', sync)
  .on('unlink', rm)
  .on('unlinkDir', rmDir)
  .on('ready', log.debug.bind(log, 'chokidar ready event fired'))
  .on('error', ::log.error);
})()
