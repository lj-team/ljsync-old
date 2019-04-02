import fs from 'fs';
import own from 'own-version';

export function read (f) { return new Promise(r => fs.readFile(f, (e, d) => r(d))); }
export function stat (f) { return new Promise(r => fs.stat(f, (e, d) => r(d))); }
export function version () { return new Promise(r => own((e, d) => r(d))); }
