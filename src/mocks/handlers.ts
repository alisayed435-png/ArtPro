/**
 * MSW Request Handlers for Calyx Command Demo
 * 
 * These handlers intercept API requests and return mock data.
 * They simulate realistic latency and can toggle errors for testing.
 */

import { http, HttpResponse, delay } from 'msw';
import {
  getDemoData,
  seedDemoData,
  resetDemoData,
  createDemoUser,
  createDemoOrganization,
  generateOrder,
} from './data';
import { generateId } from '@/lib/utils';
import type {
  Order,
  OrderStatus,
  Artwork,
  ArtworkStatus,
  PaginatedResponse,
} from '@/lib/types';

// Simulate realistic API latency
async function simulateLatency() {
  const latency = Math.random() * 900 + 300; // 300-1200ms
  await delay(latency);
}

// Helper to paginate data
function paginate<T>(
  data: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);

  return {
    data: paginatedData,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
  };
}

// Helper to filter orders
function filterOrders(orders: Order[], params: URLSearchParams): Order[] {
  let filtered = [...orders];

  const status = params.getAll('status');
  if (status.length > 0) {
    filtered = filtered.filter(o => status.includes(o.status));
  }

  const priority = params.getAll('priority');
  if (priority.length > 0) {
    filtered = filtered.filter(o => priority.includes(o.priority));
  }

  const search = params.get('search');
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(o =>
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.lineItems.some(li => li.productName.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
}

// Helper to filter artwork
function filterArtwork(artwork: Artwork[], params: URLSearchParams): Artwork[] {
  let filtered = [...artwork];

  const status = params.getAll('status');
  if (status.length > 0) {
    filtered = filtered.filter(a => status.includes(a.status));
  }

  const productType = params.getAll('productType');
  if (productType.length > 0) {
    filtered = filtered.filter(a => productType.includes(a.productType));
  }

  const search = params.get('search');
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(searchLower) ||
      (a.description?.toLowerCase().includes(searchLower) ?? false)
    );
  }

  return filtered;
}

