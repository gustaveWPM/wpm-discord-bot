import type { allCommands } from '#@/commands/all';

const _ = null;

// NOTE: Just to get accurate type errors (Record keys are forced to be unique)
// * ... Also using it for O(1) access to have a faster cold boot
export const devGuildOnlyCommandsRecord = {
  ping: _
} as const satisfies Partial<Record<keyof typeof allCommands, typeof _>>;
