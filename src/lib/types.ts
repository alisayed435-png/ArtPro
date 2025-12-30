/**
 * Calyx Command - B2B SaaS Platform for Cannabis Packaging Operations
 * 
 * Core type definitions for the application.
 * These types are used throughout the app for type-safe data handling.
 */

// ============================================================================
// User & Organization Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  licenseNumber: string;
  licenseType: LicenseType;
  address: Address;
  contactEmail: string;
  contactPhone: string;
  metrcConnected: boolean;
  createdAt: string;
}

export type LicenseType = 'cultivator' | 'manufacturer' | 'distributor' | 'retailer' | 'microbusiness';

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ============================================================================
// Order Types
// ============================================================================

export interface Order {
  id: string;
  orderNumber: string;
  organizationId: string;
  status: OrderStatus;
  priority: OrderPriority;
  lineItems: OrderLineItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  timeline: OrderTimelineEvent[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'quality_check'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  artworkId?: string;
  specifications?: Record<string, string>;
}

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  description: string;
  userId?: string;
  userName?: string;
}

// ============================================================================
// Artwork Types
// ============================================================================

export interface Artwork {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: ArtworkStatus;
  fileUrl: string;
  thumbnailUrl: string;
  fileType: string;
  fileSize: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  approvalHistory: ArtworkApproval[];
  productType: ProductType;
  revisionComment?: string;
  dimensions?: {
    width: number;
    height: number;
    unit: 'in' | 'mm' | 'cm';
  };
}

export type ArtworkStatus = 
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected';

export type ProductType = 
  | 'pouch'
  | 'jar'
  | 'tube'
  | 'box'
  | 'label'
  | 'insert'
  | 'other';

export interface ArtworkApproval {
  id: string;
  artworkId: string;
  reviewerId: string;
  reviewerName: string;
  action: 'approved' | 'changes_requested' | 'rejected';
  comment?: string;
  timestamp: string;
}

export interface ArtworkUploadPayload {
  file: File;
  name: string;
  description?: string;
  productType: ProductType;
}

// ============================================================================
// Compliance Types (METRC Integration)
// ============================================================================

export interface ComplianceStatus {
  connected: boolean;
  lastSyncAt: string;
  syncStatus: SyncStatus;
  licenseStatus: 'active' | 'pending' | 'expired' | 'suspended';
  pendingPackages: number;
  errorCount: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface ComplianceEvent {
  id: string;
  type: ComplianceEventType;
  severity: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  timestamp: string;
  metrcId?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type ComplianceEventType = 
  | 'package_created'
  | 'package_updated'
  | 'transfer_initiated'
  | 'transfer_completed'
  | 'sync_started'
  | 'sync_completed'
  | 'sync_failed'
  | 'manifest_generated'
  | 'license_renewal'
  | 'audit_log';

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsData {
  orders: OrderAnalytics;
  artwork: ArtworkAnalytics;
  compliance: ComplianceAnalytics;
  revenue: RevenueAnalytics;
}

export interface OrderAnalytics {
  totalOrders: number;
  ordersChange: number;
  avgOrderValue: number;
  avgOrderValueChange: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersTrend: TimeSeriesData[];
}

export interface ArtworkAnalytics {
  totalSubmissions: number;
  approvalRate: number;
  avgApprovalTime: number;
  submissionsTrend: TimeSeriesData[];
}

export interface ComplianceAnalytics {
  complianceScore: number;
  totalPackages: number;
  transfersCompleted: number;
  incidentCount: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueChange: number;
  revenueTrend: TimeSeriesData[];
  revenueByProduct: ProductRevenue[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface ProductRevenue {
  productType: ProductType;
  revenue: number;
  percentage: number;
}

// ============================================================================
// System Status Types
// ============================================================================

export interface SystemStatus {
  overall: HealthStatus;
  services: ServiceStatus[];
  incidents: Incident[];
  uptime: number;
  lastUpdated: string;
}

export type HealthStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage';

export interface ServiceStatus {
  id: string;
  name: string;
  status: HealthStatus;
  latency?: number;
  lastChecked: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: 'minor' | 'major' | 'critical';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
}

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface IncidentUpdate {
  id: string;
  message: string;
  status: IncidentStatus;
  timestamp: string;
}

// ============================================================================
// Activity Types
// ============================================================================

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  userAvatarUrl?: string;
  entityType: 'order' | 'artwork' | 'compliance' | 'system';
  entityId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type ActivityType = 
  | 'order_created'
  | 'order_updated'
  | 'order_shipped'
  | 'artwork_uploaded'
  | 'artwork_approved'
  | 'artwork_rejected'
  | 'compliance_sync'
  | 'user_login'
  | 'system_notification';

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Filter & Sort Types
// ============================================================================

export interface OrderFilters {
  status?: OrderStatus[];
  priority?: OrderPriority[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ArtworkFilters {
  status?: ArtworkStatus[];
  productType?: ProductType[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
