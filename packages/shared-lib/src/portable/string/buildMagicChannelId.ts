import type { DiscordChannelIdMagic } from '@wpm-discord-bot/shared-types/String';
import type { Channel } from 'discord.js';

const buildMagicChannelId = (channelId: Channel['id']): DiscordChannelIdMagic => (!channelId ? '' : `<#${channelId as `${bigint}`}>`);

export default buildMagicChannelId;
