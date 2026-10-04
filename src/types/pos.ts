export interface ProductModifier {
  id: string;
  name: string;
  options: {
    name: string;
    priceDelta: number;
  }[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'coffee' | 'bakery' | 'breakfast' | 'cold_drinks' | 'retail';
  price: number;
  cost: number; // Cost of goods sold (COGS)
  stock: number;
  lowStockThreshold: number;
  barcode: string;
  description: string;
  badge?: string;
  modifiers?: ProductModifier[];
}

export interface SelectedModifier {
  groupName: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique item cart instance id
  product: Product;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  unitPrice: number; // base price + modifiers
  totalPrice: number;
  itemNote?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'split';
export type OrderType = 'dine_in' | 'takeout' | 'pickup';
export type OrderStatus = 'completed' | 'refunded';

export interface TenderDetails {
  method: PaymentMethod;
  amountTendered: number;
  changeDue: number;
  cardBrand?: string;
  cardLast4?: string;
  authCode?: string;
  secondaryMethod?: PaymentMethod;
  secondaryAmount?: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  timestamp: string; // ISO string
  items: CartItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  discountAmount: number;
  taxRate: number; // e.g. 0.0825
  taxAmount: number;
  tipAmount: number;
  total: number;
  totalCost: number; // Total COGS for gross margin
  grossProfit: number;
  paymentMethod: PaymentMethod;
  tenderDetails: TenderDetails;
  orderType: OrderType;
  customerName?: string;
  customerContact?: string;
  cashierName: string;
  orderNote?: string;
  status: OrderStatus;
}

export interface ParkedOrder {
  id: string;
  timestamp: string;
  name: string;
  items: CartItem[];
  orderType: OrderType;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  orderNote?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  taxId: string; // e.g. EIN / Sales Tax ID
  taxRatePercent: number; // e.g. 8.25
  currencySymbol: string;
  receiptHeader: string;
  receiptFooter: string;
  cashierName: string;
  registerNumber: string;
  autoPrintReceipt: boolean;
  soundEnabled: boolean;
}

export type DatePreset = 
  | 'today' 
  | 'yesterday' 
  | 'last_7_days' 
  | 'this_month' 
  | 'last_30_days' 
  | 'ytd' 
  | 'custom';

export interface DateRangeFilter {
  preset: DatePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
  comparisonLabel: string;
}

export interface KPIStats {
  // 1. Total Net Revenue
  totalRevenue: number;
  revenueComparisonPercent: number;
  priorRevenue: number;
  
  // 2. Average Order Value (AOV)
  averageOrderValue: number;
  aovComparisonPercent: number;
  priorAov: number;

  // 3. Transaction Volume
  transactionCount: number;
  transactionComparisonPercent: number;
  priorTransactionCount: number;

  // 4. Gross Margin % & Profit
  totalGrossProfit: number;
  grossMarginPercent: number;
  marginComparisonPercent: number;
  totalCogs: number;

  // 5. Inventory Velocity & Units Sold
  totalUnitsSold: number;
  unitsComparisonPercent: number;
  lowStockItemsCount: number;
  totalProductsCount: number;
  inStockPercent: number;
}
