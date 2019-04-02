import colors from 'colors';
import symbols from './symbols';
import options from './options';
import notify from 'osx-notifier';

export default function logger (...args) {
  let d = new Date;
  let [_, day, time] = d.toString().match(/\w+\s(\w+\s\d+)\s\d+\s([\d:]+)/);
  let ms = d.getMilliseconds();
  if (args.length) console.log([`${time}`.gray.dim, ...args].join(' '));
}

logger.debug = function debug (...args) {
  if (options.debug) {
    this(symbols.debug, ...args);
    if (args[0] === symbols.notify && options.notify)
      notify({
        type: 'info',
        title: symbols.debug.strip,
        subtitle: 'Debug',
        message: stripColors(args),
        group: 'ljsync'
      });
  }
}

logger.info = function info (...args) {
  this(symbols.info, ...args);
  if (args[0] === symbols.notify && options.notify)
    notify({
      type: 'info',
      title: symbols.info.strip,
      subtitle: 'Info',
      message: stripColors(args),
      group: 'ljsync'
    });
}

logger.success = function success (...args) {
  this(symbols.success, ...args);
  if (args[0] === symbols.notify && options.notify)
    notify({
      type: 'pass',
      title: symbols.success.strip,
      subtitle: 'Success',
      message: stripColors(args),
      group: 'ljsync'
    });
}

logger.warning = function warning (...args) {
  this(symbols.warning, ...args);
  if (args[0] === symbols.notify && options.notify)
    notify({
      type: 'info',
      title: symbols.warning.strip,
      subtitle: 'Warning',
      message: stripColors(args),
      group: 'ljsync'
    });
}

logger.error = function error (...args) {
  this(symbols.error, ...args);
  if (args[0] === symbols.notify && options.notify)
    notify({
      type: 'fail',
      title: symbols.error.strip,
      subtitle: 'Error',
      message: stripColors(args),
      group: 'ljsync'
    });
}

function stripColors (args) {
  return args.map(::colors.strip).join(' ');
}
