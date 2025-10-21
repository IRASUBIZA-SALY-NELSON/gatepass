import PDFDocument from 'pdfkit';

export function generateVisitsPdf({ title = 'Visits Report', visits = [] }) {
  const doc = new PDFDocument({ margin: 40 });
  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10);

  visits.forEach((v, idx) => {
    doc.text(`#${idx + 1} VisitID: ${v.visitId}`);
    doc.text(`Date: ${new Date(v.visitDate).toLocaleString()}`);
    doc.text(`Status: ${v.status}`);
    doc.text(`Student: ${v.studentId}`);
    if (v.parent) doc.text(`Parent: ${v.parent.name || v.parentId}`);
    doc.moveDown(0.5);
  });

  doc.end();
  return doc;
}
