import type { TranslationKey } from './en'

/** Burmese (Myanmar) – must define every key present in `en`. */
export const my: Record<TranslationKey, string> = {
  // App
  'app.title': 'အလင်းရောင်',

  // User menu
  'userMenu.trigger': 'အသုံးပြုသူ မီနူး ဖွင့်ရန်',
  'userMenu.label': 'အသုံးပြုသူ မီနူး',
  'userMenu.editProfile': 'ပရိုဖိုင် ပြင်ရန်',
  'userMenu.accountSettings': 'အကောင့် ဆက်တင်များ',
  'userMenu.support': 'အကူအညီ',
  'userMenu.language': 'ဘာသာစကား',
  'userMenu.signOut': 'ထွက်ရန်',

  // Sidebar
  'sidebar.nav': 'အဓိက',
  'sidebar.close': 'ဘေးဘားကို ပိတ်ရန်',
  'sidebar.dashboard': 'ဒက်ရှ်ဘုတ်',
  'sidebar.products': 'ကုန်ပစ္စည်းများ',
  'sidebar.products.all': 'ကုန်ပစ္စည်းအားလုံး',
  'sidebar.products.categories': 'အမျိုးအစားများ',
  'sidebar.customers': 'ဖောက်သည်များ',
  'sidebar.settings': 'ဆက်တင်များ',

  // Header
  'header.toggleSidebar': 'ဘေးဘား ဖွင့်/ပိတ်ရန်',
  'header.toggleActions': 'လုပ်ဆောင်ချက်များ ဖွင့်/ပိတ်ရန်',
  'header.switchToDark': 'အမှောင် မုဒ်သို့ ပြောင်းရန်',
  'header.switchToLight': 'အလင်း မုဒ်သို့ ပြောင်းရန်',

  // Common UI / States
  'common.noItems': 'ပစ္စည်း မရှိပါ',
  'common.somethingWentWrong': 'တစ်ခုခု မှားယွင်းသွားပါသည်',
  'common.retry': 'ထပ်စမ်းရန်',
  'common.loadMore': 'နောက်ထပ် ပြရန်',

  // Dashboard
  'dashboard.title': 'ဒက်ရှ်ဘုတ်',
  'dashboard.description':
    'လျှပ်စစ်ပစ္စည်းဆိုင်၏ ကုန်ပစ္စည်းစာရင်း အကျဉ်းချုပ်။',
  'dashboard.currentStock': 'လက်ရှိ ကုန်ပစ္စည်းများ',
  'dashboard.cardListDemo': 'ကတ်စာရင်း စမ်းသပ်မှု (ပစ္စည်း ၁၀,၀၀၀)',
  'dashboard.customers': 'ဖောက်သည်များ',
  'dashboard.orders': 'အော်ဒါများ',
  'dashboard.trendUp': 'တိုးလာသည်',
  'dashboard.trendDown': 'လျော့ကျသည်',
  'dashboard.moreOptions': 'နောက်ထပ် ရွေးချယ်စရာများ',
  'dashboard.monthlySales': 'လစဉ် ရောင်းအား',
  'dashboard.monthlyTarget': 'လစဉ် ပစ်မှတ်',
  'dashboard.monthlyTargetSubtitle': 'လတိုင်းအတွက် သတ်မှတ်ထားသော ပစ်မှတ်',
  'dashboard.targetMessage':
    'ယနေ့ {amount} ရရှိခဲ့ပြီး ပြီးခဲ့သည့်လထက် ပိုမြင့်သည်။ ဆက်လက်ကြိုးစားပါ။',
  'dashboard.target': 'ပစ်မှတ်',
  'dashboard.revenue': 'ဝင်ငွေ',
  'dashboard.today': 'ယနေ့',
  'dashboard.statistics': 'စာရင်းအင်း',
  'dashboard.statisticsSubtitle': 'လတိုင်းအတွက် သတ်မှတ်ထားသော ပစ်မှတ်',
  'dashboard.tab.overview': 'အနှစ်ချုပ်',
  'dashboard.tab.sales': 'ရောင်းအား',
  'dashboard.tab.revenue': 'ဝင်ငွေ',
  'dashboard.dateRange': 'ရက်စွဲ အပိုင်းအခြား',
  'dashboard.progress': 'လစဉ် ပစ်မှတ် တိုးတက်မှု',
  'dashboard.customersDemographic': 'ဖောက်သည် လူဦးရေအချက်အလက်',
  'dashboard.customersDemographicSubtitle': 'နိုင်ငံအလိုက် ဖောက်သည်အရေအတွက်',
  'dashboard.customersCount': 'ဖောက်သည် {count} ဦး',
  'dashboard.map': 'ဖောက်သည်တည်နေရာ ကမ္ဘာ့မြေပုံ',
  'dashboard.recentOrders': 'လတ်တလော အော်ဒါများ',
  'dashboard.filter': 'စစ်ထုတ်ရန်',
  'dashboard.seeAll': 'အားလုံးကြည့်ရန်',
  'dashboard.col.products': 'ကုန်ပစ္စည်းများ',
  'dashboard.col.category': 'အမျိုးအစား',
  'dashboard.col.country': 'နိုင်ငံ',
  'dashboard.col.cr': 'CR',
  'dashboard.col.value': 'တန်ဖိုး',
  'dashboard.acquisitionChannels': 'ဖောက်သည်ရယူသည့် လမ်းကြောင်းများ',
  'dashboard.direct': 'တိုက်ရိုက်',
  'dashboard.organic': 'သဘာဝ',
  'dashboard.referral': 'ရည်ညွှန်းမှု',
  'dashboard.totalValue': 'စုစုပေါင်း - {total}',
  'dashboard.sessionsByDevice': 'စက်အလိုက် အသုံးပြုမှု',
  'dashboard.desktop': 'ဒက်စ်တော့',
  'dashboard.mobile': 'မိုဘိုင်း',
  'dashboard.tablet': 'တက်ဘလက်',
  'dashboard.total': 'စုစုပေါင်း',

  // Inventory
  'inventory.noItems': 'ကုန်ပစ္စည်းစာရင်းတွင် ပစ္စည်း မရှိသေးပါ။',
  'inventory.noMatchingItems': 'ကိုက်ညီသော ပစ္စည်း မရှိပါ။',
  'inventory.endOfInventory': 'ကုန်ပစ္စည်းစာရင်း ပြီးဆုံးပါပြီ',
  'inventory.search': 'ပစ္စည်းများ ရှာဖွေရန်',
  'inventory.searchPlaceholder': 'ပစ္စည်းများ ရှာဖွေရန်…',
  'inventory.lowStock': 'လက်ကျန်နည်း',
  'inventory.lowStockOnly': 'လက်ကျန်နည်းပစ္စည်းများသာ',
  'inventory.filter.searchMax': 'ရှာဖွေမှုကို စာလုံးရေ ၆၀ အထိ ကန့်သတ်ထားသည်',

  // Demo / Controls
  'demo.dataSource': 'ဒေတာ ရင်းမြစ်',
  'demo.tabDexie': 'Dexie (အော့ဖ်လိုင်း)',
  'demo.tabQuery': 'TanStack Query',
  'demo.addItem': 'ပစ္စည်း အသစ်ထည့်ရန်',
  'demo.editFirst': 'ပထမပစ္စည်းကို ပြင်ရန်',
  'demo.deleteFirst': 'ပထမပစ္စည်းကို ဖျက်ရန်',
  'demo.domStats':
    'ပစ္စည်း {total} ခု ဖတ်ရှုပြီး · ကတ် {cards} ခု ပြသထားသည် · စာရင်းထဲတွင် DOM node {nodes} ခု ရှိသည်',

  // Announcements
  'cardList.itemsLoaded':
    'နောက်ထပ် ပစ္စည်း {count} ခု ရယူပြီး၊ စုစုပေါင်း {total} ခု',
}
