import type { SlashCommandI18nDictIdentifierAndOptionKeyPair } from '@wpm-discord-bot/shared-types/BotI18n';
import type { CustomInviteLinkUserInput } from '@wpm-discord-bot/shared-types/String';
import type { GuildInteraction } from '@wpm-discord-bot/shared-types/Interaction';
import type { MaybeNull } from '@wpm-discord-bot/shared-types/Utils';

import lazilyFetchGuildRole from '@wpm-discord-bot/shared-lib/discordjs/lazilyFetchGuildRole';
import bentocache, { bentocacheKeysFactory } from '#@/config/bentocache';
import { Role } from 'discord.js';

import { configVanityRequiredOptionsConfig, vanitySubcommandId as id } from '../../config';

export async function getVanityConfigInteractionOptions(interaction: GuildInteraction): Promise<[CustomInviteLinkUserInput, MaybeNull<Role>]> {
  const { id: interactionId, options, guild } = interaction;

  const [typesafeRoleOptionKeyAssoc, typesafeVanityOptionKeyAssoc] = [
    { optionKey: 'role', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair,
    { optionKey: 'vanity', id } satisfies SlashCommandI18nDictIdentifierAndOptionKeyPair
  ] as const;

  const [{ optionKey: roleOptionKey }, { optionKey: vanityOptionKey }] = [typesafeRoleOptionKeyAssoc, typesafeVanityOptionKeyAssoc];

  const [customInviteLinkUserInput, role] = [
    options.getString(vanityOptionKey, configVanityRequiredOptionsConfig[vanityOptionKey]),
    options.getRole(roleOptionKey, configVanityRequiredOptionsConfig[roleOptionKey])
  ];

  if (role instanceof Role) {
    return [customInviteLinkUserInput, role] as const;
  } else {
    const role2 = await bentocache.getOrSet(
      bentocacheKeysFactory.vanityConfigInteractionAssociatedRole(interactionId),
      async () => await lazilyFetchGuildRole(guild, role.id),
      { gracePeriod: { enabled: false }, ttl: '15s' }
    );

    return [customInviteLinkUserInput, role2] as const;
  }
}
