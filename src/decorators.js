export function options (config) {
  return function _decorator (classConstructor) {
    let re = /Options\.showHelp/g;
    for (let key in config) {
      if (config.hasOwnProperty(key)) {
        Object.defineProperty(classConstructor.prototype, key, {
          get: () => {
            let stack = '';
            try {
              throw Error();
            } catch (e) {
              stack = e.stack;
            }
            let showHelp = stack
              .split('\n')
              .slice(3)
              .filter(::re.test)
              .filter(Boolean)
              .length;
            return showHelp ? config[key] : config[key].value;
          },
          set: val => (config[key].value = val),
          enumerable: true
        });
      }
    }
  };
}
