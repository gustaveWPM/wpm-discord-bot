import type { MaybeNull } from './Utils';

export type IsPremium = boolean;
export type IsPremiumMetadatas = { isPremiumUntil: MaybeNull<Date>; isPremium: IsPremium };
