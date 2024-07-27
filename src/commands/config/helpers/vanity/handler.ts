import type { CustomInviteLinkUserInput, CustomInviteLinkCode } from '@wpm-discord-bot/shared-types/String';
import type { DangerousPermission } from '@wpm-discord-bot/shared-types/Permissions';
import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { MsValue } from '@wpm-discord-bot/shared-types/Number';
import type { ComponentType, GuildMember, Role } from 'discord.js';

import buildVanityConfigCommandTraceAdditionalInformations from '@wpm-discord-bot/shared-lib/portable/trace/builders/functions/buildVanityConfigCommandTraceAdditionalInformations';
import isTimeoutInterruptionOfInteractionCollectorExpectedBehavior from '@wpm-discord-bot/shared-lib/discordjs/isTimeoutInterruptionOfInteractionCollectorExpectedBehavior';
import tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy from '#@/db/dsl/jit/tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy';
import attemptToDeleteInteractionReply from '@wpm-discord-bot/shared-lib/discordjs/attemptToDeleteInteractionReply';
import attemptToReplyToInteraction from '@wpm-discord-bot/shared-lib/discordjs/attemptToReplyToInteraction';
import attemptToGetGuildVanityCode from '@wpm-discord-bot/shared-lib/discordjs/attemptToGetGuildVanityCode';
import BOT_APP_HARD_CODED_STATIC_CONTEXT from '@wpm-discord-bot/shared-specs/BotAppHardCodedStaticContext';
import lazilyFetchGuildMember from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildMember';
import buildMagicRoleId from '@wpm-discord-bot/shared-lib/portable/string/buildMagicRoleId';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';
import vanityConfigHelpEmbed from '#@/components/static/help/vanityConfigHelpEmbed';
import { attemptToGetLanguageDmSideOrGuildSide } from '#𝕃/getLanguagePipelines';
import { DANGEROUS_PERMISSIONS } from '@wpm-discord-bot/shared-specs/Discord';
import bentocache, { bentocacheKeysFactory } from '#@/config/bentocache';
import traceError from '#@/helpers/interactions/traceError';
import { vocabAccessor } from '#𝕃/vocabAccessor';
import capitalize from '#@/lib/str/capitalize';
import prisma from '#@/db/prisma';

import customInviteLinkUserInputToProperVanityCode from './utils/customInviteLinkUserInputToProperVanityCode';
import { vanityConfigUnhappyPathsMatchingEffects } from './errors/vanityConfigUnhappyPathsMatchingEffects';
import isAuthorizedToPointToThisRole from './validators/isAuthorizedToPointToThisRole';
import { attemptToSendSuccessfullyConfiguredVanityEphemeral } from './feedbacks';
import { getVanityConfigInteractionOptions } from './getInteractionOptions';
import { EVanityConfigMisusages } from './enums';

const TIMEOUT: MsValue = 6e5;

const BUTTON_ACTION_ID_PREFIX = 'vanity-config-warning-role-with-dangerous-perms';
const [BUTTON_ACTION_CONFIRM_ID, BUTTON_ACTION_CANCEL_ID] = [`${BUTTON_ACTION_ID_PREFIX}-confirm`, `${BUTTON_ACTION_ID_PREFIX}-cancel`] as const;

const vanityConfigTable = prisma.vanityConfig;

async function rejectInvalidInput({
  customInviteLinkUserInput,
  interaction
}: {
  customInviteLinkUserInput: CustomInviteLinkUserInput;
  interaction: GuildInteraction;
}) {
  const { commandName, guildId, user } = interaction;
  const { id: callerMemberId } = user;

  const locale = await attemptToGetLanguageDmSideOrGuildSide({
    userId: callerMemberId,
    guildId
  });

  const embed = vanityConfigHelpEmbed({
    option: vocabAccessor(locale).slashCommands['config-vanity'].options.vanity.name(),
    customInviteLinkUserInput,
    commandName,
    locale
  });

  attemptToReplyToInteraction(interaction, { embeds: [embed], ephemeral: true });
}

