import type { LocalizedString } from 'typesafe-i18n';

import type { VocabValue, VocabKey } from './BotI18n';
import type { TypedLeafsJSONData } from './JSON';
import type { EmptyString } from './String';

const _: Hole = '';

export const SHARED_VOCAB_SCHEMA = {
  vocab: {
    memberSlashCommandOptionDescription: _,
    acceptedMaximumDurationStringLength: _,
    userSlashCommandOptionDescription: _,
    thisValueIsIncorrect: _,
    poweredByWatermark: _,
    reasonNotSpecified: _,
    failedToInteract: _,
    userNotInGuild: _,
    discordBotName: _,
    pleaseTryAgain: _,
    permission: _,
    moderator: _,
    duration: _,
    channel: _,
    discord: _,
    premium: _,
    confirm: _,
    vanity: _,
    member: _,
    reason: _,
    warned: _,
    config: _,
    cancel: _,
    stale: _,
    guild: _,
    greet: _,
    user: _,
    kick: _,
    role: _,
    warn: _,
    mute: _,
    ban: _
  } satisfies FlatVocabShape
} as const satisfies TypedLeafsJSONData<Hole>;

export default {
  slashCommands: {
    ban: {
      options: {
        'delete-messages': {
          description: _,
          name: _
        },

        duration: {
          description: _,
          name: _
        },

        reason: {
          description: _,
          name: _
        },

        user: {
          description: _,
          name: _
        }
      },

      description: _,
      name: _
    },

    mute: {
      options: {
        duration: {
          description: _,
          name: _
        },

        member: {
          description: _,
          name: _
        },

        reason: {
          description: _,
          name: _
        }
      },

      description: _,
      name: _
    },

    ping: {
      options: {
        'meaningless-choice': {
          choices: {
            lmao: _,
            lol: _
          } satisfies FlatVocabShape,

          description: _,
          name: _
        }
      },

      description: _,
      name: _
    },

    'config-vanity': {
      options: {
        vanity: {
          description: _,
          name: _
        },

        role: {
          description: _,
          name: _
        }
      },

      description: _,
      name: _
    },

    kick: {
      options: {
        member: {
          description: _,
          name: _
        },

        reason: {
          description: _,
          name: _
        }
      },

      description: _,
      name: _
    },

    warn: {
      options: {
        member: {
          description: _,
          name: _
        },

        reason: {
          description: _,
          name: _
        }
      },

      description: _,
      name: _
    },

    /* eslint-disable perfectionist/sort-objects */
    'greet-toggle': {
      options: {
        channel: {
          description: _,
          name: _
        }
      },

      description: _,
      name: _
    },

    'greet-infos': {
      description: _,
      options: {},
      name: _
    },

    config: {
      description: _,
      options: {},
      name: _
    },
    /* eslint-enable perfectionist/sort-objects */

    greet: {
      description: _,
      options: {},
      name: _
    },

    help: {
      description: _,
      options: {},
      name: _
    }
  } satisfies SlashCommands,

  errors: {
    muteCallback: {
      followUpFeedback: {
        misusages: {
          warnings: {
            yourMuteHasNotBeenApplied: _
          }
        },

        thisMemberIsAlreadyMuted: _,
        botIsMissingPermissions: _,
        youCantMuteThisMember: _,
        triedToMuteYourself: _,
        failedToInteract: _,
        triedToMuteBot: _
      }
    } satisfies FreeVocabShape,

    banCallback: {
      followUpFeedback: {
        misusages: {
          warnings: {
            yourBanHasNotBeenApplied: _
          }
        },

        botIsMissingPermissions: _,
        thisUserIsAlreadyBanned: _,
        youCantBanThisUser: _,
        triedToBanYourself: _,
        failedToInteract: _,
        triedToBanBot: _
      }
    } satisfies FreeVocabShape,

    warnCallback: {
      followUpFeedback: {
        botIsMissingPermissions: _,
        youCantWarnThisMember: _,
        triedToWarnYourself: _,
        failedToInteract: _,
        triedToWarnBot: _
      }
    } satisfies FreeVocabShape,

    kickCallback: {
      followUpFeedback: {
        botIsMissingPermissions: _,
        youCantKickThisMember: _,
        triedToKickYourself: _,
        failedToInteract: _,
        triedToKickBot: _
      }
    } satisfies FreeVocabShape,

    greetCallback: {
      followUpFeedback: {
        usedAllYourGreetCreditsEphemeralWithFreemiumPlan: _,
        usedAllYourGreetCreditsEphemeralWithPremiumPlan: _,
        botIsMissingPermissions: _
      }
    },

    vanityConfigCallback: {
      followUpFeedback: {
        botIsMissingPermissions: _,
        targetedRoleIsEveryone: _,
        youCantGiveThisRole: _
      }
    },

    attemptToGetOrCreateGuild: {
      bothFailedToRetrieveAnExistingGuildAndToCreateANewGuild: _
    } satisfies FreeVocabShape,

    commons: {
      youHaveMisusedAnOption: _,
      cantFetchGuildBans: _
    },

    guildSlashCommand: {
      botIsCurrentlyTimedOut: _
    }
  } satisfies FreeVocabShape,

  embeds: {
    helpCommand: {
      views: {
        moderation: {
          content: {
            commands: {
              /* eslint-disable perfectionist/sort-objects */
              warn: {
                description: _
              },

              mute: {
                description: _
              },

              kick: {
                description: _
              },

              ban: {
                description: _
              }
              /* eslint-enable perfectionist/sort-objects */
            } satisfies HelpEmbedModerationViewCommands,

            trailingTrivia: _
          },

          title: _
        },

        defaultView: {
          description: _,
          title: _
        }
      },

      selectMenuOptions: {
        defaultView: {
          description: _,
          label: _
        },

        moderation: {
          description: _,
          label: _
        }
      } satisfies HelpCommandEmbedSelectMenu,

      selectMenuPlaceholder: _
    },

    muteCommand: {
      mutesAmountOverLimit: _,
      reportAuthorLabel: _,
      mutesAmount: _,
      headline: _,
      until: _
    } satisfies FreeVocabShape,

    banCommand: {
      bansAmountOverLimit: _,
      reportAuthorLabel: _,
      bansAmount: _,
      headline: _,
      until: _
    } satisfies FreeVocabShape,

    kickCommand: {
      kicksAmountOverLimit: _,
      reportAuthorLabel: _,
      kicksAmount: _,
      headline: _
    } satisfies FreeVocabShape,

    warnCommand: {
      warnsAmountOverLimit: _,
      reportAuthorLabel: _,
      warnsAmount: _,
      headline: _
    } satisfies FreeVocabShape,

    'greet-info': {
      premiumRenewal: _,
      noGreetYet: _,
      premiumAd: _,
      title: _
    } satisfies FreeVocabShape,

    vanityConfigCommand: {
      dangerousPermsWarning: {
        description: _,
        title: _
      }
    },

    commons: {
      footerText: _
    }
  },

  tutorials: {
    usage: {
      durationOption: {
        examples: {
          banDeleteMessagesHistoryDurationLimit: {
            additionalInformations: _,
            gist: _
          },

          mute: {
            additionalInformations: _,
            gist: _
          },

          ban: {
            additionalInformations: _,
            gist: _
          }
        },

        informationEmbed: {
          title: _,
          with: _
        }
      } satisfies FreeVocabShape,

      vanityConfig: {
        examples: {
          needle: {
            additionalInformations: _,
            gist: _
          }
        },

        informationEmbed: {
          title: _,
          with: _
        }
      } satisfies FreeVocabShape
    },

    goodToKnowHeadline: _,
    examplesHeadline: _,
    helpTitle: _,
    usecase: _
  },

  permissions: {
    ManageGuildExpressions: _,
    CreateGuildExpressions: _,
    MentionEveryone: _,
    ManageNicknames: _,
    ModerateMembers: _,
    ManageChannels: _,
    ManageMessages: _,
    ManageWebhooks: _,
    Administrator: _,
    DeafenMembers: _,
    ManageThreads: _,
    ManageEvents: _,
    KickMembers: _,
    ManageGuild: _,
    MuteMembers: _,
    MoveMembers: _,
    ManageRoles: _,
    BanMembers: _
  },

  infos: {
    greetCallback: {
      followUpFeedback: {
        greetRemoved: _,
        greetAdded: _
      }
    },

    vanityConfigCallback: {
      followUpFeedback: {
        successfullyConfiguredVanity: _
      }
    }
  },

  etc: {
    notImplemented: {
      premiumCommandsAreCurrentlyNotSupportedInDm: _
    },

    fragments: {
      separatedWithDoubleColumns: _
    }
  } satisfies FreeVocabShape,

  initializers: {
    registeredCommandsOnline: _,
    resumingSlashCommands: _,
    mountedClient: _,
    loadedVocab: _,
    botIsReady: _
  } satisfies FlatVocabShape,

  guardsFeedbacks: {
    premiumOnlyCommand: _
  } satisfies FlatVocabShape,

  vocab: {
    ...SHARED_VOCAB_SCHEMA.vocab
  },

  pushNotifications: {
    greet: _
  },

  warnings: {
    title: _
  }
} as const satisfies TypedLeafsJSONData<Hole>;

type SlashCommandsOptions = Record<VocabKey, { choices?: FlatVocabShape; description: VocabValue; name: VocabValue }>;

type HelpCommandEmbedSelectMenu = Record<VocabKey, { description: VocabValue; label: VocabValue }>;

export type SlashCommands = Record<VocabKey, { options: SlashCommandsOptions; description: VocabValue; name: VocabValue }>;

type HelpEmbedModerationViewCommands = Record<VocabKey, { description: VocabValue }>;

type FreeVocabShape = Record<VocabKey, unknown>;
export type FlatVocabShape = Record<VocabKey, VocabValue>;

export type SlashCommand = SlashCommands[keyof SlashCommands];
export type SlashCommandOption = SlashCommandsOptions[keyof SlashCommandsOptions];

export type SlashCommandOptionChoicesObject = {
  [K in keyof Required<Pick<SlashCommandsOptions[keyof SlashCommandsOptions], 'choices'>>]: Record<string, () => LocalizedString>;
};

type Hole = EmptyString;
