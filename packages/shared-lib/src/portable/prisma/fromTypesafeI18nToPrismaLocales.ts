const fromTypesafeI18nToPrismaLocales = <L extends string, __MaybeELang extends MakeELang<L>>(locale: L) => locale.replace(/-/g, '_') as __MaybeELang;

export default fromTypesafeI18nToPrismaLocales;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FromTypesafeI18nLocalesToPrismaELang<L extends string> = L extends `${infer Left}-`
  ? InvalidLocale<L>
  : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    L extends `-${infer Right}`
    ? InvalidLocale<L>
    : L extends `${infer Left}-${infer Right}`
      ? `${Left}_${Right}`
      : L;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type MakeELang<
  L extends string,
  __MAYBE_SUCCESS = FromTypesafeI18nLocalesToPrismaELang<L>,
  __MAYBE_FAILURE = InvalidLocale<L>
> = __MAYBE_SUCCESS extends __MAYBE_FAILURE ? __MAYBE_FAILURE : __MAYBE_SUCCESS;

type InvalidLocale<L extends string> = `INVALID LOCALE: ${L}`;
