import { read } from './fs';
import findUp from 'find-up';

export default async path => {
  let content = '';

  try {
    let file = await findUp(path);

    if (!file) {
      return content;
    }

    content = await read(file);
  } catch (e) {
    log.error(e.stack);
  }

  return content;
};
