export type DiscordCountdownMagic = `<t:${number}:R>`;
export type DiscordUserIdMagic = `<@${bigint}>` | EmptyString;
export type DiscordRoleIdMagic = `<@&${bigint}>` | EmptyString;
export type DiscordChannelIdMagic = `<#${bigint}>` | EmptyString;
export type ModerationReason = string;
export type TimeString = string;
export type IncorrectTimeString = string;

export type ErrorsDetectionFeedback = string;
export type EmptyErrorsDetectionFeedback = EmptyString;
export type MaybeEmptyErrorsDetectionFeedback = EmptyErrorsDetectionFeedback | ErrorsDetectionFeedback;

export type SlashCommandName = string;
export type SlashCommandOptionName = string;
export type SlashCommandOptionDescription = string;
export type SlashCommandSubcommand = string;

export type DateString = string;

export type Filepath = string;
export type StringifiedReport = string;

export type CustomInviteLinkCode = string;
export type CustomInviteLinkUserInput = string;
export type Char = string;
export type EmptyString = '';
