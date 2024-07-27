import type { MaybeNull, NotNull, Couple } from '@wpm-discord-bot/shared-types/Utils';
import type { GuildMember, Presence, Role } from 'discord.js';

import customInviteLinkUserInputToProperVanityCode from '#@/commands/config/helpers/vanity/utils/customInviteLinkUserInputToProperVanityCode';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import bentocache, { bentocacheKeysFactory } from '#@/config/bentocache';
import traceError from '#@/helpers/interactions/traceError';
import { getDiscordBotId } from '#@/client';
import { ActivityType } from 'discord.js';
import prisma from '#@/db/prisma';

const EXPECTED_VANITY_CODE_PREFIX = '.gg/';

function hasVanityInStatus(status: string, vanityCode: string, needleIsNotCaseSensitive: boolean): boolean {
  const tokenizeStatus = () =>
    (needleIsNotCaseSensitive ? status.toLowerCase() : status)
      .normalize('NFC')
      .replace(/[\s\u00A0\u2000-\u200A]+/g, ' ')
      .trim()
      .split(' ');

  const tokenizedStatus = tokenizeStatus();

  for (const token of tokenizedStatus) {
    if (!token.includes(EXPECTED_VANITY_CODE_PREFIX)) continue;
    const match = customInviteLinkUserInputToProperVanityCode(token);

    if (match === vanityCode) return true;
  }

  return false;
}

async function ejectVanityGifts(member: GuildMember, discordRoleId: Role['id']) {
  try {
    await member.roles.remove(discordRoleId);
  } catch (error) {
    traceError(error, { from: ejectVanityGifts.name });
  }
}

function getOldAndNewStatus(oldPresence: MaybeNull<Presence>, newPresence: Presence): Couple<MaybeNull<string>> {
  function getOldStatus(oldPresence2: NotNull<typeof oldPresence>) {
    for (const a of oldPresence2.activities) if (a.type === ActivityType.Custom) return a.state;
    return null;
  }

  function getNewStatus() {
    for (const a of newPresence.activities) if (a.type === ActivityType.Custom) return a.state;
    return null;
  }

  return [oldPresence === null ? null : getOldStatus(oldPresence), getNewStatus()];
}

async function guildPresenceUpdateCallback(oldPresence: MaybeNull<Presence>, newPresence: Presence) {
  const { userId, guild } = newPresence;
  if (guild === null) return;

  const [oldStatus, newStatus] = getOldAndNewStatus(oldPresence, newPresence);
  if (oldStatus !== null && newStatus !== null && oldStatus === newStatus) return;

  const { id: guildId } = guild;

  const discordBotId = await getDiscordBotId();

  const botMember = await lazilyFetchGuildMember(guild, discordBotId);
  if (botMember === null || !botMember.permissions.has('ManageRoles')) return;

  const member = newPresence.member ?? (await lazilyFetchGuildMember(guild, userId));

  if (member === null) return;

  try {
    var maybeDiscordRoleIdAndNeedle = await bentocache.getOrSet(
      bentocacheKeysFactory.vanityConfig(guildId),
      async () =>
        await prisma.vanityConfig.findUnique({
          select: { needleIsNotCaseSensitive: true, discordRoleId: true, needle: true },

          where: {
            discordGuildId: BigInt(guildId)
          }
        }),

      { gracePeriod: { enabled: false }, ttl: '6h' }
    );
  } catch (error) {
    traceError(error, { from: guildPresenceUpdateCallback.name });
    return;
  }

  if (maybeDiscordRoleIdAndNeedle === null) return;

  const { needleIsNotCaseSensitive, discordRoleId, needle } = maybeDiscordRoleIdAndNeedle;
  const discordRoleIdAsString = String(discordRoleId);

  if (newStatus === null) {
    await ejectVanityGifts(member, discordRoleIdAsString);
    return;
  }

  try {
    if (hasVanityInStatus(newStatus, needle, needleIsNotCaseSensitive)) {
      await member.roles.add(discordRoleIdAsString);
    } else {
      await ejectVanityGifts(member, discordRoleIdAsString);
    }
  } catch (error) {
    traceError(error, { from: guildPresenceUpdateCallback.name });
  }
}

export default guildPresenceUpdateCallback;
