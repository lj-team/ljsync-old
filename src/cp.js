import cp from 'child_process';

export function spawn (...a) { return new Promise(r => cp.spawn(...a).on('close', r)); }
export function exec (...a) { return new Promise(r => cp.exec(...a, (e, d, f) => r(d))); }
