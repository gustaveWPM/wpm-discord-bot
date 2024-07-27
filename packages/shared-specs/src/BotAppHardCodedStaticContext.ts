import type { Bounds } from '@wpm-discord-bot/shared-types/Utils';

const DISCORD_LIMITS = {
  DURATION: {
    BAN_DELETE_HISTORY_LIMITS_IN_SECONDS: {
      MAX: 604_800, // NOTE: 7d (in seconds)
      MIN: 60 // NOTE: 1m (in seconds)
    },

    BAN_DELETE_HISTORY_LIMITS_IN_MS: {
      MAX: 604_800_000, // NOTE: 7d (in ms)
      MIN: 60_000 // NOTE: 1m (in ms)
    },

    TIMEOUT_MEMBERS_MAX_MS: 2_419_200_000 // NOTE: 28d - https://discordjs.guide/popular-topics/faq.html#how-do-i-timeout-a-guild-member
  },

  REASON: {
    KICKED_MEMBERS_MAX_LEN: 512,
    BANNED_MEMBERS_MAX_LEN: 512,
    MUTED_MEMBERS_MAX_LEN: 512
  }
} as const;

const BOT_APP_HARD_CODED_STATIC_CONTEXT = {
  APP_RESTRICTIONS: {
    MODERATION: {
      SANCTIONS: {
        BAN_DELETE_HISTORY_LIMITS_IN_SECONDS: {
          MAX: DISCORD_LIMITS.DURATION.BAN_DELETE_HISTORY_LIMITS_IN_SECONDS.MAX,
          MIN: DISCORD_LIMITS.DURATION.BAN_DELETE_HISTORY_LIMITS_IN_SECONDS.MIN
        } satisfies Bounds,

        BAN_DELETE_HISTORY_LIMITS_IN_MS: {
          MAX: DISCORD_LIMITS.DURATION.BAN_DELETE_HISTORY_LIMITS_IN_MS.MAX,
          MIN: DISCORD_LIMITS.DURATION.BAN_DELETE_HISTORY_LIMITS_IN_MS.MIN
        } satisfies Bounds,

        TIMEOUT_LIMITS_IN_MS: {
          MAX: DISCORD_LIMITS.DURATION.TIMEOUT_MEMBERS_MAX_MS,
          MIN: 5e3 // NOTE: 5s (arbitrary value),
        } satisfies Bounds,

        BAN_LIMITS_IN_MS: {
          MAX: 3_153_600_000_000, // NOTE: 100y
          MIN: 86_400_000 // NOTE: 1d
        } satisfies Bounds,

        MAX_KICKS_PER_MEMBER_AMOUNT: 500,
        MAX_WARNS_PER_MEMBER_AMOUNT: 500,
        MAX_MUTES_PER_MEMBER_AMOUNT: 500,
        MAX_BANS_PER_USER_AMOUNT: 500
      }
    },

    MEMBERS_ONBOARDING: {
      GREET: {
        MAX_GREETS_PER_GUILD_WITH_FREEMIUM: 1,
        MAX_GREETS_PER_GUILD_WITH_PREMIUM: 5
      }
    },

    LIMITS: {
      DURATION_STRING_MAX_LENGTH: 30
    }
  },

  DB: {
    VARCHAR_LENGTH_CONSTRAINTS: {
      MODERATION: {
        KickedMembers: {
          reason: DISCORD_LIMITS.REASON.KICKED_MEMBERS_MAX_LEN,
          unkickReason: 1024
        },

        BannedMembers: {
          reason: DISCORD_LIMITS.REASON.BANNED_MEMBERS_MAX_LEN,
          unbanReason: 1024
        },

        MutedMembers: {
          reason: DISCORD_LIMITS.REASON.MUTED_MEMBERS_MAX_LEN,
          unmuteReason: 1024
        },

        WarnedMembers: {
          unwarnReason: 1024,
          reason: 1024
        }
      },

      BumpBotOptions: {
        readyToBumpMessage: 4096,
        thanksMessage: 2048
      },

      WelcomeMessageOptions: {
        imageUrl: 1024,
        message: 4096
      },

      GreetEphemeralOptions: {
        ephemeralMsg: 2048
      },

      WelcomeConfig: {
        fallbackImageUrl: 1024
      },

      RewardConfig: {
        guildScoreLabel: 1024
      },

      VanityConfig: {
        needle: 255
      }
    }
  },

  VISUAL_CHART: {
    EMOJIS: {
      ARROW_UPPER_RIGHT: ':arrow_upper_right:',
      HEALTHCHECK_PASS: ':white_check_mark:',
      MODERATION_COMMAND: ':orange_heart:',
      GOOD_TO_KNOW: ':four_leaf_clover:',
      DELETED_AUTOMATICALLY: ':boom:',
      EXAMPLES: ':paperclip:',
      HEALTHCHECK_FAIL: ':x:',
      PREMIUM_CTA: ':star:',
      WARNING: ':warning:'
    },

    EMBEDS: {
      INFORMATION_SOURCE_LOGO_URL: 'https://gustavewpm.github.io/resources/medias/img/information-source-logo.png',
      FOOTER_LOGO_URL: 'https://gustavewpm.github.io/resources/medias/img/footer-logo.webp',
      TITLE_LOGO_URL: 'https://gustavewpm.github.io/resources/medias/img/logo.png',

      PRIMARY_COLOR: 0xffc776
    }
  },

  EMBEDS: {
    HELP_COMMAND: {
      VIEWS: {
        MODERATION: {
          THUMBNAIL_URL: 'https://gustavewpm.github.io/resources/medias/img/moderation-help-embed-thumbnail.webp'
        },

        DEFAULT: {
          BANNER_URL: 'https://gustavewpm.github.io/resources/medias/img/help-embed-banner.webp'
        }
      }
    }
  },

  COMMUNITY: {
    DISCORD_SERVER_INVITE_LINK: 'https://discord.gg/djs'
  },

  SYS: {
    ARBORESCENCE: {
      TRACES_FOLDER: 'traces'
    }
  }
} as const;

export default BOT_APP_HARD_CODED_STATIC_CONTEXT;
