import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { PermissionLabel } from '@wpm-discord-bot/shared-types/SlashCommand';
import type { AttemptToResultCtx } from '@wpm-discord-bot/shared-types/Utils';
import type { User } from 'discord.js';

import { ECanModerateThisUser } from '@wpm-discord-bot/shared-specs/ECanModerateThisUser';

import { tryToComputeThatMemberHasHigherPermissions } from './tryToComputeThatMemberHasHigherPermissions';
import { tryToComputeThatBotHasHigherPermissions } from './tryToComputeThatBotHasHigherPermissions';
import { isTryingToModerateTheBot, isTryingToSelfModerate } from './moderationBasicMisusages';
import lazilyFetchGuildMember from './lazilyFetchGuildMember';

async function canModerateThisMember(
  interaction: GuildInteraction,
  targetMemberId: User['id'],
  perms: {
    requiredUserPermissions: readonly PermissionLabel[];
    requiredBotPermissions: readonly PermissionLabel[];
  },
  options: Options = {}
): Promise<{ resStatus: ECanModerateThisUser } & AttemptToResultCtx> {
  const { guild, user } = interaction;
  const { id: maybeModeratorId } = user;

  if (isTryingToModerateTheBot(interaction, targetMemberId)) return { resStatus: ECanModerateThisUser.TryingToModerateTheBot };

  if (isTryingToSelfModerate(maybeModeratorId, targetMemberId)) return { resStatus: ECanModerateThisUser.TryingToSelfModerate };

  const maybeTargetUser = await lazilyFetchGuildMember(guild, targetMemberId);

  if (!options.skipUserNotInGuild && maybeTargetUser === null) {
    return { resStatus: ECanModerateThisUser.UserNotInGuild };
  }

  try {
    const botIsAuthorizedToPerformThisAction = await tryToComputeThatBotHasHigherPermissions(
      interaction,
      targetMemberId,
      perms.requiredBotPermissions
    );

    if (!botIsAuthorizedToPerformThisAction) {
      return { resStatus: ECanModerateThisUser.BotHasNotThePermissionsToModerateTargetMember };
    }
  } catch (error) {
    return { resStatus: ECanModerateThisUser.FailedToInteract, failureCtx: error };
  }

  try {
    const memberIsAuthorizedToPerformThisAction = await tryToComputeThatMemberHasHigherPermissions(
      interaction,
      targetMemberId,
      perms.requiredUserPermissions
    );

    if (!memberIsAuthorizedToPerformThisAction) {
      return { resStatus: ECanModerateThisUser.CallerMemberHasNotThePermissionsToModerateTargetMember };
    }

    return { resStatus: ECanModerateThisUser.OK };
  } catch (error) {
    return { resStatus: ECanModerateThisUser.FailedToInteract, failureCtx: error };
  }
}

export default canModerateThisMember;

type Options = Partial<{ skipUserNotInGuild: boolean }>;
