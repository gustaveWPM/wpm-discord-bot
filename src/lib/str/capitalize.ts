// NOTE: DON'T move this outside this package. Used with a relative path import within i18n files, so that it belongs to the CORE of the package!
const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.substring(1);

export default capitalize;
