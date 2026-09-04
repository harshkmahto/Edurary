// helper/generateInvoicePdf.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = async (invoiceData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = '#c8963e';
  const textColor = '#000000';
  const lightGray = '#f5f5f5';
  const borderColor = '#e0e0e0';

  // Add border
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header Section
  doc.setFillColor(primaryColor);
  doc.rect(10, 10, pageWidth - 20, 30, 'F');
  
  // Company Name
  doc.setTextColor('#ffffff');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('EDURARY', 20, 30);
  
  // Invoice Title
  doc.setTextColor(primaryColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 30, { align: 'right' });

  // Invoice Details
  let yPos = 50;
  
  doc.setTextColor(textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Invoice ID and Date
  doc.text(`Invoice ID: ${invoiceData.invoiceId || 'N/A'}`, 20, yPos);
  doc.text(`Date: ${new Date(invoiceData.generatedDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })}`, pageWidth - 20, yPos, { align: 'right' });

  yPos += 8;
  doc.text(`Generated: ${new Date(invoiceData.generatedDate).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth - 20, yPos, { align: 'right' });

  // Divider
  yPos += 10;
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.3);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Billing Information
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLING INFORMATION', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // User Details (Left side)
  const user = invoiceData.user || {};
  doc.text(`Name: ${user.name || 'N/A'}`, 20, yPos);
  yPos += 6;
  doc.text(`Email: ${user.email || 'N/A'}`, 20, yPos);
  yPos += 6;
  doc.text(`Phone: ${user.phone || 'N/A'}`, 20, yPos);

  // Subscription Details (Right side)
  const sub = invoiceData.subscription || {};
  doc.text('SUBSCRIPTION DETAILS', pageWidth - 20, yPos - 16, { align: 'right' });
  doc.text(`Plan: ${sub.title || invoiceData.payment?.planName || 'N/A'}`, pageWidth - 20, yPos - 8, { align: 'right' });
  doc.text(`Price: ₹${invoiceData.payment?.price || 0}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 6;
  doc.text(`Selling Price: ₹${invoiceData.payment?.sellingPrice || 0}`, pageWidth - 20, yPos, { align: 'right' });
  
  // Transaction ID
  if (invoiceData.payment?.transactionId) {
    yPos += 6;
    doc.text(`Transaction ID: ${invoiceData.payment.transactionId}`, pageWidth - 20, yPos, { align: 'right' });
  }

  // Divider
  yPos += 12;
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.3);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Payment Breakdown Table
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT BREAKDOWN', 20, yPos);

  yPos += 8;
  
  // Calculate available width for table
  const tableWidth = pageWidth - 40; // 20mm margin on each side
  
  // Use autoTable with correct syntax and proper sizing
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Amount']],
    body: [
      ['Subtotal', `₹${invoiceData.financialBreakdown?.subtotal || 0}`],
      ['Discount', `-₹${invoiceData.financialBreakdown?.discount || 0}`],
      ['Total', `₹${invoiceData.financialBreakdown?.total || 0}`],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: '#ffffff',
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 10,
      textColor: textColor,
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 'auto', halign: 'right' },
    },
    styles: {
      lineColor: borderColor,
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: { left: 20, right: 20 },
    tableWidth: 'auto',
  });

  // Get final Y position after table
  yPos = doc.lastAutoTable.finalY + 15;

  // Subscription Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBSCRIPTION STATUS', 20, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  const status = invoiceData.subscriptionDetails?.subscriptionStatus || 'N/A';
  const statusColor = status === 'active' ? '#4ade80' : status === 'expired' ? '#ff4444' : '#ffaa00';
  
  doc.setTextColor(statusColor);
  doc.text(`Status: ${status.toUpperCase()}`, 20, yPos);
  doc.setTextColor(textColor);
  
  yPos += 6;
  if (invoiceData.subscriptionDetails?.startDate) {
    doc.text(`Start Date: ${new Date(invoiceData.subscriptionDetails.startDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}`, 20, yPos);
    yPos += 6;
  }
  if (invoiceData.subscriptionDetails?.endDate) {
    doc.text(`End Date: ${new Date(invoiceData.subscriptionDetails.endDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}`, 20, yPos);
    yPos += 6;
  }

  // Remaining Days
  if (invoiceData.additionalInfo?.remainingDays !== null && invoiceData.additionalInfo?.remainingDays !== undefined) {
    const days = invoiceData.additionalInfo.remainingDays;
    const daysColor = days > 7 ? '#4ade80' : '#ff4444';
    doc.setTextColor(daysColor);
    doc.text(`Remaining Days: ${days} days`, 20, yPos);
    doc.setTextColor(textColor);
    yPos += 10;
  }

  // Divider
  yPos += 5;
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.3);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Footer Section
  const footerY = pageHeight - 35;
  
  // Invoice Note
  if (invoiceData.invoiceNote) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(invoiceData.invoiceNote, 20, footerY);
  }

  // Thank You Message
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('Thank you for your business!', pageWidth / 2, footerY + 8, { align: 'center' });

  // System Generated Footer
  doc.setTextColor('#999999');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const timestamp = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`This invoice was generated automatically by EDURARY System on ${timestamp}`, pageWidth / 2, footerY + 15, { align: 'center' });

  // Save the PDF
  const fileName = `Invoice-${invoiceData.invoiceId || 'subscription'}.pdf`;
  doc.save(fileName);
};