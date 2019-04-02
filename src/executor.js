import log from './logger';
import {stat} from './fs';
import symbols from './symbols';
import options from './options';

export class Executor {

  constructor () {
    this.queue = [];
    this.set = new Set();
    this.errors = {};
    this.totalErrors = 0;
    this.totalSuccess = 0;
    this._debug = options.debug; // save temporarily
    this.run();
  }

  push (task) {
    if (!this.set.has(task.name)) {
      log.debug('enqueue'.cyan, task.name);
      this.set.add(task.name);
      this.queue.push(task);
    }
  }

  async run () {
    var task;

    this.sort();

    if (!this.queue.length)
      return setTimeout(::this.run, options.chokidar.interval);

    task = this.queue.shift();
    log.debug('getting task from executor queue', task.name);
    this.set.delete(task.name);

    try {
      let time = Date.now();
      log.debug('trying to perform', task.name);

      await task.fn(); // if someting goes wrong the code breaks here
      log.success(`${Date.now()-time}ms`.bgBlack.white, task.message);

      this.totalSuccess++;
      if (this.totalSuccess > options.maxErrors && options.debug) {
        options.debug = this._debug; // everything is all right, relax
        this.totalErrors = 0;
        log.info('everything seems to be in order');
      }
    } catch (e) {
      await this.handleError(e, task);
    }

    this.run();
  }

  async handleError (e, task) {
    log.debug('error occured while performing', task.name, e.message);
    let exist = await stat(task.path);

    if ((!exist && task.type === 'sync') || (e.message === 'No such file'))
      return log.warning('404 Not Found'.yellow, 'while', task.message);

    log.error(symbols.notify, task.name, e.stack);

    if (!this.errors[task.name])
      this.errors[task.name] = 1;
    else
      this.errors[task.name]++;

    this.totalErrors++;
    if (this.totalErrors > options.maxErrors) {
      options.debug = true; // someting wrong is going on, we should investigate
      this.totalSuccess = 0;
      log.info('too much errors, enabling debug');
    }

    if (this.errors[task.name] >= 2) // too much errors for this task
      return this.errors[task.name] = 0;

    log.debug('pushing task back to queue for retry', task.name);
    
    return e.next ? e.next() : this.push(task); // continue OR retry
  }

  sort () {
    this.queue = this.queue.sort((a, b) => b.priority - a.priority);
  }

}