export const handlers = [
  // =========================================================================
  // Auth Handlers
  // =========================================================================

  http.post('/api/auth/login', async ({ request }) => {
    await simulateLatency();
    
    const body = await request.json() as { email: string; password: string };
    
    // Accept any credentials for demo
    if (body.email && body.password) {
      const data = getDemoData();
      return HttpResponse.json({
        user: data.user,
        organization: data.organization,
        token: 'demo-token-' + generateId(),
      });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/logout', async () => {
    await simulateLatency();
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/auth/me', async () => {
    await simulateLatency();
    const data = getDemoData();
    return HttpResponse.json({
      user: data.user,
      organization: data.organization,
    });
  }),

  http.post('/api/auth/demo', async () => {
    await simulateLatency();
    seedDemoData();
    return HttpResponse.json({
      user: createDemoUser(),
      organization: createDemoOrganization(),
      token: 'demo-token-' + generateId(),
    });
  }),

  // =========================================================================
  // Orders Handlers
  // =========================================================================

  http.get('/api/orders', async ({ request }) => {
    await simulateLatency();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const data = getDemoData();
    const filtered = filterOrders(data.orders, url.searchParams);
    
    // Sort by createdAt descending by default
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  http.get('/api/orders/:id', async ({ params }) => {
    await simulateLatency();
    
    const data = getDemoData();
    const order = data.orders.find(o => o.id === params.id);
    
    if (!order) {
      return HttpResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(order);
  }),

  http.post('/api/orders', async ({ request }) => {
    await simulateLatency();
    
    const body = await request.json() as Partial<Order>;
    const data = getDemoData();
    
    const newOrder = generateOrder(data.orders.length);
    const order: Order = { ...newOrder, ...body, status: 'pending' as OrderStatus };
    
    data.orders.unshift(order);
    
    return HttpResponse.json(order, { status: 201 });
  }),

  http.patch('/api/orders/:id', async ({ params, request }) => {
    await simulateLatency();
    
    const body = await request.json() as Partial<Order>;
    const data = getDemoData();
    const orderIndex = data.orders.findIndex(o => o.id === params.id);
    
    if (orderIndex === -1) {
      return HttpResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    data.orders[orderIndex] = { ...data.orders[orderIndex], ...body };
    
    return HttpResponse.json(data.orders[orderIndex]);
  }),

  http.post('/api/orders/:id/cancel', async ({ params }) => {
    await simulateLatency();
    
    const data = getDemoData();
    const orderIndex = data.orders.findIndex(o => o.id === params.id);
    
    if (orderIndex === -1) {
      return HttpResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    data.orders[orderIndex].status = 'cancelled';
    
    return HttpResponse.json(data.orders[orderIndex]);
  }),

  http.post('/api/orders/:id/reorder', async ({ params }) => {
    await simulateLatency();
    
    const data = getDemoData();
    const originalOrder = data.orders.find(o => o.id === params.id);
    
    if (!originalOrder) {
      return HttpResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    const newOrder: Order = {
      ...originalOrder,
      id: 'order-' + generateId(),
      orderNumber: `CC-${new Date().getFullYear()}-${String(data.orders.length + 1001).padStart(5, '0')}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [{
        id: generateId(),
        status: 'pending',
        timestamp: new Date().toISOString(),
        description: 'Reorder submitted',
        userName: 'Demo User',
      }],
    };
    
    data.orders.unshift(newOrder);
    
    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // =========================================================================
  // Artwork Handlers
  // =========================================================================

  http.get('/api/artwork', async ({ request }) => {
    await simulateLatency();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const data = getDemoData();
    const filtered = filterArtwork(data.artwork, url.searchParams);
    
    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  http.get('/api/artwork/:id', async ({ params }) => {
    await simulateLatency();
    
    const data = getDemoData();
    const artwork = data.artwork.find(a => a.id === params.id);
    
    if (!artwork) {
      return HttpResponse.json(
        { message: 'Artwork not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(artwork);
  }),

  http.post('/api/artwork/upload', async ({ request }) => {
    await delay(1500); // Simulate upload time
    
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const productType = formData.get('productType') as string;
    const file = formData.get('file') as File;
    
    const data = getDemoData();
    
    const newArtwork: Artwork = {
      id: 'artwork-' + generateId(),
      organizationId: 'demo-org-001',
      name,
      description: description || undefined,
      status: 'submitted',
      fileUrl: `/mock-artwork/${generateId()}.pdf`,
      thumbnailUrl: `https://picsum.photos/seed/${generateId()}/400/300`,
      fileType: file?.type || 'application/pdf',
      fileSize: file?.size || 1000000,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo-user-001',
      createdByName: 'Demo User',
      approvalHistory: [],
      productType: productType as Artwork['productType'],
      dimensions: { width: 8, height: 10, unit: 'in' },
    };
    
    data.artwork.unshift(newArtwork);
    
    return HttpResponse.json(newArtwork, { status: 201 });
  }),

  http.post('/api/artwork/:id/approve', async ({ params, request }) => {
    await simulateLatency();
    
    const body = await request.json() as { comment?: string };
    const data = getDemoData();
    const artworkIndex = data.artwork.findIndex(a => a.id === params.id);
    
    if (artworkIndex === -1) {
      return HttpResponse.json(
        { message: 'Artwork not found' },
        { status: 404 }
      );
    }
    
    data.artwork[artworkIndex].status = 'approved' as ArtworkStatus;
    data.artwork[artworkIndex].approvalHistory.push({
      id: generateId(),
      artworkId: params.id as string,
      reviewerId: 'demo-user-001',
      reviewerName: 'Demo User',
      action: 'approved',
      comment: body.comment,
      timestamp: new Date().toISOString(),
    });
    
    return HttpResponse.json(data.artwork[artworkIndex]);
  }),

  http.post('/api/artwork/:id/request-changes', async ({ params, request }) => {
    await simulateLatency();
    
    const body = await request.json() as { comment: string };
    const data = getDemoData();
    const artworkIndex = data.artwork.findIndex(a => a.id === params.id);
    
    if (artworkIndex === -1) {
      return HttpResponse.json(
        { message: 'Artwork not found' },
        { status: 404 }
      );
    }
    
    data.artwork[artworkIndex].status = 'changes_requested' as ArtworkStatus;
    data.artwork[artworkIndex].approvalHistory.push({
      id: generateId(),
      artworkId: params.id as string,
      reviewerId: 'demo-user-001',
      reviewerName: 'Demo User',
      action: 'changes_requested',
      comment: body.comment,
      timestamp: new Date().toISOString(),
    });
    
    return HttpResponse.json(data.artwork[artworkIndex]);
  }),

  http.post('/api/artwork/:id/reject', async ({ params, request }) => {
    await simulateLatency();
    
    const body = await request.json() as { comment: string };
    const data = getDemoData();
    const artworkIndex = data.artwork.findIndex(a => a.id === params.id);
    
    if (artworkIndex === -1) {
      return HttpResponse.json(
        { message: 'Artwork not found' },
        { status: 404 }
      );
    }
    
    data.artwork[artworkIndex].status = 'rejected' as ArtworkStatus;
    data.artwork[artworkIndex].approvalHistory.push({
      id: generateId(),
      artworkId: params.id as string,
      reviewerId: 'demo-user-001',
      reviewerName: 'Demo User',
      action: 'rejected',
      comment: body.comment,
      timestamp: new Date().toISOString(),
    });
    
    return HttpResponse.json(data.artwork[artworkIndex]);
  }),

  http.delete('/api/artwork/:id', async ({ params }) => {
    await simulateLatency();
    
    const data = getDemoData();
    const artworkIndex = data.artwork.findIndex(a => a.id === params.id);
    
    if (artworkIndex === -1) {
      return HttpResponse.json(
        { message: 'Artwork not found' },
        { status: 404 }
      );
    }
    
    data.artwork.splice(artworkIndex, 1);
    
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // Compliance Handlers
  // =========================================================================

  http.get('/api/compliance/status', async () => {
    await simulateLatency();
    const data = getDemoData();
    return HttpResponse.json(data.complianceStatus);
  }),

  http.get('/api/compliance/events', async ({ request }) => {
    await simulateLatency();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    
    const data = getDemoData();
    
    return HttpResponse.json(paginate(data.complianceEvents, page, pageSize));
  }),

  http.get('/api/compliance/events/:id', async ({ params }) => {
    await simulateLatency();
    
    const data = getDemoData();
    const event = data.complianceEvents.find(e => e.id === params.id);
    
    if (!event) {
      return HttpResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(event);
  }),

  http.post('/api/compliance/sync', async () => {
    await delay(2000); // Simulate sync time
    
    const data = getDemoData();
    data.complianceStatus.lastSyncAt = new Date().toISOString();
    data.complianceStatus.syncStatus = 'success';
    
    return HttpResponse.json({
      success: true,
      message: 'Sync completed successfully. 47 packages synced.',
    });
  }),

  http.post('/api/compliance/events/:id/resolve', async ({ params }) => {
    await simulateLatency();
    
    const data = getDemoData();
    const eventIndex = data.complianceEvents.findIndex(e => e.id === params.id);
    
    if (eventIndex === -1) {
      return HttpResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }
    
    data.complianceEvents[eventIndex].resolved = true;
    data.complianceEvents[eventIndex].resolvedAt = new Date().toISOString();
    data.complianceEvents[eventIndex].resolvedBy = 'Demo User';
    
    return HttpResponse.json(data.complianceEvents[eventIndex]);
  }),

  // =========================================================================
  // Analytics Handlers
  // =========================================================================

  http.get('/api/analytics/dashboard', async () => {
    await simulateLatency();
    const data = getDemoData();
    return HttpResponse.json(data.analytics);
  }),

  http.get('/api/analytics/orders', async () => {
    await simulateLatency();
    const data = getDemoData();
    return HttpResponse.json(data.analytics.orders);
  }),

  http.get('/api/analytics/revenue', async () => {
    await simulateLatency();
    const data = getDemoData();
    return HttpResponse.json(data.analytics.revenue);
  }),

  // =========================================================================
  // System Status Handlers
  // =========================================================================

  http.get('/api/system/status', async () => {
    await simulateLatency();
    const data = getDemoData();
    
    // Simulate occasional latency spikes
    data.systemStatus.services = data.systemStatus.services.map(service => ({
      ...service,
      latency: Math.floor(Math.random() * 200) + 50,
      lastChecked: new Date().toISOString(),
    }));
    data.systemStatus.lastUpdated = new Date().toISOString();
    
    return HttpResponse.json(data.systemStatus);
  }),

  http.get('/api/system/incidents', async () => {
    await simulateLatency();
    const data = getDemoData();
    return HttpResponse.json({ incidents: data.systemStatus.incidents });
  }),

  http.get('/api/system/events', async () => {
    await simulateLatency();
    const data = getDemoData();
    return HttpResponse.json({ events: data.activities.slice(0, 20) });
  }),

  // =========================================================================
  // Activity Handlers
  // =========================================================================

  http.get('/api/activity/recent', async ({ request }) => {
    await simulateLatency();
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const data = getDemoData();
    
    return HttpResponse.json(data.activities.slice(0, limit));
  }),

  // =========================================================================
  // Demo Handlers
  // =========================================================================

  http.post('/api/demo/seed', async () => {
    await simulateLatency();
    seedDemoData();
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/demo/reset', async () => {
    await simulateLatency();
    resetDemoData();
    return HttpResponse.json({ success: true });
  }),
];