async function apply({
  targetedRole,
  parsedVanity,
  interaction,
  botMember
}: {
  parsedVanity: CustomInviteLinkCode;
  interaction: GuildInteraction;
  botMember: GuildMember;
  targetedRole: Role;
}) {
  const { guild } = interaction;
  const { id: guildId } = guild;

  const vanityCode = await attemptToGetGuildVanityCode(guild, botMember);
  const lowerCasedParsedVanity = parsedVanity.toLowerCase();
  const isGuildVanity = lowerCasedParsedVanity === vanityCode;
  const normalizedVanity = isGuildVanity ? lowerCasedParsedVanity : parsedVanity;

  const guildIdAsBigInt = BigInt(guildId);
  const targetedRoleIdAsBigInt = BigInt(targetedRole.id);

  await tryToRequestBasedOnGuildIdForeignKeyWithGuildJITProxy({
    cb: async () => {
      const existingVanityConfig = await vanityConfigTable.findUnique({
        where: {
          discordGuildId: guildIdAsBigInt
        },

        select: { id: true }
      });

      if (existingVanityConfig === null) {
        await vanityConfigTable.create({
          data: {
            discordGuild: {
              connect: { discordGuildId: guildIdAsBigInt }
            },

            needleIsNotCaseSensitive: isGuildVanity,
            discordRoleId: targetedRoleIdAsBigInt,
            needle: normalizedVanity
          }
        });

        return;
      }

      await vanityConfigTable.update({
        data: {
          needleIsNotCaseSensitive: isGuildVanity,
          discordRoleId: targetedRoleIdAsBigInt,
          needle: normalizedVanity
        },

        where: {
          id: existingVanityConfig.id
        }
      });
    },

    guildId
  });

  await bentocache.delete(bentocacheKeysFactory.vanityConfig(guildId));

  attemptToSendSuccessfullyConfiguredVanityEphemeral(interaction, normalizedVanity, targetedRole);
}

