/** Fake data for the dashboard widgets – replace with Dexie queries later. */

export const dummyMonthlySales = [
  168, 385, 201, 298, 187, 195, 291, 110, 211, 390, 280, 112,
]

export const dummyMonthlyTarget = {
  percent: 75.55,
  delta: 10,
  earnedToday: 3287,
  target: 20000,
  revenue: 20000,
  today: 20000,
  targetTrend: 'down' as const,
  revenueTrend: 'up' as const,
  todayTrend: 'up' as const,
}

export const dummyStats = {
  customers: { value: 3782, change: 11.01 },
  orders: { value: 5359, change: -9.05 },
}

export type StatisticsTab = 'overview' | 'sales' | 'revenue'

export const dummyStatistics: Record<
  StatisticsTab,
  { a: number[]; b: number[] }
> = {
  overview: {
    a: [180, 190, 170, 160, 175, 165, 180, 205, 230, 210, 240, 235],
    b: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
  },
  sales: {
    a: [120, 150, 140, 180, 160, 200, 190, 220, 210, 240, 260, 250],
    b: [60, 70, 65, 90, 80, 100, 95, 110, 120, 130, 140, 150],
  },
  revenue: {
    a: [200, 180, 220, 210, 250, 240, 270, 260, 300, 290, 320, 310],
    b: [90, 80, 100, 110, 120, 115, 140, 150, 160, 170, 180, 190],
  },
}

/** ISO 3166-1 alpha-2 codes; names/flags are derived at render time. */
export const dummyDemographic = [
  { country: 'US', customers: 2379, percent: 40.99 },
  { country: 'FR', customers: 589, percent: 59.01 },
  { country: 'YE', customers: 412, percent: 32.4 },
]

export const dummyOrders = [
  {
    id: '1',
    product: 'TailGrids',
    category: 'UI Kits',
    country: 'US',
    cr: 'Dashboard',
    value: 12499,
  },
  {
    id: '2',
    product: 'GrayGrids',
    category: 'Templates',
    country: 'GB',
    cr: 'Dashboard',
    value: 5498,
  },
  {
    id: '3',
    product: 'Uideck',
    category: 'Templates',
    country: 'SD',
    cr: 'Dashboard',
    value: 4621,
  },
  {
    id: '4',
    product: 'FormBold',
    category: 'SaaS',
    country: 'BD',
    cr: 'Dashboard',
    value: 13843,
  },
  {
    id: '5',
    product: 'NextAdmin',
    category: 'Templates',
    country: 'IS',
    cr: 'Dashboard',
    value: 7523,
  },
  {
    id: '6',
    product: 'Form Builder',
    category: 'Templates',
    country: 'NO',
    cr: 'Dashboard',
    value: 1377,
  },
  {
    id: '7',
    product: 'AyroUI',
    category: 'Templates',
    country: 'FR',
    cr: 'Dashboard',
    value: 599,
  },
]

/** Stacked series per month: bottom → top = referral, organic, direct. */
export const dummyChannels = {
  months: [0, 1, 2, 3, 4, 5, 6],
  referral: [28, 35, 18, 68, 24, 28, 28],
  organic: [28, 30, 34, 15, 25, 28, 28],
  direct: [48, 30, 62, 22, 36, 48, 48],
  total: 120000,
}

export const dummyDevices = [
  { key: 'desktop', value: 45 },
  { key: 'mobile', value: 70 },
  { key: 'tablet', value: 20 },
] as const
