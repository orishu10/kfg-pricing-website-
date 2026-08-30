import type { Pricing } from '../../../api';
import { fmtDate } from './helpers';

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const C = {
  log: '#e9e4f2', green: '#e6efe1', pink: '#f6e2e2', blue: '#dcecf4',
  grey: '#e6e6e6', tariff: '#e7dbf1', yellow: '#f6efc0',
};

const STYLE = `
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #222; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: center;
            border-bottom: 3px solid #c41230; padding-bottom: 6px; margin-bottom: 12px; }
  .header h1 { font-size: 20px; margin: 0; letter-spacing: 0.5px; }
  .header .meta { font-size: 11px; color: #555; text-align: right; }
  .cols { display: grid; grid-template-columns: 1fr 250px; gap: 10px; align-items: start; }
  .stack { display: flex; flex-direction: column; gap: 14px; }
  .panel { position: relative; border: 1px solid rgba(0,0,0,0.25); border-radius: 6px;
           padding: 13px 9px 9px; }
  .tab { position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
         background: #efefef; border: 1px solid rgba(0,0,0,0.25); border-radius: 10px;
         padding: 1px 7px; font-size: 7.5px; font-weight: 800; letter-spacing: 0.5px;
         color: #555; text-transform: uppercase; white-space: nowrap; }
  .grid { display: grid; gap: 5px; }
  .g2 { grid-template-columns: repeat(2, 1fr); }
  .g3 { grid-template-columns: repeat(3, 1fr); }
  .g4 { grid-template-columns: repeat(4, 1fr); }
  .g5 { grid-template-columns: repeat(5, 1fr); }
  .fld { min-width: 0; }
  .lbl { font-size: 7.5px; font-weight: 700; color: #3a3a3a; margin-bottom: 2px; }
  .cap { font-size: 7.5px; color: #777; margin-bottom: 3px; }
  .val { background: #fff; border: 1px solid #bbb; border-radius: 3px; padding: 3px 5px;
         font-size: 10px; min-height: 17px; display: flex; justify-content: space-between; align-items: center; }
  .unit { color: #888; font-size: 9px; margin-left: 4px; }
  .attr { display: flex; gap: 6px; }
  .attr .box { flex: 1; border: 1px solid #ccc; border-radius: 4px; padding: 5px; }
  .attr .k { font-size: 7.5px; color: #888; }
  .attr .v { font-size: 10px; font-weight: 600; }
`;