async function getWarningEmbed(interaction: GuildInteraction, targetedRole: Role, dangerousPerms: DangerousPermission[]) {
  const { EMOJIS } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART;
  const { INFORMATION_SOURCE_LOGO_URL, FOOTER_LOGO_URL, TITLE_LOGO_URL, PRIMARY_COLOR } = BOT_APP_HARD_CODED_STATIC_CONTEXT.VISUAL_CHART.EMBEDS;
  const { DISCORD_SERVER_INVITE_LINK } = BOT_APP_HARD_CODED_STATIC_CONTEXT.COMMUNITY;

  const { guildId, user } = interaction;
  const { id: callerMemberId } = user;

  const locale = await attemptToGetLanguageDmSideOrGuildSide({ userId: callerMemberId, guildId });

  const confirm = new ButtonBuilder()
    .setCustomId(BUTTON_ACTION_CONFIRM_ID)
    .setLabel(capitalize(vocabAccessor(locale).vocab.confirm()))
    .setStyle(ButtonStyle.Danger);

  const cancel = new ButtonBuilder()
    .setCustomId(BUTTON_ACTION_CANCEL_ID)
    .setLabel(capitalize(vocabAccessor(locale).vocab.cancel()))
    .setStyle(ButtonStyle.Secondary);

  const warningEmbed = new EmbedBuilder()
    .setColor(PRIMARY_COLOR)
    .setTitle([EMOJIS.WARNING, vocabAccessor(locale).embeds.vanityConfigCommand.dangerousPermsWarning.title()].join(' '))
    .setAuthor({
      name: vocabAccessor(locale).warnings.title(),
      url: DISCORD_SERVER_INVITE_LINK,
      iconURL: TITLE_LOGO_URL
    })
    .setDescription(
      vocabAccessor(locale).embeds.vanityConfigCommand.dangerousPermsWarning.description({
        roleIdMagicString: buildMagicRoleId(targetedRole.id)
      }) + dangerousPerms.map((p) => '\n- ' + vocabAccessor(locale).permissions[p]()).join(',')
    )
    .setThumbnail(INFORMATION_SOURCE_LOGO_URL)
    .setFooter({
      text: vocabAccessor(locale).embeds.commons.footerText(),
      iconURL: FOOTER_LOGO_URL
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm);

  return await interaction.reply({ embeds: [warningEmbed], components: [row], ephemeral: true });
}

async function targetedRoleDoubleCheck(targetedRole: Role, interaction: GuildInteraction): Promise<false | 'OK'> {
  const LEFT: Awaited<ReturnType<typeof targetedRoleDoubleCheck>> = false as const;
  const RIGHT: Exclude<Awaited<ReturnType<typeof targetedRoleDoubleCheck>>, typeof LEFT> = 'OK';

  const dangerousPerms: DangerousPermission[] = [];

  for (const dangerousPerm of DANGEROUS_PERMISSIONS) {
    if (targetedRole.permissions.has(dangerousPerm)) dangerousPerms.push(dangerousPerm);
  }

  if (dangerousPerms.length === 0) return RIGHT;

  try {
    try {
      var warningEmbedInteractionResponse = await getWarningEmbed(interaction, targetedRole, dangerousPerms);
    } catch (error) {
      traceError(error, buildVanityConfigCommandTraceAdditionalInformations(interaction, targetedRole));
      return LEFT;
    }

    const buttonInteraction = await warningEmbedInteractionResponse.awaitMessageComponent<ComponentType.Button>({ time: TIMEOUT });

    const buttonCustomId = buttonInteraction.customId;
    attemptToDeleteInteractionReply(interaction);
    return buttonCustomId !== BUTTON_ACTION_CONFIRM_ID ? LEFT : RIGHT;
  } catch (interruption) {
    if (!isTimeoutInterruptionOfInteractionCollectorExpectedBehavior(interruption)) {
      traceError(interruption, buildVanityConfigCommandTraceAdditionalInformations(interaction, targetedRole));
    }
    // {ToDo} v1.1.0 [HYDRATION FEATURE] -> Remove this component from hydration persistance.
    attemptToDeleteInteractionReply(interaction);
    return LEFT;
  }
}

export async function vanityHandler(interaction: GuildInteraction) {
  const { guildId, client, guild, user } = interaction;
  const { id: callerMemberId } = user;

  const [customInviteLinkUserInput, targetedRole] = await getVanityConfigInteractionOptions(interaction);

  const discordBotId = client.user.id;
  const botMember = await lazilyFetchGuildMember(guild, discordBotId);
  const callerMember = await lazilyFetchGuildMember(guild, callerMemberId);

  if (targetedRole === null || botMember === null || callerMember === null) {
    vanityConfigUnhappyPathsMatchingEffects[EVanityConfigMisusages.UnknownError](interaction);
    return;
  }

  const authorizedToPointToThisRole = isAuthorizedToPointToThisRole({
    targetedRole,
    callerMember,
    botMember,
    guildId,
    guild
  });

  if (authorizedToPointToThisRole !== EVanityConfigMisusages.OK) {
    vanityConfigUnhappyPathsMatchingEffects[authorizedToPointToThisRole](interaction);
    return;
  }

  const parsedVanity = customInviteLinkUserInputToProperVanityCode(customInviteLinkUserInput);

  if (parsedVanity === null) {
    await rejectInvalidInput({
      customInviteLinkUserInput,
      interaction
    });

    return;
  }

  const shouldApply = await targetedRoleDoubleCheck(targetedRole, interaction);

  if (shouldApply !== 'OK') return;

  await apply({
    parsedVanity,
    targetedRole,
    interaction,
    botMember
  });
}
