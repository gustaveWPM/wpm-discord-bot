import type { ChatInputCommandInteraction, Role } from 'discord.js';

const buildVanityConfigCommandTraceAdditionalInformations = ({ commandName, guildId, user }: ChatInputCommandInteraction, { id: roleId }: Role) =>
  ({
    username: user.username,
    userId: user.id,
    commandName,
    guildId,
    roleId
  }) as const satisfies VanityConfigCommandTraceAdditionalInformations;

export default buildVanityConfigCommandTraceAdditionalInformations;

type VanityConfigCommandTraceAdditionalInformations = {
  username: ChatInputCommandInteraction['user']['username'];
  userId: ChatInputCommandInteraction['user']['id'];
  roleId: Role['id'];
} & Pick<ChatInputCommandInteraction, 'commandName' | 'guildId'>;