export const buildPricingSheetHtml = (p: Pricing): string => {
  const g = (k: keyof Pricing) => (p[k] == null ? '' : String(p[k]));

  const fld = (label: string, value: string, unit = '') => `
    <div class="fld">
      ${label ? `<div class="lbl">${esc(label)}</div>` : ''}
      <div class="val"><span>${esc(value)}</span>${unit ? `<span class="unit">${unit}</span>` : ''}</div>
    </div>`;

  const panel = (label: string, color: string, inner: string) => `
    <div class="panel" style="background:${color}">
      ${label ? `<div class="tab">${esc(label)}</div>` : ''}
      ${inner}
    </div>`;

  const box = (color: string, inner: string) =>
    `<div class="panel" style="background:${color}">${inner}</div>`;

  const left = `
    ${panel('DESCRIPTION', '#fff', `
      <div class="grid g3">
        ${fld('Item', g('description'))}
        ${fld('Currency', g('currency'))}
        ${fld('Pack Size', g('pack_size') || g('size'))}
        ${fld('Supplier', g('supplier_name'))}
        ${fld('Customer', g('customer_name'))}
        ${fld('KFG SKU #', g('kfg_sku'))}
      </div>`)}

    ${panel('LOG', C.log, `
      <div class="grid g4" style="margin-bottom:5px">
        ${fld('Unit Weight', g('unit_weight'))}
        ${fld('Units / Case', g('units_in_case'))}
        ${fld('Cases / Pallet', g('cases_per_pallet'))}
        ${fld('Cases / FCL', g('cases_in_fcl'))}
      </div>
      <div class="grid g4">
        ${fld('FOB', g('fob'), '$')}
        ${fld('CIF', g('cif'), '$')}
        ${fld('DAP', g('dap'), '$')}
        ${fld('DDP', g('ddp'), '$')}
      </div>`)}

    ${panel('SUPPLIER', C.green, `
      <div class="grid g5">
        ${fld('Price - Unit', g('supplier_price_unit'), '₪')}
        ${fld('Price - Unit', g('price_unit_usd'), '$')}
        ${fld('Price - Case', g('supplier_price_case'), '₪')}
        ${fld('Price - Case', g('price_case_usd'), '$')}
        ${fld('Price - FCL', g('price_fcl_usd'), '$')}
      </div>`)}

    <div class="grid g3">
      ${panel('SUBTOTAL 1', C.pink, `<div class="cap">LOG + Supplier + Supervision</div>${fld('', g('sub_total_1'), '₪')}`)}
      ${panel('SUBTOTAL 2', C.pink, `<div class="cap">LOG + Supplier + US Tariff</div>${fld('', g('sub_total_2'), '₪')}`)}
      ${panel('TOTAL', C.blue, `<div class="cap">Subtotal 2 + KFG</div>${fld('', g('total'), '₪')}`)}
    </div>

    <div class="grid g2">
      ${panel('KFG COMMISSION', C.grey, `<div class="grid g2">${fld('', g('kfg_commission_pct'), '%')}${fld('', g('kfg_commission'), '₪')}</div>`)}
      ${panel('US TARIFF', C.tariff, `<div class="grid g2">${fld('', g('us_tariff_pct'), '%')}${fld('', g('us_tariff'), '$')}</div>`)}
    </div>

    ${panel('SUPERVISION', '#fff', `<div class="grid g2">${fld('Cost', g('supervision_cost'), '₪')}${fld('Fees', g('supervision_fees'), '₪')}</div>`)}

    <div class="grid g3">
      ${box(C.pink, `${fld('Cost - Unit', g('cost_unit'), '₪')}<div style="margin-top:5px">${fld('Cost - Case', g('cost_case'), '₪')}</div>`)}
      ${box(C.blue, `${fld('Price - Unit', g('price_unit'), '₪')}<div style="margin-top:5px">${fld('Price - Case', g('price_case'), '₪')}</div>`)}
      ${box(C.yellow, `${fld('SAP Price - Unit', g('sap_price_unit'), '₪')}<div style="margin-top:5px">${fld('SAP Price - Case', g('sap_price_case'), '₪')}</div>`)}
    </div>`;

  const right = `
    ${panel('', '#fff', `
      <div class="lbl" style="font-size:9px;margin-bottom:5px">Currency Exchange</div>
      <div style="margin-bottom:5px">${fld('', g('currency_pair'))}</div>
      <div class="grid g2">${fld('Ex Rate', g('ex_rate'))}</div>`)}

    ${panel('', C.log, `
      <div style="margin-bottom:5px">${fld('Route', g('route'))}</div>
      <div class="grid g2">${fld('Container Type', g('container_type'))}${fld('Pallets', g('pallets'))}</div>`)}

    ${panel('', C.green, fld('Incoterms - Supplier', g('incoterms_supplier')))}

    ${panel('', '#fff', `
      <div class="lbl" style="font-size:9px;margin-bottom:5px">1KG Indicator</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${box(C.pink, fld('Cost - 1KG', g('cost_1kg'), '₪'))}
        ${box(C.blue, fld('Price - 1KG', g('price_1kg'), '₪'))}
        ${box(C.yellow, fld('SAP Price - 1KG', g('sap_price_1kg'), '₪'))}
      </div>`)}

    ${panel('', '#fff', fld('Import Factor', g('import_factor'), '%'))}

    <div class="attr">
      <div class="box"><div class="k">Created by</div><div class="v">${esc(g('created_by') || '—')}</div></div>
      <div class="box"><div class="k">Last Updated by</div><div class="v">${esc(g('updated_by') || '—')}</div></div>
    </div>`;

  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Pricing ${esc(p.id)}</title><style>${STYLE}</style></head>
<body>
  <div class="header">
    <h1>PRICING</h1>
    <div class="meta">
      # ${esc(p.id)}${p.kfg_sku ? ` &middot; SKU ${esc(p.kfg_sku)}` : ''} &middot; Status: ${esc(g('status') || '—')}<br/>
      ${esc(fmtDate(p.updated_at ?? p.created_at))}
    </div>
  </div>
  <div class="cols">
    <div class="stack">${left}</div>
    <div class="stack">${right}</div>
  </div>
</body>
</html>`;
};
