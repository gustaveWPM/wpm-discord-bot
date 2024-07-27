export enum ECanModerateThisUser {
  CallerMemberHasNotThePermissionsToModerateTargetMember = 'CallerMemberHasNotThePermissionsToModerateTargetMember',
  BotHasNotThePermissionsToModerateTargetMember = 'BotHasNotThePermissionsToModerateTargetMember',
  TryingToModerateTheBot = 'TryingToModerateTheBot',
  TryingToSelfModerate = 'TryingToSelfModerate',
  FailedToInteract = 'FailedToInteract',
  UserNotInGuild = 'UserNotInGuild',
  OK = 'OK'
}
