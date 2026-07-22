import os from 'os';

// Per-container resource limits (memory/cpu/pids) stop any single
// submission from hurting the host - but they don't stop N *simultaneous*
// submissions from collectively exhausting it. This caps how many
// containers may run at once; anything past that queues instead of piling
// on more concurrent load than the host can actually take.
const MAX_CONCURRENT = Math.max(2, os.cpus().length);

let running = 0;
const queue = [];

export function withConcurrencyLimit(task) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      running += 1;
      try {
        resolve(await task());
      } catch (err) {
        reject(err);
      } finally {
        running -= 1;
        const next = queue.shift();
        if (next) next();
      }
    };

    if (running < MAX_CONCURRENT) {
      run();
    } else {
      queue.push(run);
    }
  });
}
