import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { Channel, Guild, User } from 'discord.js';

import { GuildMember } from 'discord.js';

const buildModerationCommandTraceAdditionalInformations = (
  { commandName, channelId, guildId, guild, user }: GuildInteraction,
  targetMember: GuildMember | User
) =>
  ({
    users: {
      target: {
        username: targetMember instanceof GuildMember ? targetMember.user.username : targetMember.username,
        id: targetMember.id
      },

      caller: {
        username: user.username,
        id: user.id
      }
    },

    guild: {
      guildName: guild.name,
      channelId,
      guildId
    },

    commandName
  }) as const satisfies ModerationCommandTraceAdditionalInformations;

export default buildModerationCommandTraceAdditionalInformations;

type ModerationCommandTraceAdditionalInformations = {
  users: {
    target: {
      id: GuildMember['id'] | User['id'];
      username: User['username'];
    };

    caller: {
      id: GuildMember['id'] | User['id'];
      username: User['username'];
    };
  };

  guild: {
    guildName: Guild['name'];
    channelId: Channel['id'];
    guildId: Guild['id'];
  };

  commandName: GuildInteraction['commandName'];
};
