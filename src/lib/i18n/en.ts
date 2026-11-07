/** English – source of truth for translation keys. */
export const en = {
  // App
  'app.title': 'A-Lin Young',

  // User menu
  'userMenu.trigger': 'Open user menu',
  'userMenu.label': 'User menu',
  'userMenu.editProfile': 'Edit profile',
  'userMenu.accountSettings': 'Account settings',
  'userMenu.support': 'Support',
  'userMenu.language': 'Language',
  'userMenu.signOut': 'Sign out',

  // Sidebar
  'sidebar.nav': 'Main',
  'sidebar.close': 'Close sidebar',
  'sidebar.dashboard': 'Dashboard',
  'sidebar.products': 'Products',
  'sidebar.products.all': 'All products',
  'sidebar.products.categories': 'Categories',
  'sidebar.customers': 'Customers',
  'sidebar.settings': 'Settings',

  // Header
  'header.toggleSidebar': 'Toggle sidebar',
  'header.toggleActions': 'Toggle header actions',
  'header.switchToDark': 'Switch to dark mode',
  'header.switchToLight': 'Switch to light mode',

  // Common UI / States
  'common.noItems': 'No items',
  'common.somethingWentWrong': 'Something went wrong.',
  'common.retry': 'Retry',
  'common.loadMore': 'Load more',

  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.description': 'Overview of your electrical shop inventory.',
  'dashboard.currentStock': 'Current Stock',
  'dashboard.cardListDemo': 'Card list demo (10,000 items)',
  'dashboard.customers': 'Customers',
  'dashboard.orders': 'Orders',
  'dashboard.trendUp': 'Increase',
  'dashboard.trendDown': 'Decrease',
  'dashboard.moreOptions': 'More options',
  'dashboard.monthlySales': 'Monthly Sales',
  'dashboard.monthlyTarget': 'Monthly Target',
  'dashboard.monthlyTargetSubtitle': "Target you've set for each month",
  'dashboard.targetMessage':
    "You earn {amount} today, it's higher than last month. Keep up your good work!",
  'dashboard.target': 'Target',
  'dashboard.revenue': 'Revenue',
  'dashboard.today': 'Today',
  'dashboard.statistics': 'Statistics',
  'dashboard.statisticsSubtitle': "Target you've set for each month",
  'dashboard.tab.overview': 'Overview',
  'dashboard.tab.sales': 'Sales',
  'dashboard.tab.revenue': 'Revenue',
  'dashboard.dateRange': 'Date range',
  'dashboard.progress': 'Monthly target progress',
  'dashboard.customersDemographic': 'Customers Demographic',
  'dashboard.customersDemographicSubtitle':
    'Number of customer based on country',
  'dashboard.customersCount': '{count} Customers',
  'dashboard.map': 'World map of customer locations',
  'dashboard.recentOrders': 'Recent Orders',
  'dashboard.filter': 'Filter',
  'dashboard.seeAll': 'See all',
  'dashboard.col.products': 'Products',
  'dashboard.col.category': 'Category',
  'dashboard.col.country': 'Country',
  'dashboard.col.cr': 'CR',
  'dashboard.col.value': 'Value',
  'dashboard.acquisitionChannels': 'Acquisition Channels',
  'dashboard.direct': 'Direct',
  'dashboard.organic': 'Organic',
  'dashboard.referral': 'Referral',
  'dashboard.totalValue': 'Total: {total}',
  'dashboard.sessionsByDevice': 'Sessions By Device',
  'dashboard.desktop': 'Desktop',
  'dashboard.mobile': 'Mobile',
  'dashboard.tablet': 'Tablet',
  'dashboard.total': 'Total',

  // Inventory
  'inventory.noItems': 'No items in inventory.',
  'inventory.noMatchingItems': 'No matching items.',
  'inventory.endOfInventory': 'End of inventory',
  'inventory.search': 'Search items',
  'inventory.searchPlaceholder': 'Search items…',
  'inventory.lowStock': 'low',
  'inventory.lowStockOnly': 'Low stock only',
  'inventory.filter.searchMax': 'Search is limited to 60 characters',

  // Demo / Controls
  'demo.dataSource': 'Data source',
  'demo.tabDexie': 'Dexie (offline)',
  'demo.tabQuery': 'TanStack Query',
  'demo.addItem': 'Add item',
  'demo.editFirst': 'Edit first item',
  'demo.deleteFirst': 'Delete first item',
  'demo.domStats':
    'Loaded {total} items · rendered {cards} cards · {nodes} DOM nodes in the list',

  // Announcements
  'cardList.itemsLoaded': '{count} more items loaded, {total} total',
} as const

export type TranslationKey = keyof typeof en
