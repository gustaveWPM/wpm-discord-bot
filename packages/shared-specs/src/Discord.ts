import type { PermissionLabel } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { ErrorCode, Limit } from '@wpm-discord-bot/shared-types/Number';
import type { User } from 'discord.js';

import { readonlyUniqueArray } from '@wpm-discord-bot/shared-lib/portable/array/unique';
import { ChannelType } from 'discord.js';

// NOTE: https://discord.com/developers/docs/topics/opcodes-and-status-codes
export const UNKNOWN_BAN = 10026 as const satisfies ErrorCode;
export const MISSING_PERMISSIONS = 50013 as const satisfies ErrorCode;
export const UNKNOWN_GUILD = 10004 as const satisfies ErrorCode;
export const MISSING_ACCESS = 50001 as const satisfies ErrorCode;
export const INTERACTION_HAS_ALREADY_BEEN_ACKNOWLEDGED = 40060 as const satisfies ErrorCode;

const __guildsChannelsWithTextChat = [
  ChannelType.GuildAnnouncement,
  ChannelType.GuildForum,
  ChannelType.GuildVoice,
  ChannelType.GuildStageVoice,
  ChannelType.GuildText
] as const;

const __channelsWithTextChat = [
  ...__guildsChannelsWithTextChat,
  ChannelType.DM,
  ChannelType.GroupDM,
  ChannelType.AnnouncementThread,
  ChannelType.PublicThread,
  ChannelType.PrivateThread
] as const;

const __dangerousPerms = [
  'Administrator',
  'ManageGuild',
  'ManageRoles',
  'BanMembers',
  'ManageChannels',
  'ManageMessages',
  'ManageEvents',
  'ManageThreads',
  'CreateGuildExpressions',
  'ManageGuildExpressions',
  'MentionEveryone',
  'ManageWebhooks',
  'ModerateMembers',
  'KickMembers',
  'MuteMembers',
  'DeafenMembers',
  'MoveMembers',
  'ManageNicknames'
] as const satisfies PermissionLabel[];

export const GUILD_CHANNELS_WITH_TEXT_CHAT = readonlyUniqueArray(__guildsChannelsWithTextChat);

export const CHANNELS_WITH_TEXT_CHAT = readonlyUniqueArray(__channelsWithTextChat);

export const DANGEROUS_PERMISSIONS = readonlyUniqueArray(__dangerousPerms);

export const NO_USER_ID = '-1' as const satisfies User['id'];

export const CUSTOM_INVITE_LINK_MAX_LEN = 25 as const satisfies Limit;
