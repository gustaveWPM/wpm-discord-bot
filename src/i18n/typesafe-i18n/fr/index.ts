import type { SharedVocabType, VocabType } from '@wpm-discord-bot/shared-types/BotI18n';

import type { Translation } from '../i18n-types';

// NOTE: Use relative import paths to avoid breaking codegen.
import capitalize from '../../../lib/str/capitalize';

const _nomDuBotDiscord = 'WPM Bot';
const _duree = 'durée';
const _membre = 'membre';
const _utilisateur = 'utilisateur';
const _raison = 'raison';
const _serveur = 'serveur';
const _discord = 'Discord';
const _veuillezReessayer = 'veuillez réessayer';

const FR_TERMINOLOGY = {
  bannissement: 'bannissement',
  exclure: 'exclure',
  exclus: 'exclus',
  bannit: 'bannit',
  bannir: 'bannir',
  banni: 'banni'
};

const SHARED = {
  // acceptedMaximumDurationStringLength: cf. BOT_APP_HARD_CODED_STATIC_CONTEXT.APP_RESTRICTIONS.MODERATION.LIMITS
  vocab: {
    acceptedMaximumDurationStringLength: `La longueur maximale du texte de l'option de ${_duree} que nous acceptons est de 30 caractères.`,
    userSlashCommandOptionDescription: `ID ${_discord} ou mention de l'${_utilisateur}`,
    memberSlashCommandOptionDescription: `ID ${_discord} ou mention du ${_membre}`,
    failedToInteract: `L'opération a échoué. ${capitalize(_veuillezReessayer)}.`,
    userNotInGuild: `Cet ${_utilisateur} n'est pas présent sur le ${_serveur}.`,
    poweredByWatermark: `Propulsé par ${_nomDuBotDiscord}`,
    thisValueIsIncorrect: 'Cette valeur est incorrecte !',
    reasonNotSpecified: `aucune ${_raison} fournie`, // ISO Discord
    pleaseTryAgain: _veuillezReessayer,
    discordBotName: _nomDuBotDiscord,
    permission: 'permission',
    moderator: 'modérateur',
    warn: 'avertissement',
    confirm: 'confirmer',
    premium: 'premium',
    user: _utilisateur,
    cancel: 'annuler',
    stale: 'obsolète',
    discord: _discord,
    vanity: 'vanity',
    channel: 'salon',
    duration: _duree,
    warned: 'averti',
    kick: 'expulser',
    config: 'config',
    guild: _serveur,
    reason: _raison,
    member: _membre,
    greet: 'greet',
    role: 'rôle',
    mute: 'mute',
    ban: 'ban'
  }
} as const satisfies SharedVocabType;

const {
  acceptedMaximumDurationStringLength: longueurMaximaleOptionDureeViaTexteAcceptee,
  userSlashCommandOptionDescription: descriptionOptionUtilisateurDesSlashCommands,
  memberSlashCommandOptionDescription: descriptionOptionMembreDesSlashCommands,
  pleaseTryAgain: veuillezReessayer,
  poweredByWatermark: filigraneBot,
  discordBotName: nomDuBotDiscord,
  moderator: moderateur,
  warn: avertissement,
  user: utilisateur,
  discord: Discord,
  duration: duree,
  reason: raison,
  member: membre,
  guild: serveur,
  warned: averti,
  kick: expulser,
  channel: salon,
  permission,
  premium,
  vanity,
  config,
  greet,
  role,
  mute
} = SHARED.vocab;

const { bannissement, exclure, exclus, bannit, bannir, banni } = FR_TERMINOLOGY;

