import type { AttemptToReplyToInteractionResultCtx } from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import type { ChatInputCommandInteraction, GuildMember, Guild } from 'discord.js';

import type { SlashCommandPermissions } from './SlashCommand';
import type { NotNull } from './Utils';

export type GuildInteraction = { guildId: Guild['id']; guild: Guild } & ChatInputCommandInteraction;

export type GuildInteractionInChannel = {
  channel: NotNull<GuildInteraction['channel']>;
} & GuildInteraction;

export type HasPassedAllGuards = boolean;
export type GuardsPermissions = Pick<SlashCommandPermissions, 'isPremium'>;

export type FailedToInteractModerationCommandEphemeralFn = (params: {
  targetMemberId: GuildMember['id'];
  interaction: GuildInteraction;
  guildName: Guild['name'];
}) => Promise<AttemptToReplyToInteractionResultCtx>;
