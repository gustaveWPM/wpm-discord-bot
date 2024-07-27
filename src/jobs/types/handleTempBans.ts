import type { TempBannedMembers } from '@prisma/client';
import type { Guild } from 'discord.js';

export type PartitionnedTempBans = Record<Guild['id'], TempBannedMembers[]>;
export type BansSlice = PartitionnedTempBans[keyof PartitionnedTempBans];