const fr = {
  errors: {
    muteCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `Je n'ai pas les ${permission}s nécessaires pour ${mute} {memberIdMagicString} (${membre} de : {guildName}). Veuillez essayer de monter mon ${role} dans la liste des ${role}s de votre ${serveur}.\nhttps://support.discord.com/hc/fr/articles/214836687-Gestion-des-r%C3%B4les-101\nVeuillez également vérifier que je dispose bien de la ${permission} d'${exclure} des membres sur votre ${serveur}.`,

        misusages: {
          warnings: {
            yourMuteHasNotBeenApplied: `Votre ${mute} n'a pas été appliqué au ${membre} {memberIdMagicString} — {guildName} !`
          }
        },

        failedToInteract: `Je n'ai pas réussi à ${mute} {memberIdMagicString} (${membre} de : {guildName}). ${capitalize(veuillezReessayer)}.`,
        triedToMuteYourself: `Vous avez essayé de vous ${mute} vous-même ! Vous vous trouvez un peu trop bavard en ce moment ?`,
        triedToMuteBot: `Vous avez essayé de me ${mute} !\nC'est pas très sympa… Méchanceté gratuite !\n{youtubeMemeLink}`,
        youCantMuteThisMember: `Vous ne pouvez pas ${mute} {memberIdMagicString} (${membre} de : {guildName}).`,
        thisMemberIsAlreadyMuted: `{memberIdMagicString} est déjà ${mute} (${membre} de : {guildName}).`
      }
    },

    banCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `Je n'ai pas les ${permission}s nécessaires pour ${bannir} {userIdMagicString} ({guildName}). Veuillez essayer de monter mon ${role} dans la liste des ${role}s de votre ${serveur}.\nhttps://support.discord.com/hc/fr/articles/214836687-Gestion-des-r%C3%B4les-101\nVeuillez également vérifier que je dispose bien de la ${permission} de ${bannir} des ${membre}s sur votre ${serveur}.`,

        misusages: {
          warnings: {
            yourBanHasNotBeenApplied: `Échec du ${bannissement} de {userIdMagicString} — {guildName} !`
          }
        },

        failedToInteract: `Je n'ai pas réussi à ${bannir} {userIdMagicString} ({guildName}). ${capitalize(veuillezReessayer)}.`,
        triedToBanYourself: `Vous avez essayé de vous ${bannir} vous-même ! Pourquoi donc ? La vie est belle.`,
        thisUserIsAlreadyBanned: `L'${utilisateur} {userIdMagicString} est déjà ${banni} ({guildName}).`,
        youCantBanThisUser: `Vous ne pouvez pas ${bannir} cet ${utilisateur}.`,
        triedToBanBot: `Bien tenté !\n{youtubeMemeLink}`
      }
    },

    kickCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `Je n'ai pas les ${permission}s nécessaires pour ${expulser} {memberIdMagicString} (${membre} de : {guildName}). Veuillez essayer de monter mon ${role} dans la liste des ${role}s de votre ${serveur}.\nhttps://support.discord.com/hc/fr/articles/214836687-Gestion-des-r%C3%B4les-101\nVeuillez également vérifier que je dispose bien de la ${permission} d'${expulser} des membres sur votre ${serveur}.`,
        failedToInteract: `Je n'ai pas réussi à expulser {memberIdMagicString} (${membre} de : {guildName}). ${capitalize(veuillezReessayer)}.`,
        triedToKickBot: `Vous avez essayé de m'${expulser} !\nC'est pas très sympa… J'espère que vous vous êtes trompé !\n{youtubeMemeLink}`,
        triedToKickYourself: `Vous avez essayé de vous ${expulser} vous-même ! Vous avez un peu trop de temps libre ?`,
        youCantKickThisMember: `Vous ne pouvez pas expulser ce ${membre}.`
      }
    },

    warnCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `Je n'ai pas les ${permission}s nécessaires pour mettre un ${avertissement} à {memberIdMagicString} (${membre} de : {guildName}). Veuillez essayer de monter mon ${role} dans la liste des ${role}s de votre ${serveur}.\nhttps://support.discord.com/hc/fr/articles/214836687-Gestion-des-r%C3%B4les-101`,
        failedToInteract: `Je n'ai pas pu mettre d'${avertissement} à {memberIdMagicString} (${membre} de : {guildName}). ${capitalize(veuillezReessayer)}.`,
        triedToWarnYourself: `Vous avez essayé de vous mettre un ${avertissement} à vous-même ! Vous vous trouvez un peu trop insolent aujourd'hui ?`,
        triedToWarnBot: `Vous avez essayé de me flanquer un ${avertissement} !\nJ'en suis tout **GRUMPY** !\n{youtubeMemeLink}`,
        youCantWarnThisMember: `Vous ne pouvez mettre d'${avertissement} à ce ${membre}.`
      }
    },

    vanityConfigCallback: {
      followUpFeedback: {
        botIsMissingPermissions: `Je n'ai pas les ${permission}s nécessaires pour attribuer le ${role} {roleIdMagicString}. Veuillez essayer de monter mon ${role} dans la liste des ${role}s de votre ${serveur}.\nhttps://support.discord.com/hc/fr/articles/214836687-Gestion-des-r%C3%B4les-101`,
        targetedRoleIsEveryone: `Le ${role} ciblé est {everyoneRoleIdMagicString} ! Vous ne pouvez pas attribuer utiliser ce ${role} ici.`,
        youCantGiveThisRole: `Vous n'avez pas les ${permission}s nécessaires pour attribuer le ${role} {roleIdMagicString}.`
      }
    },

    greetCallback: {
      followUpFeedback: {
        usedAllYourGreetCreditsEphemeralWithFreemiumPlan: `Vous avez atteint la limite de ${greet}s configurables sur votre ${serveur}. Passez au ${premium} pour pouvoir créer jusqu'à {premiumMaxGreetsAmount} ${greet}s.`,
        usedAllYourGreetCreditsEphemeralWithPremiumPlan: `Vous avez déjà {premiumMaxGreetsAmount} ${greet}s configurés sur votre ${serveur}. Veuillez en retirer un et réessayer.`,
        botIsMissingPermissions: `Je n'ai pas la ${permission} de poster dans ce ${salon} ! ({channelIdMagicString})`
      }
    },

    attemptToGetOrCreateGuild: {
      bothFailedToRetrieveAnExistingGuildAndToCreateANewGuild: `Échec de la récupération d'un ${serveur} ${Discord} existant en base de données, et échec de sa création en DB !`
    },

    commons: {
      cantFetchGuildBans: `{funName} : impossible de récupérer les ${bannissement}s du ${serveur} !`,
      youHaveMisusedAnOption: 'Vous avez mal utilisé une option !'
    },

    guildSlashCommand: {
      botIsCurrentlyTimedOut: `Je suis actuellement ${exclus} du ${serveur} ! Toutes mes commandes sont désactivées ici.`
    }
  },

  embeds: {
    helpCommand: {
      views: {
        moderation: {
          content: {
            commands: {
              /* eslint-disable perfectionist/sort-objects */
              warn: {
                description: `Ajoute un ${avertissement} à un ${membre}
**${membre}** : ID ${Discord} ou mention
**${raison}?** : ${raison} de l'${avertissement}`
              },

              mute: {
                description: `${capitalize(mute)} un ${membre} (fonctionnalité « ${capitalize(exclure)} » de ${Discord}).
**${membre}** : ID ${Discord} ou mention
**${duree}** : ${duree} du ${mute} (exemple : \`5s\`, \`5m\`, \`5h\`, ou \`5d\`)
**${raison}?** : ${raison} du ${mute}`
              },

              kick: {
                description: `Expulse un ${membre}
**${membre}** : ID ${Discord} ou mention
**${raison}?** : ${raison} de l'expulsion`
              },

              ban: {
                description: `${capitalize(bannit)} un ${membre}
**${membre}** : ID ${Discord} ou mention
**${raison}?** : ${raison} du ${bannissement}
**${duree}?** : ${duree} du ${bannissement} (exemple : \`1d\`, \`36h\`, ou \`1y\`)
**supprimer-messages?** : efface l'historique des messages de l'${utilisateur}, selon une ${duree} (exemple : \`5m\`, \`5h\`, ou \`5d\`)`
              }
            },

            trailingTrivia: ''
            /* eslint-enable perfectionist/sort-objects */
          },

          title: 'Modération'
        },

        defaultView: {
          description: `Ci-dessous, vous retrouverez un menu comportant des catégories, qui elles-mêmes comportent **toutes les commandes** de ${nomDuBotDiscord}.`,

          title: `Panneau d'aide de ${nomDuBotDiscord}`
        }
      },

      selectMenuOptions: {
        defaultView: {
          description: "Revenir à l'écran d'accueil",
          label: 'Accueil'
        },

        moderation: {
          description: 'Commandes de modération',
          label: 'Modération'
        }
      },

      selectMenuPlaceholder: 'Faites votre choix ici'
    },

    'greet-info': {
      premiumRenewal: `Réactivez le ${premium} afin de pouvoir gérer librement jusqu'à {premiumMaxGreetsAmount} ${greet}s.`,
      premiumAd: `Passez au ${premium} pour pouvoir créer jusqu'à {premiumMaxGreetsAmount} ${greet}s.`,
      noGreetYet: `Aucun ${greet} n'a été configuré sur ce ${serveur} pour le moment.`,
      title: `${capitalize(salon)}s avec la fonctionnalité ${greet}`
    },

    vanityConfigCommand: {
      dangerousPermsWarning: {
        description: `En confirmant cette action, vous validerez donc que les ${membre}s de votre ${serveur} se feront offrir le ${role} {roleIdMagicString}, qui offre des ${permission}s sensibles :`,
        title: `Le ${role} que vous allez attribuer avec cette ${config} est un ${role} sensible !`
      }
    },

    muteCommand: {
      mutesAmountOverLimit: `Vous avez été ${mute} plus de {limit} fois.`,
      mutesAmount: `Vous avez été ${mute} {mutesAmount} fois.`,
      reportAuthorLabel: `${capitalize(moderateur)}`,
      until: 'Fin : {countdownMagicString}',
      headline: `Vous avez été ${mute} !`
    },

    banCommand: {
      bansAmountOverLimit: `Tu as été ${banni} plus de {limit} fois.`,
      bansAmount: `Tu as été ${banni} {bansAmount} fois.`,
      reportAuthorLabel: `${capitalize(moderateur)}`,
      until: 'Fin : {countdownMagicString}',
      headline: `Tu as été ${banni} !`
    },

    warnCommand: {
      warnsAmountOverLimit: `Vous avez été ${averti} plus de {limit} fois.`,
      warnsAmount: `Vous avez été ${averti} {warnsAmount} fois.`,
      headline: `Vous avez pris un ${avertissement} !`,
      reportAuthorLabel: `${capitalize(moderateur)}`
    },

    kickCommand: {
      kicksAmountOverLimit: `Vous avez été ${exclus} plus de {limit} fois.`,
      kicksAmount: `Vous avez été ${exclus} {kicksAmount} fois.`,
      reportAuthorLabel: `${capitalize(moderateur)}`,
      headline: `Vous vous êtes fait ${exclure} !`
    },

    commons: {
      footerText: filigraneBot
    }
  },

  slashCommands: {
    ban: {
      options: {
        'delete-messages': {
          description: `Supprime l'historique des messages de l'${utilisateur} ${banni} (minimum 1m, maximum 7d)`,
          name: 'supprimer-messages'
        },

        duration: {
          description: `${capitalize(duree)} du ${bannissement} (minimum 1d, maximum 100y)`,
          name: duree
        },

        user: {
          description: descriptionOptionUtilisateurDesSlashCommands,
          name: utilisateur
        },

        reason: {
          description: `${capitalize(raison)} du ${bannissement}`,
          name: raison
        }
      },

      description: `${capitalize(bannit)} un ${membre}`,
      name: bannir
    },

    mute: {
      options: {
        duration: {
          description: `${capitalize(duree)} du ${mute} (minimum 5s, maximum 28d)`,
          name: duree
        },

        member: {
          description: descriptionOptionMembreDesSlashCommands,
          name: membre
        },

        reason: {
          description: `${capitalize(raison)} du ${mute}`,
          name: raison
        }
      },

      description: `${capitalize(mute)} un ${membre} en utilisant la fonctionnalité « ${capitalize(exclure)} » de ${Discord}`,
      name: mute
    },

    warn: {
      options: {
        reason: {
          description: `${capitalize(raison)} de l'${avertissement}`,
          name: raison
        },

        member: {
          description: descriptionOptionMembreDesSlashCommands,
          name: membre
        }
      },

      description: `Ajoute un ${avertissement} à un ${membre}`,
      name: 'avertir'
    },

    kick: {
      options: {
        member: {
          description: descriptionOptionMembreDesSlashCommands,
          name: membre
        },

        reason: {
          description: `${capitalize(raison)} de l'expulsion`,
          name: raison
        }
      },

      description: `Expulse un ${membre}`,
      name: expulser
    },

    ping: {
      options: {
        'meaningless-choice': {
          choices: {
            lmao: 'sert à rien',
            lol: 'sert à rien'
          },

          name: 'choix-qui-sert-a-rien',
          description: 'sert à rien'
        }
      },

      description: 'Retourne la latence du bot en ms.',
      name: 'ping'
    },

    /* eslint-disable perfectionist/sort-objects */
    [config]: {
      description: 'TBD',
      name: 'config',
      options: {}
    },

    'config-vanity': {
      description: "Choisir un lien d'invitation et un rôle pour récompenser les membres qui le partagent",
      name: vanity,

      options: {
        role: {
          description: "Rôle à offrir aux membres qui partagent le lien d'invitation dans leur statut",
          name: role
        },

        [vanity]: {
          description: "Lien d'invitation personnalisé (discord.gg/exemple)",
          name: vanity
        }
      }
    },

    'greet-toggle': {
      options: {
        channel: {
          description: 'Lorem ipsum dolor sit amet - TBD',
          name: salon
        }
      },

      description: 'Lorem ipsum dolor sit amet - TBD',
      name: 'on-off'
    },

    'greet-infos': {
      description: 'Lorem ipsum dolor sit amet - TBD',
      name: 'infos',
      options: {}
    },

    [greet]: {
      description: 'Lorem ipsum dolor sit amet - TBD',
      name: greet,
      options: {}
    },
    /* eslint-enable perfectionist/sort-objects */

    help: {
      description: 'Affiche la liste des commandes',
      name: 'aide',
      options: {}
    }
  },

  tutorials: {
    usage: {
      durationOption: {
        examples: {
          banDeleteMessagesHistoryDurationLimit: {
            gist: `\`1m\` : supprime les messages de l'${utilisateur} datant d'une minute avant le ${bannissement}.
\`1h\` : supprime les messages de l'${utilisateur} datant d'une heure avant le ${bannissement}.
\`1d\` : supprime les messages de l'${utilisateur} datant d'un jour avant le ${bannissement}.`,
            additionalInformations: `Minimum : **1 minute** (\`1m\`), maximum : **7 jours** (\`7d\`).\n${longueurMaximaleOptionDureeViaTexteAcceptee}`
          },

          mute: {
            gist: `\`5s\` : ${mute} pendant 5 secondes.
\`5m\` : ${mute} pendant 5 minutes.
\`5h\` : ${mute} pendant 5 heures.
\`5d\` : ${mute} pendant 5 jours.`,
            additionalInformations: `Minimum : **5 secondes** (\`5s\`), maximum : **28 jours** (\`28d\`).\n${longueurMaximaleOptionDureeViaTexteAcceptee}`
          },

          ban: {
            additionalInformations: `Minimum : **1 jour** (\`1d\`), maximum : **100 ans** (\`100y\`).\n${longueurMaximaleOptionDureeViaTexteAcceptee}`,
            gist: `\`1d\` : ${bannit} pendant 1 jour.
\`1y\` : ${bannit} pendant 1 an.`
          }
        },

        informationEmbed: {
          title: `Utilisation de l'option « \`${capitalize(duree)}\` » avec ${nomDuBotDiscord}`,
          with: `En spécifiant une ${duree} de :\n- \`{userDurationInput}\``
        }
      },

      vanityConfig: {
        examples: {
          needle: {
            additionalInformations: `La longueur maximale du bloc \`MON-CODE-INVITATION\` de l'option du code ${vanity} que nous acceptons est de 25 caractères.\nDe plus, seuls les caractères alphanumériques et les tirets sont autorisés dans ce bloc.`,

            gist: `\`https://discord.gg/MON-CODE-INVITATION\`
\`discord.gg/MON-CODE-INVITATION\`
\`.gg/MON-CODE-INVITATION\`
\`gg/MON-CODE-INVITATION\`
\`/MON-CODE-INVITATION\`
\`MON-CODE-INVITATION\``
          }
        },

        informationEmbed: {
          with: `En spécifiant le code ${vanity} :\n- \`{vanityCode}\``,
          title: `Configuration du ${vanity} avec ${nomDuBotDiscord}`
        }
      }
    },

    usecase: "Vous avez essayé d'utiliser la commande :\n- `/{commandName}`\nAvec l'option :\n- `{option}`",
    examplesHeadline: "Exemples d'utilisation",
    goodToKnowHeadline: 'Bon à savoir',
    helpTitle: "Fiche d'aide"
  },

  permissions: {
    MentionEveryone: `Mentionner @everyone, @here et tous les ${role}s`,
    ModerateMembers: `Exclure temporairement des ${membre}s`,
    CreateGuildExpressions: 'Créer des expressions',
    ManageGuildExpressions: 'Gérer les expressions',
    MuteMembers: `Rendre les ${membre}s muets`,
    KickMembers: `Expulser des ${membre}s`,
    MoveMembers: 'Déplacer des ${membre}s',
    ManageChannels: `Gérer les ${salon}s`,
    ManageNicknames: 'Gérer les pseudos',
    ManageMessages: 'Gérer les messages',
    ManageWebhooks: 'Gérer les webhooks',
    ManageEvents: 'Gérer les événements',
    BanMembers: `Bannir des ${membre}s`,
    DeafenMembers: `Deafen ${membre}s`,
    ManageRoles: `Gérer les ${role}s`,
    ManageThreads: 'Gérer les fils',
    Administrator: 'Administrateur',
    ManageGuild: 'Gérer le serveur'
  },

  infos: {
    vanityConfigCallback: {
      followUpFeedback: {
        successfullyConfiguredVanity: `Le ${vanity} a été configuré avec succès ! Les membres qui partageront \`{vanityCode}\` dans leur statut recevront le ${role} {roleIdMagicString}.`
      }
    },

    greetCallback: {
      followUpFeedback: {
        greetRemoved: `Le ${greet} a été retiré du ${salon} ! — {channelIdMagicString}`,
        greetAdded: `Le ${greet} a été ajouté au ${salon} ! — {channelIdMagicString}`
      }
    }
  },

  initializers: {
    botIsReady: 'Prêt ! Connecté en tant que {botUserTag}. PMID: {PMID}.',
    resumingSlashCommands: 'Réinitialisation des slash commands…',
    registeredCommandsOnline: 'Commandes enregistrées en ligne',
    loadedVocab: 'Vocabulaire intégralement chargé',
    mountedClient: 'Client monté'
  },

  etc: {
    notImplemented: {
      premiumCommandsAreCurrentlyNotSupportedInDm: `Il n'est pas encore possible d'utiliser les commandes ${premium} en privé. Désolé !`
    },

    fragments: {
      separatedWithDoubleColumns: '{prefix} : {suffix}'
    }
  },

  guardsFeedbacks: {
    premiumOnlyCommand: `Cette commande est réservée aux ${utilisateur}s ${premium}.`
  },

  pushNotifications: {
    greet: 'Hey {memberIdMagicString}, regarde par ici !'
  },

  warnings: {
    title: 'Attention !'.toUpperCase()
  },

  vocab: {
    ...SHARED.vocab
  }
} as const satisfies VocabType satisfies Translation;

export default fr;
