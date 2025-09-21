import { http, HttpResponse } from 'msw';
import { SiteDto, CheckDto, CheckResultDto } from '@shared/types';
import { mockSites, mockChecks, mockResults } from './data';
import { delay, generateUUID, simulateCheckResult } from './utils';


export const handlers = [
  // Sites API
  http.get('/sites', async () => {
    await delay(300 + Math.random() * 200); // 300-500ms delay
    return HttpResponse.json(mockSites);
  }),

  http.get('/sites/:id', async ({ params }) => {
    await delay(200 + Math.random() * 100); // 200-300ms delay
    const site = mockSites.find(s => s.id === params.id);
    if (!site) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(site);
  }),

  http.post('/sites', async ({ request }) => {
    await delay(500 + Math.random() * 300); // 500-800ms delay
    const newSite = await request.json() as any;
    
    // Basic validation
    if (!newSite.name || !newSite.url) {
      return HttpResponse.json(
        { error: 'Bad Request', message: 'Name and URL are required' },
        { status: 400 }
      );
    }
    
    const site: SiteDto = {
      id: generateUUID(),
      ...newSite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastStatus: 'GREEN',
      lastCheckAt: null,
      lastResponseTimeMs: null,
    };
    mockSites.push(site);
    return HttpResponse.json(site, { status: 201 });
  }),

  http.put('/sites/:id', async ({ params, request }) => {
    await delay(400 + Math.random() * 200); // 400-600ms delay
    const updates = await request.json() as any;
    const siteIndex = mockSites.findIndex(s => s.id === params.id);
    if (siteIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockSites[siteIndex] = {
      ...mockSites[siteIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(mockSites[siteIndex]);
  }),

  http.delete('/sites/:id', async ({ params }) => {
    await delay(300 + Math.random() * 200); // 300-500ms delay
    const siteIndex = mockSites.findIndex(s => s.id === params.id);
    if (siteIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockSites.splice(siteIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/sites/:id/run', async ({ params }) => {
    await delay(1000 + Math.random() * 2000); // 1-3s delay to simulate check
    const site = mockSites.find(s => s.id === params.id);
    if (!site) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // Simulate check result
    const responseTime = Math.random() * 1000 + 100; // 100-1100ms
    const isHealthy = Math.random() > 0.1; // 90% success rate
    
    site.lastCheckAt = new Date().toISOString();
    site.lastResponseTimeMs = isHealthy ? Math.round(responseTime) : null;
    site.lastStatus = isHealthy ? 'GREEN' : 'RED';
    
    return new HttpResponse(null, { status: 200 });
  }),

  // Checks API
  http.get('/sites/:siteId/checks', async ({ params }) => {
    await delay(200 + Math.random() * 100); // 200-300ms delay
    const checks = mockChecks.filter(c => c.siteId === params.siteId);
    return HttpResponse.json(checks);
  }),

  http.post('/sites/:siteId/checks', async ({ params, request }) => {
    await delay(400 + Math.random() * 200); // 400-600ms delay
    const newCheck = await request.json() as any;
    
    // Basic validation
    if (!newCheck.type || !newCheck.config) {
      return HttpResponse.json(
        { error: 'Bad Request', message: 'Type and config are required' },
        { status: 400 }
      );
    }
    
    const check: CheckDto = {
      id: generateUUID(),
      siteId: params.siteId as string,
      ...newCheck,
      createdAt: new Date().toISOString(),
    };
    mockChecks.push(check);
    return HttpResponse.json(check, { status: 201 });
  }),

  http.put('/checks/:id', async ({ params, request }) => {
    await delay(300 + Math.random() * 200); // 300-500ms delay
    const updates = await request.json() as any;
    const checkIndex = mockChecks.findIndex(c => c.id === params.id);
    if (checkIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockChecks[checkIndex] = { ...mockChecks[checkIndex], ...updates };
    return HttpResponse.json(mockChecks[checkIndex]);
  }),

  http.delete('/checks/:id', async ({ params }) => {
    await delay(250 + Math.random() * 150); // 250-400ms delay
    const checkIndex = mockChecks.findIndex(c => c.id === params.id);
    if (checkIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    mockChecks.splice(checkIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/checks/:id/run', async ({ params }) => {
    await delay(800 + Math.random() * 1200); // 800-2000ms delay
    const check = mockChecks.find(c => c.id === params.id);
    if (!check) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // Simulate check execution
    const responseTime = Math.random() * 800 + 200; // 200-1000ms
    const isHealthy = Math.random() > 0.15; // 85% success rate
    
    return HttpResponse.json({
      id: generateUUID(),
      siteId: check.siteId,
      checkId: check.id,
      status: isHealthy ? 'PASS' : 'FAIL',
      responseTimeMs: isHealthy ? Math.round(responseTime) : null,
      error: isHealthy ? null : 'Connection timeout',
      createdAt: new Date().toISOString(),
    });
  }),

  // Results API
  http.get('/sites/:siteId/results', async ({ params, request }) => {
    await delay(200 + Math.random() * 100); // 200-300ms delay
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    
    let results = mockResults.filter(r => r.siteId === params.siteId);
    
    // Filter by date range if provided
    if (from) {
      results = results.filter(r => new Date(r.createdAt) >= new Date(from));
    }
    if (to) {
      results = results.filter(r => new Date(r.createdAt) <= new Date(to));
    }
    
    // Apply limit
    const limitNum = limit ? parseInt(limit) : 50;
    results = results.slice(0, limitNum);
    
    return HttpResponse.json(results);
  }),

  // Reports API
  http.get('/reports', async ({ request }) => {
    await delay(1000 + Math.random() * 1000); // 1-2s delay for report generation
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    const siteId = url.searchParams.get('siteId');
    
    if (format === 'csv') {
      // Generate CSV content based on mock data
      let csvContent = 'siteId,siteName,timestamp,status,responseTimeMs,error\n';
      
      const siteResults = siteId 
        ? mockResults.filter(r => r.siteId === siteId)
        : mockResults;
      
      siteResults.slice(0, 100).forEach(result => {
        const site = mockSites.find(s => s.id === result.siteId);
        const siteName = site ? site.name : 'Unknown';
        csvContent += `${result.siteId},${siteName},${result.createdAt},${result.status},${result.responseTimeMs || ''},${result.error || ''}\n`;
      });
      
      return new HttpResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
    
    return HttpResponse.json(
      { error: 'Bad Request', message: 'Unsupported format. Use csv or pdf.' },
      { status: 400 }
    );
  }),
];
