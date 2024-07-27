import type { ELang } from '@prisma/client';

const fromPrismaToTypesafeI18nLocales = (locale: ELang) => locale.replace(/_/g, '-') as MakeLocales<ELang>;

export default fromPrismaToTypesafeI18nLocales;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FromPrismaELangToTypesafeI18nLocales<L extends ELang> = L extends `${infer Left}_`
  ? InvalidLocale<L>
  : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    L extends `_${infer Right}`
    ? InvalidLocale<L>
    : L extends `${infer Left}_${infer Right}`
      ? `${Left}-${Right}`
      : L;

type MakeLocales<
  L extends ELang,
  __MAYBE_SUCCESS = FromPrismaELangToTypesafeI18nLocales<L>,
  __MAYBE_FAILURE = InvalidLocale<L>
> = __MAYBE_SUCCESS extends __MAYBE_FAILURE ? __MAYBE_FAILURE : __MAYBE_SUCCESS;

type InvalidLocale<L extends string> = `INVALID LOCALE: ${L}`;
