const p = 'Collector received no interactions before ending with reason';

const isTimeoutInterruptionOfInteractionCollectorExpectedBehavior = (interruption: any) =>
  typeof interruption === 'object' &&
  'code' in interruption &&
  interruption.code === 'InteractionCollectorError' &&
  'message' in interruption &&
  (interruption.message === `${p}: time` ||
    interruption.message === `${p}: messageDelete` ||
    interruption.message === `${p}: channelDelete` ||
    interruption.message === `${p}: guildDelete`);

export default isTimeoutInterruptionOfInteractionCollectorExpectedBehavior;
