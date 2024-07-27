import type { PermissionResolvable, PartialGuildMember, GuildMember, Guild } from 'discord.js';

import attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms';
import attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers from '#@/jobs/helpers/tempBans/db/attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers';
import attemptToUpsertTimeoutOnBot from '#@/jobs/helpers/timeoutOnBot/db/attemptToUpsertTimeoutOnBot';
import attemptToDeleteTimeoutOnBot from '#@/jobs/helpers/timeoutOnBot/db/attemptToDeleteTimeoutOnBot';
import botIsTimedOut from '@wpm-discord-bot/shared-lib/discordjs/botIsTimedout';
import traceError from '#@/helpers/interactions/traceError';
import { getDiscordBotId } from '#@/client';
import pDebounce from 'p-debounce';

function hasBanPermissionChanged(oldBotMember: OldMember, newBotMember: NewMember): boolean {
  const p: PermissionResolvable = 'BanMembers';

  const oldBanPerm = oldBotMember.permissions.has(p);
  const newBanPerm = newBotMember.permissions.has(p);

  return oldBanPerm !== newBanPerm;
}

function hasTimeoutStatusChanged(oldBotMember: OldMember, newBotMember: NewMember): boolean {
  const oldTimeOutDateAsString = String(oldBotMember.communicationDisabledUntil);
  const newTimeOutDateAsString = String(newBotMember.communicationDisabledUntil);

  return oldTimeOutDateAsString !== newTimeOutDateAsString;
}

function handleBanPermissionChange(guild: Guild, newBotMember: NewMember) {
  const { id: guildId } = guild;

  if (newBotMember.permissions.has('BanMembers')) {
    attemptToMoveTempBannedMembersMissingPermsToTempBannedMembers(guild);
  } else {
    attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms(guildId);
  }
}

function handleTimeoutChange(guild: Guild, newBotMember: NewMember) {
  const { id: guildId } = guild;

  if (botIsTimedOut(newBotMember)) {
    attemptToMoveTempBannedMembersToTempBannedMembersMissingPerms(guildId);
    attemptToUpsertTimeoutOnBot(guildId, newBotMember.communicationDisabledUntil);

    return;
  }

  attemptToDeleteTimeoutOnBot(guildId);
  handleBanPermissionChange(guild, newBotMember);
}

function checkBotUpdate(oldBotMember: OldMember, newBotMember: NewMember) {
  const { guild } = newBotMember;

  if (hasBanPermissionChanged(oldBotMember, newBotMember)) handleBanPermissionChange(guild, newBotMember);
  if (hasTimeoutStatusChanged(oldBotMember, newBotMember)) handleTimeoutChange(guild, newBotMember);
}

async function botMemberUpdateCallback(oldMember: OldMember, newMember: NewMember) {
  // NOTE: try/catch here because the debounce may make it unsafe to execute
  try {
    const discordBotId = await getDiscordBotId();
    if (newMember.id === discordBotId) checkBotUpdate(oldMember, newMember);
  } catch (error) {
    traceError(error);
  }
}

// NOTE: lol DoS
const debouncedBotMemberUpdateCallback = pDebounce(botMemberUpdateCallback, 50);

async function guildMemberUpdateCallback(oldMember: OldMember, newMember: NewMember) {
  await debouncedBotMemberUpdateCallback(oldMember, newMember);
}

export default guildMemberUpdateCallback;

type OldMember = PartialGuildMember | GuildMember;
type NewMember = GuildMember;
