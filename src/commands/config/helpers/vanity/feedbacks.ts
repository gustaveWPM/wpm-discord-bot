import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { Role } from 'discord.js';

import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import buildMagicRoleId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicRoleId';
import { attemptToGetLanguageGuildSideOrDmSide } from '#𝕃/getLanguagePipelines';
import { vocabAccessor } from '#𝕃/vocabAccessor';

import { getVanityConfigInteractionOptions } from './getInteractionOptions';

export const attemptToSendSuccessfullyConfiguredVanityEphemeral = async (
  interaction: GuildInteraction,
  normalizedVanity: string,
  targetedRole: Role
) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).infos.vanityConfigCallback.followUpFeedback.successfullyConfiguredVanity({
      roleIdMagicString: buildMagicRoleId(targetedRole.id),
      vanityCode: normalizedVanity
    }),

    ephemeral: true
  });

export const attemptToSendTargetedRoleIsEveryoneEphemeral = async (interaction: GuildInteraction) =>
  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).errors.vanityConfigCallback.followUpFeedback.targetedRoleIsEveryone({
      everyoneRoleIdMagicString: buildMagicRoleId(interaction.guildId)
    }),

    ephemeral: true
  });

export async function attemptToSendBotNotAuthorizedToGiveThisRoleEphemeral(interaction: GuildInteraction) {
  const [, role] = await getVanityConfigInteractionOptions(interaction);

  if (role === null) return;

  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).errors.vanityConfigCallback.followUpFeedback.botIsMissingPermissions({
      roleIdMagicString: buildMagicRoleId(role.id)
    }),

    ephemeral: true
  });
}

export async function attemptToSendYouCantGiveThisRoleEphemeral(interaction: GuildInteraction) {
  const [, role] = await getVanityConfigInteractionOptions(interaction);

  if (role === null) return;

  attemptToReplyToInteraction(interaction, {
    content: vocabAccessor(
      await attemptToGetLanguageGuildSideOrDmSide({
        guildId: interaction.guildId,
        userId: interaction.user.id
      })
    ).errors.vanityConfigCallback.followUpFeedback.youCantGiveThisRole({
      roleIdMagicString: buildMagicRoleId(role.id)
    }),

    ephemeral: true
  });
}
