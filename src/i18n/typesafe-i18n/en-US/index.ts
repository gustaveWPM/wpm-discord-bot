import type { SharedVocabType, VocabType } from '@wpm-discord-bot/shared-types/BotI18n';

import type { BaseTranslation } from '../i18n-types';

// NOTE: Use relative import paths to avoid breaking codegen.
import capitalize from '../../../lib/str/capitalize';

const _discordBotName = 'WPM Bot';
const _duration = 'duration';
const _member = 'member';
const _user = 'user';
const _reason = 'reason';
const _warn = 'warn';
const _guild = 'guild';
const _discord = 'Discord';
const _pleaseTryAgain = 'please, try again';

const EN_TERMINOLOGY = {
  timeout: 'timeout',
  banned: 'banned'
};

const SHARED = {
  // acceptedMaximumDurationStringLength: Refer to BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.LIMITS
  vocab: {
    acceptedMaximumDurationStringLength: `The maximum length of the ${_duration} option text we accept is: 30 characters.`,
    memberSlashCommandOptionDescription: `${_discord} ID or ping of the ${_member}`,
    userSlashCommandOptionDescription: `${_discord} ID or ping of the ${_user}`,
    failedToInteract: `I've failed. ${capitalize(_pleaseTryAgain)}.`,
    userNotInGuild: `This ${_user} is not in the ${_guild}.`,
    poweredByWatermark: `Powered by ${_discordBotName}`,
    thisValueIsIncorrect: 'This value is incorrect!',
    reasonNotSpecified: `no ${_reason} provided`, // ISO Discord
    pleaseTryAgain: _pleaseTryAgain,
    discordBotName: _discordBotName,
    permission: 'permission',
    moderator: 'moderator',
    warned: `${_warn}ed`,
    duration: _duration,
    confirm: 'confirm',
    channel: 'channel',
    premium: 'premium',
    discord: _discord,
    cancel: 'cancel',
    vanity: 'vanity',
    config: 'config',
    reason: _reason,
    member: _member,
    greet: 'greet',
    stale: 'stale',
    guild: _guild,
    mute: 'mute',
    role: 'role',
    kick: 'kick',
    user: _user,
    warn: _warn,
    ban: 'ban'
  }
} as const satisfies SharedVocabType;

const {
  acceptedMaximumDurationStringLength,
  memberSlashCommandOptionDescription,
  userSlashCommandOptionDescription,
  poweredByWatermark,
  discord: Discord,
  discordBotName,
  pleaseTryAgain,
  permission,
  moderator,
  duration,
  premium,
  channel,
  vanity,
  config,
  member,
  reason,
  warned,
  guild,
  greet,
  user,
  kick,
  role,
  mute,
  warn,
  ban
} = SHARED.vocab;

const { timeout, banned } = EN_TERMINOLOGY;

