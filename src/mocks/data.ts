/**
 * Mock Data Generators for Calyx Command Demo
 * 
 * These generators create realistic-looking mock data for the demo.
 * Data is deterministic when seeded, allowing consistent demo experiences.
 */

import {
  User,
  Organization,
  Order,
  OrderStatus,
  OrderPriority,
  OrderLineItem,
  OrderTimelineEvent,
  Artwork,
  ArtworkStatus,
  ProductType,
  ComplianceStatus,
  ComplianceEvent,
  ComplianceEventType,
  Activity,
  ActivityType,
  SystemStatus,
  ServiceStatus,
  Address,
  AnalyticsData,
  TimeSeriesData,
} from '@/lib/types';
import { generateId, randomInt, randomItem } from '@/lib/utils';

// ============================================================================
// Demo User and Organization
// ============================================================================

export function createDemoUser(): User {
  return {
    id: 'demo-user-001',
    email: 'demo@calyxcommand.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin',
    avatarUrl: undefined,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
}

export function createDemoOrganization(): Organization {
  return {
    id: 'demo-org-001',
    name: 'Emerald Grove Cultivation',
    slug: 'emerald-grove',
    logoUrl: undefined,
    licenseNumber: 'C11-0001234-LIC',
    licenseType: 'cultivator',
    address: {
      street1: '420 Green Valley Road',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612',
      country: 'USA',
    },
    contactEmail: 'orders@emeraldgrove.example',
    contactPhone: '(510) 555-0420',
    metrcConnected: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// ============================================================================
// Address Generators
// ============================================================================

const cities = [
  { city: 'Los Angeles', state: 'CA', zipCode: '90001' },
  { city: 'San Francisco', state: 'CA', zipCode: '94102' },
  { city: 'Oakland', state: 'CA', zipCode: '94612' },
  { city: 'Denver', state: 'CO', zipCode: '80202' },
  { city: 'Portland', state: 'OR', zipCode: '97201' },
  { city: 'Seattle', state: 'WA', zipCode: '98101' },
  { city: 'Phoenix', state: 'AZ', zipCode: '85001' },
  { city: 'Las Vegas', state: 'NV', zipCode: '89101' },
];

const streetNames = [
  'Main Street', 'Market Street', 'Industrial Way', 'Commerce Drive',
  'Tech Park Blvd', 'Innovation Lane', 'Enterprise Road', 'Business Center Dr',
];

export function generateAddress(): Address {
  const location = randomItem(cities);
  return {
    street1: `${randomInt(100, 9999)} ${randomItem(streetNames)}`,
    city: location.city,
    state: location.state,
    zipCode: location.zipCode,
    country: 'USA',
  };
}

// ============================================================================
// Order Generators
// ============================================================================

const productNames = [
  { name: 'Premium Mylar Pouch - 1oz', sku: 'MYL-1OZ-001', price: 0.45 },
  { name: 'Premium Mylar Pouch - 3.5g', sku: 'MYL-35G-001', price: 0.35 },
  { name: 'Child-Resistant Jar - 4oz', sku: 'JAR-4OZ-CR', price: 1.25 },
  { name: 'Pre-Roll Tube - 116mm', sku: 'TUB-116-001', price: 0.28 },
  { name: 'Custom Display Box - 10ct', sku: 'BOX-10CT-001', price: 2.50 },
  { name: 'Compliance Label Sheet', sku: 'LBL-COMP-001', price: 0.15 },
  { name: 'Concentrate Jar - 5ml', sku: 'JAR-5ML-CON', price: 0.85 },
  { name: 'Exit Bag - Large', sku: 'BAG-EXIT-LG', price: 0.55 },
];

const orderStatuses: OrderStatus[] = [
  'pending', 'confirmed', 'in_production', 'quality_check',
  'ready_to_ship', 'shipped', 'delivered',
];

const orderPriorities: OrderPriority[] = ['low', 'normal', 'high', 'urgent'];

function generateOrderNumber(index: number): string {
  const year = new Date().getFullYear();
  return `CC-${year}-${String(index + 1001).padStart(5, '0')}`;
}

function generateLineItems(): OrderLineItem[] {
  const numItems = randomInt(1, 5);
  const items: OrderLineItem[] = [];
  const usedProducts = new Set<number>();

  for (let i = 0; i < numItems; i++) {
    let productIndex: number;
    do {
      productIndex = randomInt(0, productNames.length - 1);
    } while (usedProducts.has(productIndex) && usedProducts.size < productNames.length);
    
    usedProducts.add(productIndex);
    const product = productNames[productIndex];
    const quantity = randomInt(100, 5000);

    items.push({
      id: generateId(),
      productId: `prod-${productIndex}`,
      productName: product.name,
      sku: product.sku,
      quantity,
      unitPrice: product.price,
      totalPrice: quantity * product.price,
    });
  }

  return items;
}

function generateOrderTimeline(status: OrderStatus, createdAt: Date): OrderTimelineEvent[] {
  const timeline: OrderTimelineEvent[] = [];
  const statusIndex = orderStatuses.indexOf(status);
  let currentTime = new Date(createdAt);

  for (let i = 0; i <= statusIndex && i < orderStatuses.length; i++) {
    const s = orderStatuses[i];
    timeline.push({
      id: generateId(),
      status: s,
      timestamp: currentTime.toISOString(),
      description: getStatusDescription(s),
      userName: i === 0 ? 'System' : randomItem(['Sarah Chen', 'Mike Johnson', 'System']),
    });
    currentTime = new Date(currentTime.getTime() + randomInt(2, 48) * 60 * 60 * 1000);
  }

  return timeline;
}

function getStatusDescription(status: OrderStatus): string {
  const descriptions: Record<OrderStatus, string> = {
    pending: 'Order submitted and awaiting confirmation',
    confirmed: 'Order confirmed and scheduled for production',
    in_production: 'Order is being manufactured',
    quality_check: 'Products undergoing quality inspection',
    ready_to_ship: 'Order packed and ready for shipment',
    shipped: 'Order has been shipped via carrier',
    delivered: 'Order successfully delivered',
    cancelled: 'Order has been cancelled',
  };
  return descriptions[status];
}

export function generateOrder(index: number): Order {
  const daysAgo = randomInt(0, 60);
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const status = daysAgo < 3 
    ? randomItem(['pending', 'confirmed', 'in_production'] as OrderStatus[])
    : randomItem(orderStatuses);
  
  const lineItems = generateLineItems();
  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.0875;
  const shippingCost = subtotal > 500 ? 0 : 45;

  return {
    id: `order-${String(index + 1).padStart(4, '0')}`,
    orderNumber: generateOrderNumber(index),
    organizationId: 'demo-org-001',
    status,
    priority: randomItem(orderPriorities),
    lineItems,
    shippingAddress: generateAddress(),
    billingAddress: generateAddress(),
    subtotal,
    tax,
    shippingCost,
    total: subtotal + tax + shippingCost,
    notes: Math.random() > 0.7 ? 'Please expedite if possible.' : undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: new Date(createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: status !== 'delivered' && status !== 'cancelled'
      ? new Date(Date.now() + randomInt(5, 14) * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
    timeline: generateOrderTimeline(status, createdAt),
  };
}

export function generateOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => generateOrder(i));
}

// ============================================================================
// Artwork Generators
// ============================================================================

const artworkStatuses: ArtworkStatus[] = [
  'draft', 'submitted', 'in_review', 'changes_requested', 'approved',
];

const productTypes: ProductType[] = [
  'pouch', 'jar', 'tube', 'box', 'label', 'insert',
];

const artworkNames = [
  'OG Kush Premium Label',
  'Blue Dream Pouch Design',
  'Sour Diesel Box Art',
  'Gelato Jar Label',
  'Purple Haze Tube Wrap',
  'Wedding Cake Insert',
  'Gorilla Glue Compliance Label',
  'Jack Herer Display Box',
  'Northern Lights Pouch',
  'Girl Scout Cookies Label',
  'Pineapple Express Jar',
  'Granddaddy Purple Tube',
];

export function generateArtwork(index: number): Artwork {
  const daysAgo = randomInt(0, 45);
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const status = randomItem(artworkStatuses);
  const productType = randomItem(productTypes);

  return {
    id: `artwork-${String(index + 1).padStart(4, '0')}`,
    organizationId: 'demo-org-001',
    name: randomItem(artworkNames) + ` v${randomInt(1, 3)}`,
    description: `Artwork design for ${productType} packaging`,
    status,
    fileUrl: `/mock-artwork/artwork-${index + 1}.pdf`,
    thumbnailUrl: `https://picsum.photos/seed/artwork${index}/400/300`,
    fileType: 'application/pdf',
    fileSize: randomInt(500000, 5000000),
    version: randomInt(1, 4),
    createdAt: createdAt.toISOString(),
    updatedAt: new Date(createdAt.getTime() + randomInt(0, 72) * 60 * 60 * 1000).toISOString(),
    createdBy: 'demo-user-001',
    createdByName: 'Demo User',
    approvalHistory: status !== 'draft' && status !== 'submitted' ? [
      {
        id: generateId(),
        artworkId: `artwork-${String(index + 1).padStart(4, '0')}`,
        reviewerId: 'reviewer-001',
        reviewerName: 'Sarah Chen',
        action: status === 'approved' ? 'approved' : 'changes_requested',
        comment: status === 'approved' 
          ? 'Looks great! Approved for production.'
          : 'Please adjust the compliance text font size.',
        timestamp: new Date(createdAt.getTime() + randomInt(24, 72) * 60 * 60 * 1000).toISOString(),
      },
    ] : [],
    productType,
    dimensions: {
      width: randomInt(3, 12),
      height: randomInt(4, 16),
      unit: 'in',
    },
  };
}

export function generateArtworkList(count: number): Artwork[] {
  return Array.from({ length: count }, (_, i) => generateArtwork(i));
}

// ============================================================================
// Compliance Generators
// ============================================================================

export function generateComplianceStatus(): ComplianceStatus {
  return {
    connected: true,
    lastSyncAt: new Date(Date.now() - randomInt(5, 120) * 60 * 1000).toISOString(),
    syncStatus: 'success',
    licenseStatus: 'active',
    pendingPackages: randomInt(0, 15),
    errorCount: randomInt(0, 3),
  };
}

const complianceEventTypes: ComplianceEventType[] = [
  'package_created', 'package_updated', 'transfer_initiated',
  'transfer_completed', 'sync_completed', 'manifest_generated',
];

const complianceMessages: Record<ComplianceEventType, string[]> = {
  package_created: [
    'New package created: PKG-001234567',
    'Package PKG-001234568 registered successfully',
    'Created package with 500 units of Premium Flower',
  ],
  package_updated: [
    'Package PKG-001234567 quantity adjusted',
    'Lab results attached to PKG-001234568',
    'Package metadata updated successfully',
  ],
  transfer_initiated: [
    'Transfer TRF-2024-0042 initiated to distributor',
    'Outbound transfer created for 10 packages',
    'Transfer manifest generated for delivery',
  ],
  transfer_completed: [
    'Transfer TRF-2024-0041 completed successfully',
    'Inbound transfer received and verified',
    'All packages accounted for in transfer',
  ],
  sync_started: ['METRC sync initiated'],
  sync_completed: [
    'METRC sync completed - 47 packages synced',
    'Sync completed with 0 errors',
    'All data synchronized with state system',
  ],
  sync_failed: ['METRC sync failed - connection timeout'],
  manifest_generated: [
    'Manifest M-2024-0156 generated',
    'Transport manifest ready for download',
  ],
  license_renewal: ['License renewal reminder - expires in 30 days'],
  audit_log: ['Compliance audit completed'],
};

export function generateComplianceEvent(index: number): ComplianceEvent {
  const hoursAgo = randomInt(0, 72 * index);
  const eventType = randomItem(complianceEventTypes);
  const messages = complianceMessages[eventType] || ['Event recorded'];

  return {
    id: `compliance-${String(index + 1).padStart(4, '0')}`,
    type: eventType,
    severity: eventType.includes('fail') ? 'error' : randomItem(['info', 'success'] as const),
    message: randomItem(messages),
    details: Math.random() > 0.7 ? 'Additional details available in METRC portal.' : undefined,
    timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
    metrcId: `METRC-${randomInt(100000, 999999)}`,
    resolved: true,
  };
}

export function generateComplianceEvents(count: number): ComplianceEvent[] {
  return Array.from({ length: count }, (_, i) => generateComplianceEvent(i));
}

// ============================================================================
// Activity Generators
// ============================================================================

const activityTypes: ActivityType[] = [
  'order_created', 'order_updated', 'order_shipped',
  'artwork_uploaded', 'artwork_approved', 'compliance_sync',
];

const activityDescriptions: Record<ActivityType, string[]> = {
  order_created: ['New order submitted', 'Order placed for 2,500 pouches'],
  order_updated: ['Order status updated to In Production', 'Delivery date confirmed'],
  order_shipped: ['Order shipped via FedEx', 'Tracking number added'],
  artwork_uploaded: ['New artwork uploaded for review', 'Design revision submitted'],
  artwork_approved: ['Artwork approved for production', 'Design finalized'],
  artwork_rejected: ['Artwork requires revisions'],
  compliance_sync: ['METRC sync completed', 'Compliance data updated'],
  user_login: ['User logged in'],
  system_notification: ['System maintenance completed'],
};

export function generateActivity(index: number): Activity {
  const minutesAgo = randomInt(5, 60 * 24 * (index + 1));
  const type = randomItem(activityTypes);
  const descriptions = activityDescriptions[type] || ['Activity recorded'];

  return {
    id: `activity-${String(index + 1).padStart(4, '0')}`,
    type,
    title: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: randomItem(descriptions),
    userId: 'demo-user-001',
    userName: randomItem(['Demo User', 'Sarah Chen', 'Mike Johnson', 'System']),
    entityType: type.includes('order') ? 'order' : type.includes('artwork') ? 'artwork' : 'system',
    entityId: type.includes('order') ? 'order-0001' : type.includes('artwork') ? 'artwork-0001' : undefined,
    timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
  };
}

export function generateActivities(count: number): Activity[] {
  return Array.from({ length: count }, (_, i) => generateActivity(i));
}

// ============================================================================
// System Status Generators
// ============================================================================

export function generateSystemStatus(): SystemStatus {
  const services: ServiceStatus[] = [
    { id: 'api', name: 'API Services', status: 'operational', latency: randomInt(45, 120), lastChecked: new Date().toISOString() },
    { id: 'web', name: 'Web Application', status: 'operational', latency: randomInt(30, 80), lastChecked: new Date().toISOString() },
    { id: 'metrc', name: 'METRC Integration', status: 'operational', latency: randomInt(150, 400), lastChecked: new Date().toISOString() },
    { id: 'storage', name: 'File Storage', status: 'operational', latency: randomInt(50, 150), lastChecked: new Date().toISOString() },
    { id: 'email', name: 'Email Services', status: 'operational', latency: randomInt(100, 300), lastChecked: new Date().toISOString() },
    { id: 'payments', name: 'Payment Processing', status: 'operational', latency: randomInt(200, 500), lastChecked: new Date().toISOString() },
  ];

  return {
    overall: 'operational',
    services,
    incidents: [],
    uptime: 99.97,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================================
// Analytics Generators
// ============================================================================

function generateTimeSeriesData(days: number, baseValue: number, variance: number): TimeSeriesData[] {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.max(0, baseValue + randomInt(-variance, variance)),
  }));
}

export function generateAnalyticsData(): AnalyticsData {
  return {
    orders: {
      totalOrders: randomInt(150, 300),
      ordersChange: randomInt(-5, 15),
      avgOrderValue: randomInt(800, 2500),
      avgOrderValueChange: randomInt(-10, 20),
      ordersByStatus: {
        pending: randomInt(5, 15),
        confirmed: randomInt(8, 20),
        in_production: randomInt(10, 25),
        quality_check: randomInt(3, 10),
        ready_to_ship: randomInt(5, 12),
        shipped: randomInt(15, 40),
        delivered: randomInt(80, 150),
        cancelled: randomInt(2, 8),
      },
      ordersTrend: generateTimeSeriesData(30, 8, 4),
    },
    artwork: {
      totalSubmissions: randomInt(40, 80),
      approvalRate: randomInt(75, 95),
      avgApprovalTime: randomInt(24, 72),
      submissionsTrend: generateTimeSeriesData(30, 3, 2),
    },
    compliance: {
      complianceScore: randomInt(92, 100),
      totalPackages: randomInt(500, 1500),
      transfersCompleted: randomInt(80, 200),
      incidentCount: randomInt(0, 5),
    },
    revenue: {
      totalRevenue: randomInt(150000, 350000),
      revenueChange: randomInt(-5, 25),
      revenueTrend: generateTimeSeriesData(30, 8000, 3000),
      revenueByProduct: [
        { productType: 'pouch', revenue: randomInt(40000, 80000), percentage: 35 },
        { productType: 'jar', revenue: randomInt(30000, 60000), percentage: 25 },
        { productType: 'tube', revenue: randomInt(20000, 40000), percentage: 18 },
        { productType: 'box', revenue: randomInt(15000, 30000), percentage: 12 },
        { productType: 'label', revenue: randomInt(8000, 15000), percentage: 7 },
        { productType: 'insert', revenue: randomInt(3000, 8000), percentage: 3 },
      ],
    },
  };
}

// ============================================================================
// Data Store (In-Memory)
// ============================================================================

export interface DemoDataStore {
  user: User;
  organization: Organization;
  orders: Order[];
  artwork: Artwork[];
  complianceStatus: ComplianceStatus;
  complianceEvents: ComplianceEvent[];
  activities: Activity[];
  systemStatus: SystemStatus;
  analytics: AnalyticsData;
}

let dataStore: DemoDataStore | null = null;

export function seedDemoData(): DemoDataStore {
  dataStore = {
    user: createDemoUser(),
    organization: createDemoOrganization(),
    orders: generateOrders(50),
    artwork: generateArtworkList(20),
    complianceStatus: generateComplianceStatus(),
    complianceEvents: generateComplianceEvents(100),
    activities: generateActivities(20),
    systemStatus: generateSystemStatus(),
    analytics: generateAnalyticsData(),
  };
  return dataStore;
}

export function getDemoData(): DemoDataStore {
  if (!dataStore) {
    return seedDemoData();
  }
  return dataStore;
}

export function resetDemoData(): DemoDataStore {
  return seedDemoData();
}

export function updateDemoData(updates: Partial<DemoDataStore>): DemoDataStore {
  if (!dataStore) {
    dataStore = seedDemoData();
  }
  dataStore = { ...dataStore, ...updates };
  return dataStore;
}
