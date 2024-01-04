/* eslint-disable no-control-regex */
export const EMAIL_REGEX =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export const COLORS = {
  secondary: "#6A6E85",
}

export const PRICE_INTERVAL = {
  MONTH: "month",
  YEAR: "year",
}

export const SUBSCRIPTION = {
  FREE: "FREE",
  MONTHLY: "MONTHLY",
  ANNUAL: "ANNUAL",
}

export const flightClassesMapping = {
  Economy: "economy",
  PremiumEconomy: "premiumEconomy",
  Business: "business",
  First: "first",
}

export const DATE_FORMAT = "yyyy-MM-dd HH:mm:ss"

export const DATE_FORMAT_EXPANDABLE_ROW = "EEEE, MMMM dd, HH:mm aa"
// 'yyyy-MM-dd HH:mm:ss'

export const DATE_FORMAT_AUSTRALIA_DEPART = "dd MMM yyyy"

export const maxAlertsPerSubscription = {
  FREE: 0,
  MONTHLY: 5,
  ANNUAL: 25,
}

export const ITEMS_PER_PAGE = 10
export const ITEMS_PER_PAGE_AUSTRALIA = 15

export const flightClassesColors = {
  Economy: "#DD0000",
  PremiumEconomy: "#FC9E0A",
  Business: "#B39E69",
  First: "#796F5A",
}

export const pointsPrograms = {
  "Qantas FF": "qantasFF",
  "Virgin Velocity": "virginVelocity",
}

export const programNameToCodeMapping = {
  "Qantas FF": "QF",
  "Virgin Velocity": "VA",
}
