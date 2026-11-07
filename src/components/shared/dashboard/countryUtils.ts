/** Converts an ISO country code (e.g. "US") to its flag emoji. */
export const countryFlag = (code: string): string =>
  String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((c) => 127397 + c.charCodeAt(0)),
  )

/** Localized country name for the active language. */
export const countryName = (code: string, language: string): string =>
  new Intl.DisplayNames(language, { type: 'region' }).of(code) ?? code
