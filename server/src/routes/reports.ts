// ──────────────────────────────────────────────
// Reports Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { buildSuccessResponse } from '../services/firebase.service';
import { generateReport, getReport, listReports } from '../services/report.service';
import type { AuthenticatedRequest, ReportFormat, ReportType } from '../types';

const router = Router();

router.use(authenticate);

// ── Schemas ──
const generateReportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['expense_report', 'budget_report', 'department_report', 'category_report', 'vendor_report', 'custom']),
  format: z.enum(['pdf', 'excel', 'csv']).default('pdf'),
  config: z.object({
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    departmentId: z.string().optional(),
    category: z.string().optional(),
    groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
    filters: z.record(z.unknown()).optional(),
  }),
});

/**
 * POST /reports/generate
 * Generate a new report
 */
router.post('/generate', requireRole('super_admin', 'ceo', 'finance_manager'), validate(generateReportSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await generateReport({
      title: req.body.title,
      type: req.body.type,
      format: req.body.format,
      config: req.body.config,
      userId: req.user!.uid,
      companyId: req.user!.companyId!,
    });

    res.status(201).json(buildSuccessResponse(report, 'Report generation started'));
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to generate report' });
  }
});

/**
 * GET /reports/:id
 * Get report details and download URL
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await getReport(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Report not found' });
      return;
    }

    // Company scope check
    if (report.companyId !== req.user?.companyId && req.user?.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied' });
      return;
    }

    res.json(buildSuccessResponse(report));
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch report' });
  }
});

/**
 * GET /reports/:id/excel
 * Export report as Excel
 */
router.get('/:id/excel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await getReport(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Report not found' });
      return;
    }

    if (report.format !== 'excel' && report.format !== 'csv') {
      // Regenerate as excel
      const newReport = await generateReport({
        title: report.title,
        type: report.type,
        format: 'excel',
        config: report.config,
        userId: req.user!.uid,
        companyId: req.user!.companyId!,
      });

      if (newReport.url) {
        const base64Data = newReport.url.split(',')[1] || newReport.url;
        const buffer = Buffer.from(base64Data, 'base64');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.xlsx"`);
        res.send(buffer);
        return;
      }
    }

    if (report.url) {
      const base64Data = report.url.split(',')[1] || report.url;
      const buffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.xlsx"`);
      res.send(buffer);
    } else {
      res.status(400).json({ success: false, error: 'Not Ready', message: 'Report is not yet generated' });
    }
  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to export report' });
  }
});

/**
 * GET /reports/:id/pdf
 * Export report as PDF
 */
router.get('/:id/pdf', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await getReport(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Report not found' });
      return;
    }

    let url = report.url;

    if (report.format !== 'pdf') {
      const newReport = await generateReport({
        title: report.title,
        type: report.type,
        format: 'pdf',
        config: report.config,
        userId: req.user!.uid,
        companyId: req.user!.companyId!,
      });
      url = newReport.url;
    }

    if (url) {
      const base64Data = url.split(',')[1] || url;
      const buffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.pdf"`);
      res.send(buffer);
    } else {
      res.status(400).json({ success: false, error: 'Not Ready', message: 'Report is not yet generated' });
    }
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to export report' });
  }
});

export default router;
