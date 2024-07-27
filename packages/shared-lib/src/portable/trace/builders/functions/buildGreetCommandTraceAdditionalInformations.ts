import type { SlashCommandSubcommand } from '@wpm-discord-bot/shared-types/String';
import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { GuildMember, Channel, Guild, User } from 'discord.js';

const buildGreetCommandTraceAdditionalInformations = (
  { commandName, channelId, guildId, guild, user }: GuildInteraction,
  subcommand: SlashCommandSubcommand
) =>
  ({
    guild: {
      guildName: guild.name,
      channelId,
      guildId
    },

    caller: {
      username: user.username,
      id: user.id
    },

    commandName,
    subcommand
  }) as const satisfies GreetCommandTraceAdditionalInformations;

export default buildGreetCommandTraceAdditionalInformations;

type GreetCommandTraceAdditionalInformations = {
  guild: {
    guildName: Guild['name'];
    channelId: Channel['id'];
    guildId: Guild['id'];
  };

  caller: {
    id: GuildMember['id'] | User['id'];
    username: User['username'];
  };

  commandName: GuildInteraction['commandName'];
  subcommand: SlashCommandSubcommand;
};
