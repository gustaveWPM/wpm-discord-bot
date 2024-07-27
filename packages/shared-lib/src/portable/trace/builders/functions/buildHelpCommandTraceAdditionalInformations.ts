import type { ChatInputCommandInteraction } from 'discord.js';

const buildHelpCommandTraceAdditionalInformations = ({ commandName, guildId, user }: ChatInputCommandInteraction) =>
  ({
    username: user.username,
    userId: user.id,
    commandName,
    guildId
  }) as const satisfies HelpCommandTraceAdditionalInformations;

export default buildHelpCommandTraceAdditionalInformations;

type HelpCommandTraceAdditionalInformations = {
  username: ChatInputCommandInteraction['user']['username'];
  userId: ChatInputCommandInteraction['user']['id'];
} & Pick<ChatInputCommandInteraction, 'commandName' | 'guildId'>;
