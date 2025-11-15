const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const generateReceipt = async (order) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 550;
  const margin = 50;
  const lineHeight = 20;

  // Header
  page.drawText('CYBER-CAFÉ', {
    x: margin,
    y,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  });
  y -= 30;

  page.drawText('Receipt', {
    x: margin,
    y,
    size: 16,
    font: boldFont,
  });
  y -= 30;

  // Order Details
  page.drawText(`Ticket: ${order.ticket_number}`, {
    x: margin,
    y,
    size: 12,
    font: boldFont,
  });
  y -= lineHeight;

  page.drawText(`Date: ${new Date(order.created_at).toLocaleString('en-IN')}`, {
    x: margin,
    y,
    size: 10,
    font,
  });
  y -= lineHeight * 1.5;

  // Customer Info
  page.drawText('Customer Details:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
  });
  y -= lineHeight;

  if (order.customer_name) {
    page.drawText(`Name: ${order.customer_name}`, {
      x: margin,
      y,
      size: 10,
      font,
    });
    y -= lineHeight;
  }

  page.drawText(`Phone: ${order.customer_phone}`, {
    x: margin,
    y,
    size: 10,
    font,
  });
  y -= lineHeight * 1.5;

  // Items
  page.drawText('Items:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
  });
  y -= lineHeight;

  if (order.items && Array.isArray(order.items)) {
    order.items.forEach((item) => {
      const itemText = `${item.service_name || 'Service'} - ${item.quantity} × ₹${item.unit_rate}`;
      page.drawText(itemText, {
        x: margin,
        y,
        size: 10,
        font,
      });
      y -= lineHeight;

      page.drawText(`Subtotal: ₹${item.subtotal}`, {
        x: margin + 20,
        y,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      y -= lineHeight * 1.2;
    });
  }

  y -= lineHeight;

  // Totals
  const totalsY = y;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 350, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= lineHeight;

  page.drawText(`Subtotal: ₹${order.total_amount}`, {
    x: 250,
    y,
    size: 10,
    font,
  });
  y -= lineHeight;

  if (order.tax_amount > 0) {
    page.drawText(`Tax: ₹${order.tax_amount}`, {
      x: 250,
      y,
      size: 10,
      font,
    });
    y -= lineHeight;
  }

  if (order.service_charge > 0) {
    page.drawText(`Service Charge: ₹${order.service_charge}`, {
      x: 250,
      y,
      size: 10,
      font,
    });
    y -= lineHeight;
  }

  page.drawLine({
    start: { x: margin, y },
    end: { x: 350, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= lineHeight;

  page.drawText(`Total: ₹${order.final_amount}`, {
    x: 250,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  });
  y -= lineHeight * 2;

  // Payment Info
  page.drawText(`Payment: ${order.payment_method} - ${order.payment_status}`, {
    x: margin,
    y,
    size: 10,
    font,
  });
  y -= lineHeight;

  page.drawText(`Status: ${order.status}`, {
    x: margin,
    y,
    size: 10,
    font,
  });

  // Footer
  page.drawText('Thank you for your business!', {
    x: margin,
    y: 50,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

module.exports = { generateReceipt };

