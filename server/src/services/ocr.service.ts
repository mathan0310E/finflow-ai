// ──────────────────────────────────────────────
// OCR Service — Receipt Scanning with Tesseract.js
// ──────────────────────────────────────────────

import type { OcrData } from '../types';

// Lazy import Tesseract.js (it's heavy)
let Tesseract: any = null;

async function getTesseract() {
  if (!Tesseract) {
    try {
      Tesseract = await import('tesseract.js');
    } catch {
      throw new Error('Tesseract.js is not available. Install it with: npm install tesseract.js');
    }
  }
  return Tesseract;
}

/**
 * Scan a receipt image and extract structured data
 */
export async function scanReceipt(
  imagePath: string
): Promise<OcrData> {
  try {
    const tesseract = await getTesseract();
    const { createWorker } = tesseract;

    const worker = await createWorker('eng');
    const { data } = await worker.recognize(imagePath);
    await worker.terminate();

    const text = data.text;
    const parsed = parseReceiptText(text);

    return {
      ...parsed,
      confidence: Math.round(data.confidence) / 100,
    };
  } catch (error) {
    console.error('OCR scanning failed:', error);
    return {
      confidence: 0,
      storeName: undefined,
      amount: undefined,
      gst: undefined,
      invoiceNumber: undefined,
      date: undefined,
      items: [],
      tax: undefined,
    };
  }
}

/**
 * Parse raw OCR text to extract receipt fields
 */
function parseReceiptText(text: string): Omit<OcrData, 'confidence'> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const result: Omit<OcrData, 'confidence'> = {
    storeName: extractStoreName(lines),
    amount: extractTotal(lines),
    gst: extractGst(lines),
    invoiceNumber: extractInvoiceNumber(lines),
    date: extractDate(lines),
    items: extractItems(lines),
    tax: extractTax(lines),
  };

  return result;
}

/**
 * Extract store name from receipt (usually first few lines)
 */
function extractStoreName(lines: string[]): string | undefined {
  // Typically the first non-empty, non-numeric line
  for (const line of lines.slice(0, 5)) {
    if (
      line.length > 2 &&
      !/^[\d\s\-.,$%#@&*()+/\\]+$/.test(line) &&
      !line.toLowerCase().includes('invoice') &&
      !line.toLowerCase().includes('receipt') &&
      !line.toLowerCase().includes('tax') &&
      !line.toLowerCase().includes('total')
    ) {
      return line;
    }
  }
  return undefined;
}

/**
 * Extract total amount from receipt text
 */
function extractTotal(lines: string[]): number | undefined {
  const totalPatterns = [
    /total\s*(?:due|amount|:)?\s*\$?\s*([\d,]+\.\d{2})/i,
    /total\s*\$?\s*([\d,]+\.\d{2})/i,
    /amount\s*(?:due|:)?\s*\$?\s*([\d,]+\.\d{2})/i,
    /grand\s*total\s*\$?\s*([\d,]+\.\d{2})/i,
    /\$?\s*([\d,]+\.\d{2})\s*total/i,
    /balance\s*(?:due|:)?\s*\$?\s*([\d,]+\.\d{2})/i,
  ];

  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
  }

  // Fallback: find the largest dollar amount
  const amounts = lines
    .map((l) => {
      const m = l.match(/\$?\s*([\d,]+\.\d{2})/);
      return m ? parseFloat(m[1].replace(/,/g, '')) : 0;
    })
    .filter((a) => a > 0);

  return amounts.length > 0 ? Math.max(...amounts) : undefined;
}

/**
 * Extract GST/VAT number
 */
function extractGst(lines: string[]): string | undefined {
  const gstPatterns = [
    /(?:gst|vat|tax)\s*(?:in|reg|no|number|#|:)?\s*:?\s*([\w\d\-]+)/i,
    /([\d]{2}[\w]{3}[\d]{4}[\d\w]{1}[\d]{1}[\w\d]{3})/i, // Indian GST format
  ];

  for (const line of lines) {
    for (const pattern of gstPatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return undefined;
}

/**
 * Extract invoice/receipt number
 */
function extractInvoiceNumber(lines: string[]): string | undefined {
  const invoicePatterns = [
    /(?:invoice|receipt|order|bill)\s*(?:no|number|#|:)?\s*:?\s*([\w\d\-/]+)/i,
    /(?:inv|rcpt)\s*(?:no|#|:)?\s*:?\s*([\w\d\-/]+)/i,
  ];

  for (const line of lines) {
    for (const pattern of invoicePatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return undefined;
}

/**
 * Extract date from receipt
 */
function extractDate(lines: string[]): string | undefined {
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, // YYYY-MM-DD
    /(?:date|dated|purchased|on)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2}),?\s*(\d{4})/i,
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        // Normalize the date
        try {
          const dateStr = match[1]?.match(/\d{4}/)
            ? `${match[1]}-${match[2]?.padStart(2, '0')}-${match[3]?.padStart(2, '0')}`
            : match[0];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch {
          continue;
        }
      }
    }
  }
  return undefined;
}

/**
 * Extract line items from receipt
 */
function extractItems(lines: string[]): string[] | undefined {
  const items: string[] = [];
  let inItems = false;

  const itemStartPatterns = [
    /(?:items|products|qty|description|item)/i,
    /^-+$/,
  ];

  const itemEndPatterns = [
    /(?:subtotal|total|tax|balance|payment)/i,
  ];

  for (const line of lines) {
    if (!inItems) {
      if (itemStartPatterns.some((p) => p.test(line))) {
        inItems = true;
      }
      continue;
    }

    if (itemEndPatterns.some((p) => p.test(line))) {
      break;
    }

    // Skip lines that are purely numbers, dates, or separators
    if (
      line.length > 3 &&
      !/^[\d\s\-.,$%]+$/.test(line) &&
      !/^=+$/.test(line) &&
      !/^-+$/.test(line) &&
      !/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(line)
    ) {
      items.push(line);
    }
  }

  return items.length > 0 ? items.slice(0, 20) : undefined;
}

/**
 * Extract tax amount
 */
function extractTax(lines: string[]): number | undefined {
  const taxPatterns = [
    /(?:tax|vat|gst|sales\s*tax)\s*(?:amount|:)?\s*\$?\s*([\d,]+\.\d{2})/i,
    /tax\s*\$?\s*([\d,]+\.\d{2})/i,
  ];

  for (const line of lines) {
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
  }
  return undefined;
}
