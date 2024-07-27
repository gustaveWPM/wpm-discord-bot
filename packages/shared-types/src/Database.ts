import type { TempBannedMembers as PrismaTempBannedMembers, DefBannedMembers as PrismaDefBannedMembers, Guild } from '@prisma/client';

const phantomTypeReservedKey = '__MY_PHANTOM_TYPE__';

export type DefBannedMembers = { [phantomTypeReservedKey]: 'DefBannedMembers' } & PrismaDefBannedMembers;
export type TempBannedMembers = { [phantomTypeReservedKey]: 'TempBannedMembers' } & PrismaTempBannedMembers;

export type GuildWithIsNewTag = {
  isNew: boolean;
  guild: Guild;
};
