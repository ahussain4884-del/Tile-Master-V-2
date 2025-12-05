
import React from 'react';
import { Invoice, InvoiceSettings, PrinterSettings, UnitType, Quotation } from '../types';
import Barcode from './Barcode';
import QRCode from './QRCode';

interface InvoiceTemplateProps {
  invoice: Invoice | Quotation;
  settings: InvoiceSettings;
  printer: PrinterSettings;
  mode?: 'INVOICE' | 'QUOTATION';
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, settings, printer, mode = 'INVOICE' }) => {
  const isA4 = printer.paperSize === 'A4';
  const width = isA4 ? '210mm' : printer.paperSize === '58mm' ? '58mm' : '80mm';
  
  const containerStyle: React.CSSProperties = {
    width: width,
    margin: '0 auto',
    padding: isA4 ? '20mm' : '2mm',
    backgroundColor: '#fff',
    color: '#000',
    fontFamily: 'monospace',
    fontSize: isA4 ? '12px' : '10px',
    lineHeight: 1.2,
  };

  const headerStyle = {
    color: settings.headerColor,
    borderBottom: `2px solid ${settings.headerColor}`,
    paddingBottom: '10px',
    marginBottom: '10px'
  };

  const isQuotation = mode === 'QUOTATION';
  const quotation = isQuotation ? (invoice as Quotation) : null;

  const formatPKR = (amount: number) => {
    return '₨ ' + amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="invoice-template" style={containerStyle}>
       <div style={isA4 ? headerStyle : { textAlign: 'center', marginBottom: '10px' }}>
          {settings.shopLogo && <img src={settings.shopLogo} alt="Logo" style={{ maxHeight: isA4 ? '60px' : '40px', marginBottom: '5px' }} />}
          <h1 style={{ fontSize: isA4 ? '24px' : '16px', fontWeight: 'bold', margin: 0 }}>{isQuotation ? 'QUOTATION' : settings.shopName}</h1>
          {isQuotation && <p style={{margin:0, fontSize: '1.2em', fontWeight: 'bold'}}>{settings.shopName}</p>}
          <p style={{ margin: 0 }}>{settings.address}</p>
          <p style={{ margin: 0 }}>Phone: {settings.phone.join(', ')}</p>
          {settings.email && <p style={{ margin: 0 }}>{settings.email}</p>}
       </div>

       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: isA4 ? 'none' : '1px dashed #000', paddingBottom: '5px' }}>
          <div>
             <p style={{ margin: 0 }}><strong>{isQuotation ? 'Ref #' : 'Inv #'}</strong> {invoice.id}</p>
             <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(invoice.date).toLocaleString()}</p>
             {isQuotation && quotation && <p style={{ margin: 0 }}><strong>Valid Until:</strong> {new Date(quotation.validUntil).toLocaleDateString()}</p>}
          </div>
          {settings.showCustomerInfo && (
             <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0 }}><strong>Customer:</strong></p>
                <p style={{ margin: 0 }}>{invoice.customerName || invoice.customerId}</p>
             </div>
          )}
       </div>

       <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
             <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '2px' }}>Item</th>
                <th style={{ textAlign: 'right', padding: '2px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '2px' }}>Total</th>
             </tr>
          </thead>
          <tbody>
             {invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dotted #ccc' }}>
                   <td style={{ padding: '2px', verticalAlign: 'top' }}>
                      {item.name}
                      {settings.showDiscount && item.discount > 0 && <div style={{ fontSize: '0.8em', color: '#666' }}>Disc: -{formatPKR(item.discount)}</div>}
                   </td>
                   <td style={{ textAlign: 'right', padding: '2px', verticalAlign: 'top' }}>
                      {item.quantity} {item.selectedUnit === UnitType.SQFT ? 'Sq.ft' : 'Box'}
                      <div style={{ fontSize: '0.8em', color: '#666' }}>@{formatPKR(item.unitPrice)}</div>
                   </td>
                   <td style={{ textAlign: 'right', padding: '2px', verticalAlign: 'top' }}>{formatPKR(item.total)}</td>
                </tr>
             ))}
          </tbody>
       </table>

       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', borderTop: '1px dashed #000', paddingTop: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: isA4 ? '40%' : '100%' }}><span>Subtotal:</span><span>{formatPKR(invoice.subtotal)}</span></div>
          {invoice.tax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', width: isA4 ? '40%' : '100%' }}><span>Tax:</span><span>{formatPKR(invoice.tax)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: isA4 ? '40%' : '100%', fontWeight: 'bold', fontSize: '1.2em', borderTop: '1px solid #000', marginTop: '2px' }}><span>Total:</span><span>{formatPKR(invoice.total)}</span></div>
          {!isQuotation && (
             <>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: isA4 ? '40%' : '100%', fontSize: '0.9em' }}><span>Paid:</span><span>{formatPKR((invoice as Invoice).receivedAmount)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: isA4 ? '40%' : '100%', fontSize: '0.9em' }}><span>Change:</span><span>{formatPKR((invoice as Invoice).changeAmount)}</span></div>
             </>
          )}
       </div>

       <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
             {settings.showQRCode && <div style={{ width: '64px' }}><QRCode value={invoice.id} size={64} /></div>}
             {settings.showBarcode && <div><Barcode value={invoice.id} width={1.5} height={40} fontSize={10} displayValue={true} /></div>}
          </div>
          <p style={{ margin: '5px 0', fontSize: '0.9em' }}>{settings.footerText}</p>
          <p style={{ margin: '2px 0', fontSize: '0.8em', fontStyle: 'italic' }}>All amounts in PKR (₨)</p>
          {settings.showManagerName && <p style={{ margin: '5px 0', fontSize: '0.8em', borderTop: '1px solid #eee', paddingTop: '5px' }}>{isQuotation ? 'Prepared By' : 'Manager'}: {settings.managerName}</p>}
          <div style={{ marginTop: '10px', fontSize: '9px', color: '#888', borderTop: '1px dotted #ccc', paddingTop: '5px' }}>{settings.mandatoryFooter}</div>
       </div>
    </div>
  );
};

export default InvoiceTemplate;