const enUS = {
  errors: {
    muteCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `I don't have the ${permission}s to ${mute} {memberIdMagicString} (${member} of: {guildName}). Try to move my ${role} up in the ${role}s list of your ${guild}.\nhttps://support.discord.com/hc/en-us/articles/214836687-Role-Management-101\nAlso, double check that I have the ${permission} to ${timeout} ${member}s on your ${Discord} ${guild}.`,

        misusages: {
          warnings: {
            yourMuteHasNotBeenApplied: `Your ${mute} hasn't been applied to the ${member} {memberIdMagicString} — {guildName}!`
          }
        },

        failedToInteract: `I've failed to ${mute} {memberIdMagicString} (${member} of: {guildName}). ${capitalize(pleaseTryAgain)}.`,
        thisMemberIsAlreadyMuted: `{memberIdMagicString} is already ${mute}d (${member} of: {guildName}).`,
        triedToMuteBot: `So cute! You tried to ${mute} me?\nNoped out your command.\n{youtubeMemeLink}`,
        youCantMuteThisMember: `You can't ${mute} {memberIdMagicString} (${member} of: {guildName}).`,
        triedToMuteYourself: `You tried to ${mute} yourself! You're a bit too chatty at the moment?`
      }
    },

    banCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `I don't have the ${permission}s to ${ban} {userIdMagicString} ({guildName}). Try to move my ${role} up in the ${role}s list of your ${guild}.\nhttps://support.discord.com/hc/en-us/articles/214836687-Role-Management-101\nAlso, double check that I have the ${permission} to ${ban} ${user}s on your ${Discord} ${guild}.`,

        misusages: {
          warnings: {
            yourBanHasNotBeenApplied: `Your ${ban} hasn't been applied to the ${user} {userIdMagicString} — {guildName}!`
          }
        },

        failedToInteract: `I've failed to ${ban} {userIdMagicString} ({guildName}). ${capitalize(pleaseTryAgain)}.`,
        thisUserIsAlreadyBanned: `The ${user} {userIdMagicString} is already ${banned} ({guildName}).`,
        triedToBanBot: `How dare you?!\nNoped out your command.\n{youtubeMemeLink}`,
        triedToBanYourself: `You tried to ${ban} yourself! Wanna hug?`,
        youCantBanThisUser: `You can't ${ban} this ${user}.`
      }
    },

    kickCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `I don't have the ${permission}s to ${kick} {memberIdMagicString} (${member} of: {guildName}). Try to move my ${role} up in the ${role}s list of your ${guild}.\nhttps://support.discord.com/hc/en-us/articles/214836687-Role-Management-101\nAlso, double check that I have the ${permission} to ${kick} ${member}s on your ${Discord} ${guild}.`,
        failedToInteract: `I've failed to ${kick} {memberIdMagicString} (${member} of: {guildName}). ${capitalize(pleaseTryAgain)}.`,
        triedToKickBot: `Awwww… You tried to ${kick} me?\nNoped out your command.\n{youtubeMemeLink}`,
        triedToKickYourself: `You tried to ${kick} yourself! Feeling sad today?`,
        youCantKickThisMember: `You can't ${kick} this ${member}.`
      }
    },

    warnCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `I don't have the ${permission}s to ${warn} {memberIdMagicString} (${member} of: {guildName}). Try to move my ${role} up in the ${role}s list of your ${guild}.\nhttps://support.discord.com/hc/en-us/articles/214836687-Role-Management-101`,
        failedToInteract: `I've failed to ${warn} {memberIdMagicString} (${member} of: {guildName}). ${capitalize(pleaseTryAgain)}.`,
        triedToWarnBot: `You evil! You really thought I will let you ${warn} me?\nNoped out your command.\n{youtubeMemeLink}`,
        triedToWarnYourself: `You tried to ${warn} yourself! Are you feeling cheeky today?`,
        youCantWarnThisMember: `You can't ${warn} this ${member}.`
      }
    },

    greetCallback: {
      followUpFeedback: {
        usedAllYourGreetCreditsEphemeralWithFreemiumPlan: `You have reached the limit of configurable ${greet}s for your ${guild}. Upgrade to ${premium} to create up to {premiumMaxGreetsAmount} ${greet}s.`,
        usedAllYourGreetCreditsEphemeralWithPremiumPlan: `You already have configured {premiumMaxGreetsAmount} ${greet}s for your ${guild}. Please, delete one of them before creating a new one.`,
        botIsMissingPermissions: `I don't have the ${permission} to post in this ${channel}! ({channelIdMagicString})`
      }
    },

    vanityConfigCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `I don't have the ${permission}s to give the ${role} {roleIdMagicString}. Try to move my ${role} up in the ${role}s list of your ${guild}.\nhttps://support.discord.com/hc/fr/articles/214836687-Gestion-des-r%C3%B4les-101`,
        targetedRoleIsEveryone: `The targeted ${role} is {everyoneRoleIdMagicString}! Using this ${role} here is not allowed.`,
        youCantGiveThisRole: `You don't have the ${permission}s to give the ${role} {roleIdMagicString}.`
      }
    },

    attemptToGetOrCreateGuild: {
      bothFailedToRetrieveAnExistingGuildAndToCreateANewGuild: `Both failed to retrieve an existing ${guild} and to create a new ${guild}!`
    },

    commons: {
      cantFetchGuildBans: `{funName}: can't fetch the ${ban}s of the ${guild}.`,
      youHaveMisusedAnOption: 'You misused an option!'
    },

    guildSlashCommand: {
      botIsCurrentlyTimedOut: `I'm currently ${mute}d in this ${guild}. All my commands are disabled here.`
    }
  },

  embeds: {
    helpCommand: {
      views: {
        moderation: {
          content: {
            commands: {
              /* eslint-disable perfectionist/sort-objects */
              [warn]: {
                description: `${capitalize(warn)} a ${member}
**${member}**: ${Discord} ID or ping
**${reason}?**: ${warn} ${reason}`
              },

              [mute]: {
                description: `${capitalize(mute)} a ${member}, using ${Discord} “${capitalize(timeout)}” feature.
**${member}**: ${Discord} ID or ping
**${duration}**: ${mute} length (e.g. \`5s\`, \`5m\`, \`5h\`, or \`5d\`)
**${reason}?**: ${mute} ${reason}`
              },

              kick: {
                description: `${capitalize(kick)} a ${member}
**${member}**: ${Discord} ID or ping
**${reason}?**: mute ${reason}`
              },

              [ban]: {
                description: `${capitalize(ban)} a ${member}
**${member}**: ${Discord} ID or ping
**${reason}?**: ${ban} ${reason}
**${duration}?**: ${ban} length (e.g. \`1d\`, \`36h\`, or \`1y\`)
**delete-messages?**: deletes the messages history of the banned user, using a ${duration} (e.g. \`5m\`, \`5h\`, or \`5d\`)`
              }
            },

            trailingTrivia: ''
            /* eslint-enable perfectionist/sort-objects */
          },

          title: 'Moderation'
        },

        defaultView: {
          description: `Below, you'll find a menu with categories, which in turn contain **all commands** for ${discordBotName}.`,
          title: `${capitalize(discordBotName)} help panel`
        }
      },

      selectMenuOptions: {
        defaultView: {
          description: 'Go back to the home screen',
          label: 'Home'
        },

        moderation: {
          description: 'Moderation commands',
          label: 'Moderation'
        }
      },

      selectMenuPlaceholder: 'Make your selection here'
    },

    vanityConfigCommand: {
      dangerousPermsWarning: {
        description: `By confirming this action, you will validate that the ${member}s of your ${guild} will be offered the ${role} {roleIdMagicString}, which offers sensitive ${permission}s:`,
        title: `The ${role} you will assign with this ${config} is a sensitive ${role}!`
      }
    },

    'greet-info': {
      premiumRenewal: `Renew your ${premium} to manage up to {premiumMaxGreetsAmount} ${greet}s.`,
      premiumAd: `Upgrade to ${premium} to create up to {premiumMaxGreetsAmount} ${greet}s.`,
      noGreetYet: `No ${greet} has been set up on this ${guild} at the moment.`,
      title: `${capitalize(greet)} ${channel}s`
    },

    muteCommand: {
      mutesAmountOverLimit: `You've been ${mute}d over {limit} {{time|times}}.`,
      mutesAmount: `You've been ${mute}d {mutesAmount} {{time|times}}.`,
      reportAuthorLabel: `${capitalize(moderator)}`,
      until: 'End: {countdownMagicString}',
      headline: `You've been ${mute}d!`
    },

    banCommand: {
      bansAmountOverLimit: `You've been ${banned} over {limit} {{time|times}}.`,
      bansAmount: `You've been ${banned} {bansAmount} {{time|times}}.`,
      reportAuthorLabel: `${capitalize(moderator)}`,
      until: 'End: {countdownMagicString}',
      headline: `You've been ${banned}!`
    },

    warnCommand: {
      warnsAmountOverLimit: `You have been ${warned} over {limit} {{time|times}}.`,
      warnsAmount: `You have been ${warned} {warnsAmount} {{time|times}}.`,
      reportAuthorLabel: `${capitalize(moderator)}`,
      headline: `You've been ${warned}!`
    },

    kickCommand: {
      kicksAmountOverLimit: `You've been ${kick}ed over {limit} {{time|times}}.`,
      kicksAmount: `You've been ${kick}ed {kicksAmount} {{time|times}}.`,
      reportAuthorLabel: `${capitalize(moderator)}`,
      headline: `You've been ${kick}ed!`
    },

    commons: {
      footerText: poweredByWatermark
    }
  },

  slashCommands: {
    [ban]: {
      options: {
        'delete-messages': {
          description: `Deletes the messages history of the ${banned} ${user} (minimum: 1m, maximum: 7d)`,
          name: 'delete-messages'
        },

        duration: {
          description: `${capitalize(ban)} ${duration} (minimum: 1d, maximum: 100y)`,
          name: duration
        },

        [reason]: {
          description: `${capitalize(ban)} ${reason}`,
          name: reason
        },

        [user]: {
          description: userSlashCommandOptionDescription,
          name: user
        }
      },

      description: `${capitalize(ban)} a ${member}`,
      name: ban
    },

    [mute]: {
      options: {
        [duration]: {
          description: `${capitalize(mute)} ${duration} (minimum: 5s, maximum: 28d)`,
          name: duration
        },

        [member]: {
          description: memberSlashCommandOptionDescription,
          name: member
        },

        [reason]: {
          description: `${capitalize(mute)} ${reason}`,
          name: reason
        }
      },

      description: `${capitalize(mute)} a ${member}, using ${Discord} “${capitalize(timeout)}” feature`,
      name: mute
    },

    [warn]: {
      options: {
        [member]: {
          description: memberSlashCommandOptionDescription,
          name: member
        },

        [reason]: {
          description: `${capitalize(warn)} ${reason}`,
          name: reason
        }
      },

      description: `${capitalize(warn)} a ${member}`,
      name: warn
    },

    [kick]: {
      options: {
        member: {
          description: memberSlashCommandOptionDescription,
          name: member
        },

        [reason]: {
          description: `${capitalize(kick)} ${reason}`,
          name: reason
        }
      },

      description: `${capitalize(kick)} a ${member}`,
      name: kick
    },

    ping: {
      options: {
        'meaningless-choice': {
          choices: {
            lmao: 'useless',
            lol: 'useless'
          },

          description: 'useless',
          name: 'useless-choice'
        }
      },

      description: 'Bot latency (ms).',
      name: 'ping'
    },

    /* eslint-disable perfectionist/sort-objects */
    'config-vanity': {
      options: {
        role: {
          description: `Role to give to the members sharing the ${vanity} link in their status`,
          name: 'role'
        },

        [vanity]: {
          description: `Custom invite link (discord.gg/example)`,
          name: vanity
        }
      },

      description: 'Choose an invitation link and a role to reward members who share it.',
      name: vanity
    },

    [config]: {
      description: 'TBD',
      name: config,

      options: {}
    },

    'greet-toggle': {
      options: {
        [channel]: {
          description: 'Lorem ipsum dolor sit amet - TBD',
          name: channel
        }
      },

      description: 'Lorem ipsum dolor sit amet - TBD',
      name: 'toggle'
    },

    'greet-infos': {
      description: 'Lorem ipsum dolor sit amet - TBD',
      name: 'infos',
      options: {}
    },

    [greet]: {
      description: 'Lorem ipsum dolor sit amet - TBD',
      options: {},
      name: greet
    },
    /* eslint-enable perfectionist/sort-objects */

    help: {
      description: 'Display all commands',
      name: 'help',
      options: {}
    }
  },

  tutorials: {
    usage: {
      durationOption: {
        examples: {
          banDeleteMessagesHistoryDurationLimit: {
            gist: `\`1m\`: delete the ${user}'s messages for one minute before the ${ban}.
\`1h\`: delete the ${user}'s messages for one hour before the ${ban}.
\`1d\`: delete the ${user}'s messages for one day before the ${ban}.`,
            additionalInformations: `Minimum: **1 minute** (\`1m\`), maximum: **7 days** (\`7d\`).\n${acceptedMaximumDurationStringLength}`
          },

          [mute]: {
            additionalInformations: `Minimum: **5 seconds** (\`5s\`), maximum: **28 days** (\`28d\`).\n${acceptedMaximumDurationStringLength}`,
            gist: `\`5s\`: ${mute} for 5 seconds.
\`5m\`: ${mute} for 5 minutes.
\`5h\`: ${mute} for 5 hours.
\`5d\`: ${mute} for 5 days.`
          },

          [ban]: {
            additionalInformations: `Minimum: **1 day** (\`1d\`), maximum: **100 years** (\`100y\`).\n${acceptedMaximumDurationStringLength}`,
            gist: `\`1d\`: ${ban} for 1 day.
\`1y\`: ${ban} for 1 year.`
          }
        },

        informationEmbed: {
          title: `“\`${capitalize(duration)}\`” option usage with ${discordBotName}`,
          with: `Specifying a ${duration} of:\n- \`{userDurationInput}\``
        }
      },

      vanityConfig: {
        examples: {
          needle: {
            additionalInformations: `The maximum length of the ${vanity} code option's \`MY-INVITE-CODE\` block text we accept is: 25 characters.\nNotice that only alphanumeric characters and dashes are allowed in this block.`,

            gist: `\`https://discord.gg/MY-INVITE-CODE\`
\`discord.gg/MY-INVITE-CODE\`
\`.gg/MY-INVITE-CODE\`
\`gg/MY-INVITE-CODE\`
\`/MY-INVITE-CODE\`
\`MY-INVITE-CODE\``
          }
        },

        informationEmbed: {
          title: `${capitalize(vanity)} config usage with ${discordBotName}`,
          with: `Specifying a ${vanity} code of:\n- \`{vanityCode}\``
        }
      }
    },

    usecase: 'You tried to use the command:\n- `/{commandName}`\nWith the option:\n- `{option}`',
    examplesHeadline: 'Examples of usage',
    goodToKnowHeadline: 'Good to know',
    helpTitle: 'Help notice'
  },

  permissions: {
    MentionEveryone: `Mention @everyone, @here, and All ${capitalize(role)}s`,
    ModerateMembers: `Timeout ${capitalize(member)}s`,
    ManageChannels: `Manage ${capitalize(channel)}s`,
    DeafenMembers: `Deafen ${capitalize(member)}s`,
    CreateGuildExpressions: 'Create Expressions',
    ManageGuildExpressions: 'Manage Expressions',
    KickMembers: `Kick ${capitalize(member)}s`,
    ManageRoles: `Manage ${capitalize(role)}s`,
    MoveMembers: `Move ${capitalize(member)}s`,
    MuteMembers: `Mute ${capitalize(member)}s`,
    BanMembers: `Ban ${capitalize(member)}s`,
    ManageNicknames: 'Manage Nicknames',
    ManageMessages: 'Manage Messages',
    ManageWebhooks: 'Manage Webhooks',
    ManageThreads: 'Manage Threads',
    Administrator: 'Administrator',
    ManageEvents: 'Manage Events',
    ManageGuild: 'Manage Server'
  },

  infos: {
    greetCallback: {
      followUpFeedback: {
        greetRemoved: `The ${greet} has been removed from the ${channel}! — {channelIdMagicString}`,
        greetAdded: `The ${greet} has been added to the ${channel}! — {channelIdMagicString}`
      }
    },

    vanityConfigCallback: {
      followUpFeedback: {
        successfullyConfiguredVanity: `The ${vanity} has been set up successfully! Members who share \`{vanityCode}\` in their status will receive the ${role} {roleIdMagicString}.`
      }
    }
  },

  initializers: {
    botIsReady: 'Ready! Logged in as {botUserTag}. PMID: {PMID}.',
    registeredCommandsOnline: 'Registered all commands online',
    resumingSlashCommands: 'Resuming slash commands…',
    loadedVocab: 'Loaded all vocabulary',
    mountedClient: 'Mounted client'
  },

  etc: {
    notImplemented: {
      premiumCommandsAreCurrentlyNotSupportedInDm: `Using ${premium} commands is not yet supported in DM. Sorry!`
    },

    fragments: {
      separatedWithDoubleColumns: '{prefix}: {suffix}'
    }
  },

  guardsFeedbacks: {
    premiumOnlyCommand: `This command is reserved to ${premium} ${user}s.`
  },

  pushNotifications: {
    greet: 'Hey {memberIdMagicString}, check this!'
  },

  warnings: {
    title: 'Warning!'.toUpperCase()
  },

  vocab: {
    ...SHARED.vocab
  }
} as const satisfies VocabType satisfies BaseTranslation;

export default enUS;
