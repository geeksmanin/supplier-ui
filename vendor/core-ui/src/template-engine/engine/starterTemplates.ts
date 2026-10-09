/**
 * Default starter HTML template for invoice / voucher export
 * Contains placeholders for company details, party details, F6 dispatch info,
 * itemized grid with loop ({{#items}}...{{/items}}), IRN QR code, and financial summary.
 */
export const DEFAULT_STARTER_HTML_TEMPLATE = `<div style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #0f172a; padding: 24px; box-sizing: border-box; background: #ffffff; width: 100%; max-width: 210mm; margin: 0 auto;">
  <!-- Header Bar -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 12px;">
    <div>
      <div style="font-size: 20px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">{{company.Name}}</div>
      <div style="font-size: 11px; color: #475569; margin-top: 2px;">{{company.Address}}</div>
      <div style="font-size: 11px; color: #475569; margin-top: 1px;">
        GSTIN: <b style="color: #0f172a;">{{company.GSTIN}}</b> &nbsp;|&nbsp; DL: {{company.DLNo}} &nbsp;|&nbsp; Ph: {{company.Phone}}
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 16px; font-weight: 800; color: #2563eb; letter-spacing: 1px;">TAX INVOICE</div>
      <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px;">Doc No: {{doc.No}}</div>
      <div style="font-size: 11px; color: #475569;">Date: {{doc.Date | date}}</div>
      {{#if irn_qr_url}}
      <div style="margin-top: 6px;">
        <img src="{{irn_qr_url}}" style="width: 76px; height: 76px; border: 1px solid #cbd5e1; border-radius: 4px;" alt="IRN QR" />
        <div style="font-size: 8px; color: #64748b; text-align: center;">E-INVOICE QR</div>
      </div>
      {{/if}}
    </div>
  </div>

  <!-- Party & Dispatch Information [F6] -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
    <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background-color: #f8fafc;">
      <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Billed / Shipped To:</div>
      <div style="font-size: 13px; font-weight: 800; color: #0f172a;">{{party.Name}}</div>
      <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.3;">{{party.Address}}</div>
      <div style="font-size: 10px; color: #334155; margin-top: 4px;">
        GSTIN: <b>{{party.GSTIN}}</b> &nbsp;|&nbsp; DL No: <b>{{party.DLNo}}</b>
      </div>
      <div style="font-size: 10px; color: #64748b;">Contact: {{party.Mobile}}</div>
    </div>

    <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background-color: #f8fafc;">
      <div style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Dispatch & Transport [F6]:</div>
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 3px 8px; font-size: 10.5px;">
        <span style="color: #64748b;">Transport:</span> <span style="font-weight: 700;">{{f6.Transport}}</span>
        <span style="color: #64748b;">LR No & Date:</span> <span><b>{{f6.LRNo}}</b> &nbsp;({{f6.LRDate | date}})</span>
        <span style="color: #64748b;">Order / DC No:</span> <span><b>{{f6.OrderNo}}</b> / {{f6.DCNo}}</span>
        <span style="color: #64748b;">Due Date:</span> <span>{{f6.DueDate | date}}</span>
        <span style="color: #64748b;">Station / City:</span> <span>{{f6.Station}}</span>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5px;">
    <thead>
      <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; text-align: left;">
        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; width: 28px; text-align: center;">#</th>
        <th style="padding: 6px 6px; border: 1px solid #cbd5e1;">Product Description</th>
        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; width: 55px; text-align: center;">Pack</th>
        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; width: 55px; text-align: center;">HSN</th>
        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; width: 45px; text-align: right;">Qty</th>
        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; width: 65px; text-align: right;">Rate</th>
        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; width: 45px; text-align: right;">Disc%</th>
        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; width: 50px; text-align: right;">GST%</th>
        <th style="padding: 6px 6px; border: 1px solid #cbd5e1; width: 80px; text-align: right;">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">{{item.Index}}</td>
        <td style="padding: 5px 6px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a;">
          {{item.Name}}
        </td>
        <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">{{item.Packing}}</td>
        <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">{{item.HSN}}</td>
        <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700;">{{item.Qty}} {{item.Unit}}</td>
        <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: right;">{{item.SalePrice | inr}}</td>
        <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: right; color: #64748b;">{{item.Discount}}</td>
        <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: right; color: #64748b;">{{item.TaxPercent}}</td>
        <td style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 800; color: #0f172a;">{{item.NetAmount | inr}}</td>
      </tr>
      {{/items}}
    </tbody>
  </table>

  <!-- Financial Summary & Totals -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-top: 1.5px solid #cbd5e1; padding-top: 10px;">
    <div style="max-width: 58%;">
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Amount in Words:</div>
      <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 2px;">
        {{total.NetAmount | inWords}}
      </div>
      <div style="font-size: 10px; color: #64748b; margin-top: 8px;">
        <b>Bank:</b> HDFC Bank &nbsp;|&nbsp; <b>A/c:</b> 50200012345678 &nbsp;|&nbsp; <b>IFSC:</b> HDFC0001234
      </div>
    </div>

    <div style="width: 250px; font-size: 11px;">
      <div style="display: flex; justify-content: space-between; padding: 2px 0;">
        <span style="color: #64748b;">Gross Total:</span>
        <span style="font-weight: 600;">{{total.GrossAmount | inr}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 2px 0;">
        <span style="color: #64748b;">Discount:</span>
        <span style="font-weight: 600; color: #dc2626;">- {{total.DiscountAmount | inr}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 2px 0;">
        <span style="color: #64748b;">Taxable Value:</span>
        <span style="font-weight: 600;">{{total.TaxableAmount | inr}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 2px 0;">
        <span style="color: #64748b;">Total GST / Tax:</span>
        <span style="font-weight: 600;">{{total.GSTAmount | inr}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 2px solid #0f172a; margin-top: 4px; font-size: 13px; font-weight: 800;">
        <span>Invoice Total:</span>
        <span style="color: #1d4ed8;">{{total.NetAmount | inr}}</span>
      </div>
    </div>
  </div>

  <!-- Signatory & Terms -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 9.5px; color: #64748b;">
    <div>
      <div>* Subject to local jurisdiction only.</div>
      <div>* Goods once sold will not be taken back or exchanged.</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 24px;">For {{company.Name}}</div>
      <div style="border-top: 1px solid #94a3b8; padding-top: 3px; font-weight: 600;">Authorized Signatory</div>
    </div>
  </div>
</div>`;
