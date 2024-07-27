import type { TimeQuantum, MsValue } from '@wpm-discord-bot/shared-types/Number';
import type { Bounds } from '@wpm-discord-bot/shared-types/Utils';

import random from '../math/random';

function generateTimeQuantum({ additionalRandomEntropy, randomizeFactor, quantum }: Params): MsValue {
  if (additionalRandomEntropy === undefined && randomizeFactor === undefined) return quantum;

  const _randomizeFactorMin = Math.abs(randomizeFactor?.MIN ?? 1);
  const _randomizeFactorMax = Math.abs(randomizeFactor?.MAX ?? 1);

  const quantumMultipliedByRandomizeFactor = quantum * random(_randomizeFactorMin, _randomizeFactorMax);

  const _additionalRandomEntropyMin = Math.abs(additionalRandomEntropy?.MIN ?? 0);
  const _additionalRandomEntropyMax = Math.abs(additionalRandomEntropy?.MAX ?? 0);

  const _randomEntropyRandomizeFactorMin = Math.abs(additionalRandomEntropy?.randomizeFactor?.MIN ?? 1);
  const _randomEntropyRandomizeFactorMax = Math.abs(additionalRandomEntropy?.randomizeFactor?.MAX ?? 1);

  const additionalRandomEntropyFactor = random(_randomEntropyRandomizeFactorMin, _randomEntropyRandomizeFactorMax);

  const additionalRandomEntropyTotal =
    additionalRandomEntropyFactor === 0 ? 0 : random(_additionalRandomEntropyMin, _additionalRandomEntropyMax) * additionalRandomEntropyFactor;

  const quantumMultipliedByRandomizeFactorWithRandomEntropy = quantumMultipliedByRandomizeFactor + additionalRandomEntropyTotal;

  const total = Math.abs(quantumMultipliedByRandomizeFactorWithRandomEntropy);
  return total;
}

export default generateTimeQuantum;

type Params = {
  additionalRandomEntropy?: {
    randomizeFactor?: Bounds;
  } & Bounds;

  randomizeFactor?: Bounds;
  quantum: TimeQuantum;
};
