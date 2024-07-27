import type { ChatInputCommandInteraction, User } from 'discord.js';

export const isTryingToModerateTheBot = ({ client }: ChatInputCommandInteraction, targetMemberId: User['id']) => targetMemberId === client.user.id;

export const isTryingToSelfModerate = (callerMemberId: User['id'], targetMemberId: User['id']) => callerMemberId === targetMemberId;
