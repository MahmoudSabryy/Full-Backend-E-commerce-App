import fs from "fs";
import PDFDocument from "pdfkit";

async function createInvoice(invoice, path) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // pipe BEFORE end
  doc.pipe(fs.createWriteStream(path));

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
}

/* ================= HEADER ================= */
function generateHeader(doc) {
  doc
    .fillColor("#09c")
    .fontSize(20)
    .text("E-Commerce Invoice", 50, 45)
    .moveDown();

  generateHr(doc, 80);
}

/* ================= CUSTOMER INFO ================= */
function generateCustomerInformation(doc, invoice) {
  const top = 100;

  doc
    .fontSize(12)
    .fillColor("#000")
    .text("Invoice Number:", 50, top)
    .font("Helvetica-Bold")
    .text(invoice.invoice_nr, 150, top)
    .font("Helvetica")
    .text("Invoice Date:", 50, top + 20)
    .text(formatDate(new Date()), 150, top + 20);

  doc
    .font("Helvetica-Bold")
    .text("Shipping To:", 300, top)
    .font("Helvetica")
    .text(invoice.shipping.name, 300, top + 20)
    .text(invoice.shipping.address, 300, top + 40)
    .text(
      `${invoice.shipping.city}, ${invoice.shipping.state}, ${invoice.shipping.country}`,
      300,
      top + 60
    );

  generateHr(doc, 200);
}

/* ================= TABLE ================= */
function generateInvoiceTable(doc, invoice) {
  const tableTop = 220;

  doc.font("Helvetica-Bold");
  generateTableRow(doc, tableTop, "Product", "Price", "Qty", "Total");
  generateHr(doc, tableTop + 20);

  doc.font("Helvetica");

  invoice.items.forEach((item, index) => {
    const position = tableTop + (index + 1) * 30;

    generateTableRow(
      doc,
      position,
      item.name,
      formatCurrency(item.price),
      item.quantity,
      formatCurrency(item.finalPrice)
    );

    generateHr(doc, position + 20);
  });

  const subtotalPosition = tableTop + (invoice.items.length + 1) * 30;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    formatCurrency(invoice.subtotal)
  );

  const totalPosition = subtotalPosition + 25;
  generateTableRow(
    doc,
    totalPosition,
    "",
    "",
    "Total",
    formatCurrency(invoice.Total)
  );
}

/* ================= ROW ================= */
function generateTableRow(doc, y, name, price, qty, total) {
  doc
    .fontSize(10)
    .text(name, 50, y)
    .text(price, 250, y, { width: 90, align: "right" })
    .text(qty, 340, y, { width: 90, align: "right" })
    .text(total, 0, y, { align: "right" });
}

/* ================= FOOTER ================= */
function generateFooter(doc) {
  doc
    .fontSize(10)
    .fillColor("#555")
    .text("Thank you for shopping with us!", 50, 760, {
      align: "center",
      width: 500,
    });
}

/* ================= HELPERS ================= */
function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(amount) {
  return `${amount.toFixed(2)} EGP`;
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
}

export default createInvoice;
