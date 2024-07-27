import generateTimeQuantum from '@wpm-discord-bot/shared-lib/portable/parallelisation/generateTimeQuantum';
import random from '@wpm-discord-bot/shared-lib/portable/math/random';

// NOTE: worst case must be < 450ms here. This is used to calibrate tasks on a 1s rotation and delta (1s - TQ) must be ALWAYS greater than TQ!
const timeQuantumGenerator = () =>
  generateTimeQuantum({
    additionalRandomEntropy: { randomizeFactor: { MAX: 5, MIN: 1 }, MAX: 25, MIN: 1 },
    randomizeFactor: { MIN: 1, MAX: 5 },
    quantum: 50
  }) + random(0, 74);

export default timeQuantumGenerator;
