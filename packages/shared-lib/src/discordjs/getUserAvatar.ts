import type { ImageURLOptions, GuildMember, User } from 'discord.js';

const getUserAvatar = (user: GuildMember | User, options?: ImageURLOptions) => user.avatarURL(options) ?? user.displayAvatarURL(options);

export default getUserAvatar;
