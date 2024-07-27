import type { MsValue } from '@wpm-discord-bot/shared-types/Number';

const wait = (ms: MsValue): Promise<void> => new Promise((resolve) => setTimeout(resolve, Math.abs(ms)));

export default wait;
