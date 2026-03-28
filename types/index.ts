// Core domain types for lk-parts

export type VehicleType = 'bike' | 'car' | 'van' | '3wheeler'

export type SubSection =
  | 'engine' | 'brakes' | 'suspension' | 'electrical' | 'body'
  | 'interior' | 'filters' | 'lighting' | 'wheels_tyres' | 'transmission' | 'cooling'

export type FitmentType = 'exact' | 'compatible' | 'unknown'

export type OrderStatus =
  | 'created' | 'payment_initiated' | 'paid' | 'cod_confirmed'
  | 'processing' | 'shipped' | 'delivered' | 'closed'
  | 'payment_failed' | 'return_requested' | 'return_approved'
  | 'refund_initiated' | 'returned' | 'cancelled'

export type PaymentMethod = 'cod' | 'koko' | 'card'
export type PaymentStatus = 'pending' | 'initiated' | 'completed' | 'failed' | 'refunded'
export type PaymentEventType =
  | 'initiated' | 'completed' | 'failed' | 'refunded' | 'webhook_received' | 'error'

export interface Vehicle {
  id: string
  type: VehicleType
  brand: string
  model: string
  variant: string | null
  year_from: number | null
  year_to: number | null
  slug: string
  is_active: boolean
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_oem: boolean
}

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  oem_part_number: string | null
  aftermarket_part_number: string | null
  brand_id: string | null
  brand?: Brand | null
  description: string | null
  technical_notes: string | null
  sub_section: SubSection
  price: number
  compare_at_price: number | null
  condition: 'new' | 'used' | 'refurbished'
  is_active: boolean
  images: string[]
  quantity: number
  reserved_quantity: number
  low_stock_threshold: number
  inventory_updated_at: string
  created_at: string
  updated_at: string
  // Computed from fitment join (not in DB)
  fitment_type?: FitmentType
  fitment_notes?: string | null
}

export interface VehicleFitment {
  id: string
  vehicle_id: string
  product_id: string
  fitment_type: 'exact' | 'compatible'
  notes: string | null
}

export interface Customer {
  id: string
  phone: string  // 9-digit bare, e.g. "771234567"
  name: string | null
  email: string | null
  preferred_language: string
  is_admin: boolean
  account_type: 'customer' | 'mechanic'
  created_at: string
}

export interface CustomerGarage {
  id: string
  customer_id: string
  vehicle_id: string
  vehicle?: Vehicle
  nickname: string | null
  created_at: string
}

export interface Cart {
  id: string
  session_token: string
  customer_id: string | null
  vehicle_id: string | null
  vehicle?: Vehicle | null
  expires_at: string
  created_at: string
  items?: CartItem[]
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  product?: Product
  vehicle_id: string | null
  quantity: number
}

export interface ShippingAddress {
  name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  district: string
}

export interface FitmentSnapshot {
  vehicle_id: string
  vehicle_slug: string
  fitment_type: 'exact' | 'compatible'
  oem_part_number: string | null
  product_name: string
  matched_at: string
}

export interface Order {
  id: string
  customer_id: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  subtotal: number
  delivery_fee: number
  total: number
  shipping_address: ShippingAddress
  delivery_notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  customer?: Customer
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product?: Product
  quantity: number
  unit_price: number
  fitment_snapshot: FitmentSnapshot | null
}

export interface PaymentEvent {
  id: string
  order_id: string
  provider: 'koko' | 'payhere' | 'cod'
  event_type: PaymentEventType
  provider_reference: string | null
  raw_payload: unknown
  created_at: string
}

// Payment provider interface
export interface PaymentInitiateParams {
  orderId: string
  amount: number
  currency: 'LKR'
  returnUrl: string
  cancelUrl: string
  customerPhone: string
}

export interface PaymentInitiateResult {
  redirectUrl?: string
  reference: string
  expiresAt?: Date
}

export interface PaymentWebhookResult {
  orderId: string
  status: 'completed' | 'failed' | 'refunded'
  providerReference: string
}

export interface ReconcileResult {
  status: 'matched' | 'mismatch' | 'pending'
  details: string
}
