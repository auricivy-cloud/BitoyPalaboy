import { Product, StoreSettings, Transaction } from '../types/pos';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'BitoyPalaboy Coffee Bar',
  tagline: 'Artisan Roastery & Neighborhood Provisions',
  addressLine1: 'Ground Floor, High Street South',
  addressLine2: 'BGC, Taguig, Metro Manila 1634',
  phone: '+63 (2) 8555-0182',
  taxId: 'TIN: 294-819-301-00000 VAT',
  taxRatePercent: 12,
  currencySymbol: '₱',
  receiptHeader: 'WELCOME TO BITOYPALABOY COFFEE BAR',
  receiptFooter: 'Maraming salamat sa pagtangkilik!\nReturn merchandise within 14 days with official receipt.\nGuest Wi-Fi: BitoyPalaboyGuest / Pass: freshbeans',
  cashierName: 'Avery Chen',
  registerNumber: 'REG-01',
  autoPrintReceipt: true,
  soundEnabled: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  // COFFEE & ESPRESSO
  {
    id: 'prod-1',
    name: 'Single Origin Pour-Over',
    sku: 'COF-POUR-01',
    category: 'coffee',
    price: 190,
    cost: 50,
    stock: 84,
    lowStockThreshold: 20,
    barcode: '89012345601',
    description: 'Rotating micro-lot Ethiopian or Sagada Benguet beans hand-dripped to order.',
    badge: 'Popular',
    modifiers: [
      {
        id: 'mod-size',
        name: 'Size',
        options: [
          { name: '12 oz Standard', priceDelta: 0 },
          { name: '16 oz Large', priceDelta: 30 },
        ],
      },
      {
        id: 'mod-milk',
        name: 'Milk Splash',
        options: [
          { name: 'None (Black)', priceDelta: 0 },
          { name: 'Oat Milk Splash', priceDelta: 25 },
          { name: 'Fresh Milk Splash', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'Artisan Honey Oat Latte',
    sku: 'COF-OAT-LAT',
    category: 'coffee',
    price: 210,
    cost: 60,
    stock: 96,
    lowStockThreshold: 15,
    barcode: '89012345602',
    description: 'Double espresso with steamed Minor Figures oat milk and raw wildflower honey.',
    badge: 'Bestseller',
    modifiers: [
      {
        id: 'mod-temp',
        name: 'Temperature',
        options: [
          { name: 'Hot', priceDelta: 0 },
          { name: 'Iced', priceDelta: 15 },
        ],
      },
      {
        id: 'mod-shot',
        name: 'Espresso Shots',
        options: [
          { name: 'Double (Standard)', priceDelta: 0 },
          { name: 'Extra Shot (+1)', priceDelta: 40 },
          { name: 'Decaf Blend', priceDelta: 0 },
        ],
      },
      {
        id: 'mod-syrup',
        name: 'Flavors',
        options: [
          { name: 'Wildflower Honey (Standard)', priceDelta: 0 },
          { name: 'Madagascar Vanilla Bean', priceDelta: 30 },
          { name: 'Brown Sugar Cardamom', priceDelta: 30 },
        ],
      },
    ],
  },
  {
    id: 'prod-3',
    name: 'Flat White (6oz)',
    sku: 'COF-FLAT-01',
    category: 'coffee',
    price: 175,
    cost: 45,
    stock: 120,
    lowStockThreshold: 20,
    barcode: '89012345603',
    description: 'Ristretto double shot with velvety micro-foam texture.',
    modifiers: [
      {
        id: 'mod-milk-type',
        name: 'Milk Choice',
        options: [
          { name: 'Fresh Milk', priceDelta: 0 },
          { name: 'Oat Milk', priceDelta: 30 },
          { name: 'Almond Milk', priceDelta: 30 },
        ],
      },
    ],
  },
  {
    id: 'prod-4',
    name: 'Cold Brew Reserve',
    sku: 'COF-COLD-01',
    category: 'coffee',
    price: 180,
    cost: 40,
    stock: 65,
    lowStockThreshold: 15,
    barcode: '89012345604',
    description: '20-hour slow steeped cold brew with dark chocolate and hazelnut notes.',
    modifiers: [
      {
        id: 'mod-cold-foam',
        name: 'Sweet Cream Top',
        options: [
          { name: 'None', priceDelta: 0 },
          { name: 'Vanilla Cold Foam', priceDelta: 35 },
          { name: 'Salted Caramel Foam', priceDelta: 35 },
        ],
      },
    ],
  },
  {
    id: 'prod-5',
    name: 'Matcha Cloud Latte',
    sku: 'COF-MATCHA-01',
    category: 'coffee',
    price: 220,
    cost: 65,
    stock: 42,
    lowStockThreshold: 10,
    barcode: '89012345605',
    description: 'Ceremonial grade Uji matcha whisked with oat milk and a touch of agave.',
    badge: 'Trending',
  },

  // BAKERY
  {
    id: 'prod-6',
    name: 'Cardamom Morning Bun',
    sku: 'BAK-BUN-01',
    category: 'bakery',
    price: 145,
    cost: 45,
    stock: 14,
    lowStockThreshold: 10,
    barcode: '89012345606',
    description: 'Flaky laminated brioche rolled with cracked green cardamom and spiced sugar.',
    badge: 'Fresh Daily',
  },
  {
    id: 'prod-7',
    name: 'Kouign-Amann Caramelized',
    sku: 'BAK-KOUIGN-01',
    category: 'bakery',
    price: 160,
    cost: 50,
    stock: 8,
    lowStockThreshold: 10,
    barcode: '89012345607',
    description: 'Breton butter pastry layered with caramelized sugar crust.',
    badge: 'Low Stock',
  },
  {
    id: 'prod-8',
    name: 'Sourdough Butter Croissant',
    sku: 'BAK-CROISS-01',
    category: 'bakery',
    price: 140,
    cost: 40,
    stock: 22,
    lowStockThreshold: 8,
    barcode: '89012345608',
    description: 'French butter croissant with 72-hour slow cold fermentation.',
  },
  {
    id: 'prod-9',
    name: 'Sea Salt Dark Choc Cookie',
    sku: 'BAK-COOKIE-01',
    category: 'bakery',
    price: 115,
    cost: 35,
    stock: 28,
    lowStockThreshold: 10,
    barcode: '89012345609',
    description: 'Brown butter dough packed with Valrhona 70% dark chocolate and flaky salt.',
  },
  {
    id: 'prod-10',
    name: 'Lemon Poppyseed Loaf Slice',
    sku: 'BAK-LOAF-01',
    category: 'bakery',
    price: 135,
    cost: 40,
    stock: 6,
    lowStockThreshold: 8,
    barcode: '89012345610',
    description: 'Zesty lemon loaf with fresh Meyer lemon glaze and toasted poppy seeds.',
    badge: 'Low Stock',
  },

  // BREAKFAST & SANDWICHES
  {
    id: 'prod-11',
    name: 'Avocado & Furikake Tartine',
    sku: 'BRK-AVO-01',
    category: 'breakfast',
    price: 295,
    cost: 90,
    stock: 45,
    lowStockThreshold: 12,
    barcode: '89012345611',
    description: 'Country sourdough, smashed Hass avocado, Japanese furikake, pickled shallots, microgreens.',
    modifiers: [
      {
        id: 'mod-egg',
        name: 'Add Egg',
        options: [
          { name: 'No Egg', priceDelta: 0 },
          { name: 'Soft-Poached Egg', priceDelta: 45 },
        ],
      },
    ],
  },
  {
    id: 'prod-12',
    name: 'Smoked Salmon Sourdough Bagel',
    sku: 'BRK-SALMON-01',
    category: 'breakfast',
    price: 360,
    cost: 120,
    stock: 32,
    lowStockThreshold: 10,
    barcode: '89012345612',
    description: 'Wild Alaskan cold-smoked salmon, dill whipped cream cheese, caper berries, red onion.',
  },
  {
    id: 'prod-13',
    name: 'Prosciutto & Gruyère Panini',
    sku: 'BRK-PANINI-01',
    category: 'breakfast',
    price: 325,
    cost: 100,
    stock: 25,
    lowStockThreshold: 8,
    barcode: '89012345613',
    description: 'Toasted focaccia, Prosciutto di Parma, cave-aged Gruyère, fig jam, arugula.',
  },

  // TEAS & COLD DRINKS
  {
    id: 'prod-14',
    name: 'Sparkling Hibiscus Fizz',
    sku: 'TEA-HIBISCUS-01',
    category: 'cold_drinks',
    price: 160,
    cost: 35,
    stock: 58,
    lowStockThreshold: 15,
    barcode: '89012345614',
    description: 'Egyptian wild hibiscus, fresh calamansi zest, sparkling water and organic cane syrup.',
  },
  {
    id: 'prod-15',
    name: 'Iced Golden Turmeric Tonic',
    sku: 'TEA-TURMERIC-01',
    category: 'cold_drinks',
    price: 180,
    cost: 45,
    stock: 36,
    lowStockThreshold: 10,
    barcode: '89012345615',
    description: 'Cold-pressed turmeric, ginger root, cracked black pepper, coconut milk, raw honey.',
  },
  {
    id: 'prod-16',
    name: 'Organic Sencha Green Tea',
    sku: 'TEA-SENCHA-01',
    category: 'cold_drinks',
    price: 150,
    cost: 30,
    stock: 70,
    lowStockThreshold: 15,
    barcode: '89012345616',
    description: 'First harvest Japanese green tea leaves steeped at 165°F.',
  },

  // RETAIL BEANS & MERCH
  {
    id: 'prod-17',
    name: 'Ethiopia Yirgacheffe 250g Whole Bean',
    sku: 'RET-BEAN-ETH',
    category: 'retail',
    price: 680,
    cost: 280,
    stock: 26,
    lowStockThreshold: 10,
    barcode: '89012345617',
    description: 'Washed process heirloom variety. Jasmine blossom, bergamot, peach nectar.',
    badge: 'Specialty Roast',
  },
  {
    id: 'prod-18',
    name: 'Colombia Huila Pink Bourbon 250g',
    sku: 'RET-BEAN-COL',
    category: 'retail',
    price: 720,
    cost: 300,
    stock: 18,
    lowStockThreshold: 8,
    barcode: '89012345618',
    description: 'Anaerobic natural fermentation. Pink guava, red currant, panela sugar.',
  },
  {
    id: 'prod-19',
    name: 'Matte Ceramic Travel Tumbler 12oz',
    sku: 'RET-MUG-01',
    category: 'retail',
    price: 850,
    cost: 350,
    stock: 15,
    lowStockThreshold: 5,
    barcode: '89012345619',
    description: 'Double-wall vacuum insulated with splash-proof lid and ceramic interior coating.',
  },
  {
    id: 'prod-20',
    name: 'Heavyweight Canvas Tote',
    sku: 'RET-TOTE-01',
    category: 'retail',
    price: 450,
    cost: 160,
    stock: 4,
    lowStockThreshold: 10,
    barcode: '89012345620',
    description: '100% organic cotton 14oz canvas screenprinted with hand-drawn botanical crest.',
    badge: 'Low Stock',
  },
];

// Helper to seed realistic transactions spanning past days and current day (2026-10-04)
export function generateSeedTransactions(): Transaction[] {
  const transactions: Transaction[] = [];

  const now = new Date('2026-10-04T12:45:00'); // Baseline current time

  interface SeedTemplate {
    daysAgo: number;
    hour: number;
    minute: number;
    productIndices: number[];
    quantities: number[];
    payment: 'cash' | 'card' | 'mobile';
    orderType: 'dine_in' | 'takeout' | 'pickup';
    customer?: string;
  }

  const templates: SeedTemplate[] = [
    // TODAY (Oct 04, 2026) - Morning & Lunch Rush
    { daysAgo: 0, hour: 7, minute: 15, productIndices: [1, 5], quantities: [1, 1], payment: 'card', orderType: 'takeout', customer: 'Liam S.' },
    { daysAgo: 0, hour: 7, minute: 34, productIndices: [0, 7], quantities: [2, 1], payment: 'mobile', orderType: 'takeout', customer: 'Elena R.' },
    { daysAgo: 0, hour: 8, minute: 2, productIndices: [1, 6], quantities: [1, 2], payment: 'card', orderType: 'dine_in', customer: 'Marcus Vance' },
    { daysAgo: 0, hour: 8, minute: 25, productIndices: [10, 2], quantities: [1, 1], payment: 'card', orderType: 'dine_in', customer: 'Dr. Sarah K.' },
    { daysAgo: 0, hour: 8, minute: 50, productIndices: [3, 8], quantities: [2, 2], payment: 'cash', orderType: 'takeout', customer: 'Walk-in Cash' },
    { daysAgo: 0, hour: 9, minute: 12, productIndices: [16], quantities: [1], payment: 'card', orderType: 'pickup', customer: 'Nathan B.' },
    { daysAgo: 0, hour: 9, minute: 40, productIndices: [4, 9, 13], quantities: [1, 1, 1], payment: 'mobile', orderType: 'takeout', customer: 'Sophia T.' },
    { daysAgo: 0, hour: 10, minute: 15, productIndices: [1, 11], quantities: [1, 1], payment: 'card', orderType: 'dine_in', customer: 'Daniel Wu' },
    { daysAgo: 0, hour: 10, minute: 48, productIndices: [0, 8], quantities: [1, 1], payment: 'cash', orderType: 'takeout' },
    { daysAgo: 0, hour: 11, minute: 20, productIndices: [12, 3], quantities: [1, 1], payment: 'card', orderType: 'dine_in', customer: 'Hannah Miller' },
    { daysAgo: 0, hour: 11, minute: 55, productIndices: [10, 14, 8], quantities: [1, 1, 2], payment: 'mobile', orderType: 'dine_in', customer: 'Oliver Grey' },
    { daysAgo: 0, hour: 12, minute: 18, productIndices: [12, 1, 18], quantities: [1, 1, 1], payment: 'card', orderType: 'dine_in', customer: 'Claire Bennett' },
    { daysAgo: 0, hour: 12, minute: 38, productIndices: [11, 4], quantities: [1, 1], payment: 'card', orderType: 'takeout', customer: 'Ethan Cross' },

    // YESTERDAY (Oct 03, 2026) - Full Saturday Trade
    { daysAgo: 1, hour: 7, minute: 45, productIndices: [0, 5], quantities: [1, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 1, hour: 8, minute: 10, productIndices: [1, 6], quantities: [2, 2], payment: 'mobile', orderType: 'dine_in' },
    { daysAgo: 1, hour: 8, minute: 40, productIndices: [10, 2], quantities: [2, 2], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 1, hour: 9, minute: 15, productIndices: [16, 1], quantities: [1, 1], payment: 'card', orderType: 'pickup' },
    { daysAgo: 1, hour: 9, minute: 50, productIndices: [11, 3], quantities: [1, 2], payment: 'cash', orderType: 'dine_in' },
    { daysAgo: 1, hour: 10, minute: 30, productIndices: [17, 18], quantities: [1, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 1, hour: 11, minute: 10, productIndices: [12, 4, 8], quantities: [2, 2, 2], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 1, hour: 12, minute: 5, productIndices: [10, 13], quantities: [1, 1], payment: 'mobile', orderType: 'dine_in' },
    { daysAgo: 1, hour: 13, minute: 20, productIndices: [1, 8], quantities: [2, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 1, hour: 14, minute: 45, productIndices: [3, 14], quantities: [1, 1], payment: 'cash', orderType: 'takeout' },
    { daysAgo: 1, hour: 16, minute: 10, productIndices: [16], quantities: [2], payment: 'card', orderType: 'pickup' },

    // 2 DAYS AGO (Oct 02, 2026)
    { daysAgo: 2, hour: 8, minute: 5, productIndices: [1, 7], quantities: [1, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 2, hour: 8, minute: 55, productIndices: [0, 5], quantities: [2, 1], payment: 'mobile', orderType: 'takeout' },
    { daysAgo: 2, hour: 9, minute: 30, productIndices: [10, 2], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 2, hour: 11, minute: 45, productIndices: [12, 3], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 2, hour: 13, minute: 15, productIndices: [4, 8], quantities: [1, 2], payment: 'cash', orderType: 'takeout' },
    { daysAgo: 2, hour: 15, minute: 0, productIndices: [17], quantities: [1], payment: 'card', orderType: 'takeout' },

    // 3 DAYS AGO (Oct 01, 2026)
    { daysAgo: 3, hour: 7, minute: 30, productIndices: [2, 6], quantities: [1, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 3, hour: 8, minute: 45, productIndices: [1, 10], quantities: [1, 1], payment: 'mobile', orderType: 'dine_in' },
    { daysAgo: 3, hour: 10, minute: 20, productIndices: [0, 8], quantities: [2, 1], payment: 'cash', orderType: 'takeout' },
    { daysAgo: 3, hour: 12, minute: 30, productIndices: [11, 4], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 3, hour: 14, minute: 15, productIndices: [16, 18], quantities: [1, 1], payment: 'card', orderType: 'pickup' },

    // 4 DAYS AGO (Sept 30, 2026)
    { daysAgo: 4, hour: 8, minute: 15, productIndices: [1, 5], quantities: [1, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 4, hour: 9, minute: 0, productIndices: [0, 7], quantities: [1, 2], payment: 'mobile', orderType: 'takeout' },
    { daysAgo: 4, hour: 11, minute: 30, productIndices: [12, 2], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 4, hour: 13, minute: 40, productIndices: [3, 8], quantities: [1, 1], payment: 'cash', orderType: 'takeout' },

    // 5 DAYS AGO (Sept 29, 2026)
    { daysAgo: 5, hour: 8, minute: 30, productIndices: [2, 6], quantities: [2, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 5, hour: 10, minute: 5, productIndices: [10, 4], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 5, hour: 12, minute: 15, productIndices: [11, 1], quantities: [1, 1], payment: 'mobile', orderType: 'takeout' },
    { daysAgo: 5, hour: 15, minute: 20, productIndices: [17], quantities: [2], payment: 'card', orderType: 'pickup' },

    // 6 DAYS AGO (Sept 28, 2026)
    { daysAgo: 6, hour: 7, minute: 50, productIndices: [0, 5], quantities: [1, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 6, hour: 9, minute: 20, productIndices: [1, 8], quantities: [1, 2], payment: 'cash', orderType: 'takeout' },
    { daysAgo: 6, hour: 11, minute: 45, productIndices: [12, 3], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },

    // 7 - 14 DAYS AGO (Sept 20 - Sept 27)
    { daysAgo: 7, hour: 8, minute: 10, productIndices: [1, 6], quantities: [1, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 8, hour: 9, minute: 20, productIndices: [10, 2], quantities: [1, 1], payment: 'mobile', orderType: 'dine_in' },
    { daysAgo: 9, hour: 11, minute: 40, productIndices: [11, 4], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 10, hour: 8, minute: 30, productIndices: [0, 7], quantities: [2, 1], payment: 'cash', orderType: 'takeout' },
    { daysAgo: 11, hour: 12, minute: 15, productIndices: [12, 1], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 12, hour: 14, minute: 50, productIndices: [16, 18], quantities: [1, 1], payment: 'card', orderType: 'pickup' },
    { daysAgo: 13, hour: 8, minute: 0, productIndices: [2, 5], quantities: [1, 1], payment: 'card', orderType: 'takeout' },
    { daysAgo: 14, hour: 10, minute: 30, productIndices: [1, 8], quantities: [1, 2], payment: 'mobile', orderType: 'takeout' },

    // 15 - 28 DAYS AGO (Sept 6 - Sept 19)
    { daysAgo: 16, hour: 8, minute: 45, productIndices: [1, 6], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 18, hour: 9, minute: 15, productIndices: [0, 8], quantities: [2, 1], payment: 'cash', orderType: 'takeout' },
    { daysAgo: 21, hour: 11, minute: 30, productIndices: [10, 3], quantities: [1, 1], payment: 'card', orderType: 'dine_in' },
    { daysAgo: 24, hour: 12, minute: 40, productIndices: [12, 4], quantities: [1, 1], payment: 'mobile', orderType: 'dine_in' },
    { daysAgo: 27, hour: 14, minute: 20, productIndices: [17, 18], quantities: [1, 1], payment: 'card', orderType: 'pickup' },
  ];

  let receiptSequence = 1042;

  templates.forEach((tmpl, idx) => {
    receiptSequence++;
    const txDate = new Date(now);
    txDate.setDate(txDate.getDate() - tmpl.daysAgo);
    txDate.setHours(tmpl.hour, tmpl.minute, 15 + (idx % 40), 0);

    const items = tmpl.productIndices.map((prodIdx, pIdx) => {
      const product = INITIAL_PRODUCTS[prodIdx] || INITIAL_PRODUCTS[0];
      const qty = tmpl.quantities[pIdx] || 1;
      return {
        id: `seed-cart-${idx}-${pIdx}`,
        product,
        quantity: qty,
        selectedModifiers: [],
        unitPrice: product.price,
        totalPrice: Number((product.price * qty).toFixed(2)),
      };
    });

    const subtotal = Number(items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
    const totalCost = Number(items.reduce((sum, item) => sum + item.product.cost * item.quantity, 0).toFixed(2));
    const taxRate = 0.12; // 12% Philippine VAT
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));
    const grossProfit = Number((subtotal - totalCost).toFixed(2));

    const tenderDetails = {
      method: tmpl.payment,
      amountTendered: tmpl.payment === 'cash' ? Math.ceil(total / 100) * 100 : total,
      changeDue: tmpl.payment === 'cash' ? Number(((Math.ceil(total / 100) * 100) - total).toFixed(2)) : 0,
      cardBrand: tmpl.payment === 'card' ? (idx % 2 === 0 ? 'Visa' : 'Mastercard') : undefined,
      cardLast4: tmpl.payment === 'card' ? `${1000 + (idx * 37) % 9000}` : undefined,
      authCode: tmpl.payment !== 'cash' ? `AUTH${840000 + idx}` : undefined,
    };

    transactions.push({
      id: `tx-${idx + 1}-${receiptSequence}`,
      receiptNumber: `BP-${receiptSequence}`,
      timestamp: txDate.toISOString(),
      items,
      subtotal,
      discountType: 'none',
      discountValue: 0,
      discountAmount: 0,
      taxRate,
      taxAmount,
      tipAmount: 0,
      total,
      totalCost,
      grossProfit,
      paymentMethod: tmpl.payment,
      tenderDetails,
      orderType: tmpl.orderType,
      customerName: tmpl.customer || (tmpl.orderType === 'dine_in' ? 'Table Guest' : 'Walk-in Guest'),
      customerContact: tmpl.customer ? `${tmpl.customer.toLowerCase().replace(/\s+/g, '')}@gmail.com` : undefined,
      cashierName: 'Avery Chen',
      status: 'completed',
    });
  });

  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
