import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  getItem,
  updateItem,
  deleteItem,
  type Item,
  type ItemPayload,
} from "../../api";
import {
  CONTAINER_OPTIONS,
  EMPTY_FORM,
  INCOTERMS_OPTIONS,
} from "./utils/consts";
import { toNum, toInt, fmt } from "./utils/helpers";
import type { FormState } from "./utils/types";
import { spacing } from "@mui/system";

// Auto-calculate derived fields from current form state
function calcDerived(f: FormState): Partial<FormState> {
  const unit = parseFloat(f.supplier_price_unit) || 0;
  const uic = parseInt(f.units_in_case, 10) || 0;
  const cif = parseInt(f.cases_in_fcl, 10) || 0;
  const wt = parseFloat(f.unit_weight) || 0;
  const logi = parseFloat(f.logistics) || 0;
  const tar = parseFloat(f.us_tariff) || 0;
  const kfg = parseFloat(f.kfg_commission) || 0;

  const sp_case = unit && uic ? unit * uic : null;
  const sp_fcl = sp_case && cif ? sp_case * cif : null;
  const sp_1kg = unit && wt ? unit / wt : null;
  const st1 = logi || unit ? logi + unit : null;
  const st2 = st1 != null ? st1 + tar : null;
  const tot = st2 != null ? st2 + kfg : null;

  return {
    supplier_price_case: sp_case != null ? sp_case.toFixed(4) : "",
    supplier_price_fcl: sp_fcl != null ? sp_fcl.toFixed(4) : "",
    supplier_price_1kg: sp_1kg != null ? sp_1kg.toFixed(4) : "",
    sub_total_1: st1 != null ? st1.toFixed(4) : "",
    sub_total_2: st2 != null ? st2.toFixed(4) : "",
    total: tot != null ? tot.toFixed(4) : "",
  };
}

function itemToForm(item: Item): FormState {
  return {
    name: item.name ?? "",
    supplier_incoterms: item.supplier_incoterms ?? "",
    customer_incoterms: item.customer_incoterms ?? "",
    logistics: fmt(item.logistics),
    container_type: item.container_type ?? "",
    fob: fmt(item.fob),
    cif: fmt(item.cif),
    dap: fmt(item.dap),
    ddp: fmt(item.ddp),
    cases_in_fcl: item.cases_in_fcl != null ? String(item.cases_in_fcl) : "",
    units_in_case: item.units_in_case != null ? String(item.units_in_case) : "",
    unit_weight: fmt(item.unit_weight),
    supplier_price_unit: fmt(item.supplier_price_unit),
    supplier_price_case: fmt(item.supplier_price_case),
    supplier_price_fcl: fmt(item.supplier_price_fcl),
    supplier_price_1kg: fmt(item.supplier_price_1kg),
    sub_total_1: fmt(item.sub_total_1),
    us_tariff: fmt(item.us_tariff),
    sub_total_2: fmt(item.sub_total_2),
    import_factor: fmt(item.import_factor),
    kfg_commission: fmt(item.kfg_commission),
    total: fmt(item.total),
    cost_unit: fmt(item.cost_unit),
    cost_case: fmt(item.cost_case),
    price_unit: fmt(item.price_unit),
    price_case: fmt(item.price_case),
    sap_price_unit: fmt(item.sap_price_unit),
    sap_price_case: fmt(item.sap_price_case),
    cases_per_pallets: fmt(item.cas),
    
  };
}

// ── Sub-components ─────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography
          variant="overline"
          color="primary"
          fontWeight={700}
          display="block"
          mb={2}
        >
          {title}
        </Typography>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        fontWeight={600}
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {label}
      </Typography>
      <Box
        sx={{
          bgcolor: "action.hover",
          borderRadius: 1,
          px: 1.5,
          py: 0.75,
          mt: 0.5,
        }}
      >
        <Typography variant="body2" fontFamily="monospace">
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

function FormTextField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <Box>
      <TextField
        label={label}
        size="small"
        fullWidth
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
}

function NumField({
  label,
  value,
  onChange,
  calc,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  calc?: boolean;
}) {
  return (
    <Box>
      <TextField
        label={label}
        size="small"
        fullWidth
        type="number"
        inputProps={{ step: "0.0001" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        InputProps={
          calc
            ? {
                endAdornment: (
                  <Chip
                    label="auto"
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: 9,
                      bgcolor: "rgba(111,66,193,0.25)",
                      color: "#b39ddb",
                      ml: 0.5,
                    }}
                  />
                ),
              }
            : undefined
        }
        sx={
          calc
            ? {
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(111,66,193,0.08)",
                  "& fieldset": { borderColor: "rgba(111,66,193,0.4)" },
                },
                "& .MuiInputLabel-root": { color: "#9b74d9" },
              }
            : undefined
        }
      />
    </Box>
  );
}

function IntField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Box>
      <TextField
        label={label}
        size="small"
        fullWidth
        type="number"
        inputProps={{ step: "1", min: "0" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
      />
    </Box>
  );
}

function FormSelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Box>
      <FormControl size="small" fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          <MenuItem value="">— select —</MenuItem>
          {options.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

// ── Main page ──────────────────────────────────────────────────────────
export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getItem(itemId!)
      .then((data) => {
        setItem(data);
        setForm(itemToForm(data));
      })
      .catch(() => navigate("/"));
    // navigate is a stable reference — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  // Recalculate derived fields whenever relevant inputs change
  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      return { ...next, ...calcDerived(next) };
    });
  };

  // For non-derived fields, just update directly
  const setDirect = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    const payload: ItemPayload = {
      name: form.name,
      supplier_incoterms: form.supplier_incoterms || null,
      customer_incoterms: form.customer_incoterms || null,
      logistics: toNum(form.logistics),
      container_type: form.container_type || null,
      fob: toNum(form.fob),
      cif: toNum(form.cif),
      dap: toNum(form.dap),
      ddp: toNum(form.ddp),
      cases_in_fcl: toInt(form.cases_in_fcl),
      units_in_case: toInt(form.units_in_case),
      unit_weight: toNum(form.unit_weight),
      supplier_price_unit: toNum(form.supplier_price_unit),
      supplier_price_case: toNum(form.supplier_price_case),
      supplier_price_fcl: toNum(form.supplier_price_fcl),
      supplier_price_1kg: toNum(form.supplier_price_1kg),
      sub_total_1: toNum(form.sub_total_1),
      us_tariff: toNum(form.us_tariff),
      sub_total_2: toNum(form.sub_total_2),
      import_factor: toNum(form.import_factor),
      kfg_commission: toNum(form.kfg_commission),
      total: toNum(form.total),
      cost_unit: toNum(form.cost_unit),
      cost_case: toNum(form.cost_case),
      price_unit: toNum(form.price_unit),
      price_case: toNum(form.price_case),
      sap_price_unit: toNum(form.sap_price_unit),
      sap_price_case: toNum(form.sap_price_case),
    };
    try {
      const updated = await updateItem(itemId!, payload);
      setItem(updated);
      setForm(itemToForm(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response
        ?.data?.error;
      setError(msg || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete item "${item?.name}"?`)) return;
    try {
      await deleteItem(itemId!);
      navigate(
        `/customers/${item?.customer_id}/suppliers/${item?.supplier_id}/items`,
      );
    } catch {
      setError("Failed to delete item");
    }
  };

  if (!item)
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading…</Typography>
      </Box>
    );

  const updatedAt = item.updated_at
    ? new Date(item.updated_at).toLocaleString()
    : new Date(item.created_at).toLocaleString();

  return (
    <Box>
      <Button
        onClick={() =>
          navigate(
            `/customers/${item.customer_id}/suppliers/${item.supplier_id}/items`,
          )
        }
        sx={{ mb: 1, p: 0, textTransform: "none" }}
      >
        ← Items
      </Button>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "70%",
          }}
        >
          {item.name}
        </Typography>
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSave}>
        {/* ── 1. Identity ── */}
        <Section title="Identity">
          <ReadonlyField label="Item ID" value={item.id} />
          <ReadonlyField
            label="Customer"
            value={item.customer_name ?? item.customer_id}
          />
          <ReadonlyField
            label="Supplier"
            value={item.supplier_name ?? String(item.supplier_id)}
          />
          <ReadonlyField label="Last Updated" value={updatedAt} />
        </Section>

        {/* ── 2. Basic Info ── */}
        <Section title="Basic Info">
          <FormTextField
            label="Description"
            value={form.name}
            onChange={set("name")}
            required
          />
          <FormSelectField
            label="Supplier Incoterms"
            value={form.supplier_incoterms}
            onChange={set("supplier_incoterms")}
            options={INCOTERMS_OPTIONS}
          />
          <FormSelectField
            label="Customer Incoterms"
            value={form.customer_incoterms}
            onChange={set("customer_incoterms")}
            options={INCOTERMS_OPTIONS}
          />
        </Section>

        {/* ── 3. Logistics ── */}
        <Section title="">
          <FormTextField
            label="Logistics"
            value={form.logistics}
            onChange={set("logistics")}
          />
          <FormSelectField
            label="Container Type"
            value={form.container_type}
            onChange={set("container_type")}
            options={CONTAINER_OPTIONS}
          />
        </Section>

        {/* ── 4. Incoterm Prices ── */}
        <Section title="">
          <FormTextField
            label="FOB"
            value={form.fob + "$"}
            onChange={set("fob")}
          />
          <FormTextField
            label="CIF"
            value={form.cif + "$"}
            onChange={set("cif")}
          />
          <FormTextField
            label="DAP"
            value={form.dap + "$"}
            onChange={set("dap")}
          />
          <FormTextField
            label="DDP"
            value={form.ddp + "$"}
            onChange={set("ddp")}
          />
        </Section>

        {/* ── 5. Volume / Weight ── */}
        <Section title="">
          <FormTextField
            label="Cases Per Pallet"
            value={form.cases_per_pallets}
            onChange={set("unit_weight")}
          />
          <FormTextField
            label="Pallets Per FCL"
            value={form.unit_weight}
            onChange={set("unit_weight")}
          />
          <FormTextField
            label="Cases in FCL"
            value={form.unit_weight }
            onChange={set("cases_in_fcl")}
          />
          <FormTextField
            label="Units in Case"
            value={form.units_in_case}
            onChange={set("units_in_case")}
          />
          <FormTextField
            label="Unit Weight"
            value={form.unit_weight}
            onChange={set("unit_weight")}
          />
        </Section>

        {/* ── 6. Supplier Pricing ── */}
        <Section title=" ">
          <NumField
            label="Supplier Price — Unit"
            value={form.supplier_price_unit}
            onChange={set("supplier_price_unit")}
          />
          <NumField
            label="Supplier Price — Case"
            value={form.supplier_price_case}
            onChange={setDirect("supplier_price_case")}
            calc
          />
          <NumField
            label="Supplier Price — FCL"
            value={form.supplier_price_fcl}
            onChange={setDirect("supplier_price_fcl")}
            calc
          />
          <NumField
            label="Supplier Price — 1 Kg"
            value={form.supplier_price_1kg}
            onChange={setDirect("supplier_price_1kg")}
            calc
          />
        </Section>

        {/* ── 7. Cost Build-up ── */}
        <Section title="Cost Build-up">
          <NumField
            label="Sub Total 1 (Logistics + Supplier)"
            value={form.sub_total_1}
            onChange={setDirect("sub_total_1")}
            calc
          />
          <NumField
            label="US Tariff"
            value={form.us_tariff}
            onChange={set("us_tariff")}
          />
          <NumField
            label="Sub Total 2 (Sub1 + Tariff)"
            value={form.sub_total_2}
            onChange={setDirect("sub_total_2")}
            calc
          />
          <NumField
            label="Import Factor"
            value={form.import_factor}
            onChange={set("import_factor")}
          />
          <NumField
            label="KFG Commission"
            value={form.kfg_commission}
            onChange={set("kfg_commission")}
          />
          <NumField
            label="Total (Sub2 + KFG)"
            value={form.total}
            onChange={setDirect("total")}
            calc
          />
        </Section>

        {/* ── 8. Final Cost & Price ── */}
        <Section title="Final Cost & Price">
          <NumField
            label="Cost — Unit"
            value={form.cost_unit}
            onChange={set("cost_unit")}
          />
          <NumField
            label="Cost — Case"
            value={form.cost_case}
            onChange={set("cost_case")}
          />
          <NumField
            label="Price — Unit"
            value={form.price_unit}
            onChange={set("price_unit")}
          />
          <NumField
            label="Price — Case"
            value={form.price_case}
            onChange={set("price_case")}
          />
          <NumField
            label="SAP Price — Unit"
            value={form.sap_price_unit}
            onChange={set("sap_price_unit")}
          />
          <NumField
            label="SAP Price — Case"
            value={form.sap_price_case}
            onChange={set("sap_price_case")}
          />
        </Section>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {saved && <Alert severity="success">✓ Saved</Alert>}
          <Button variant="contained" type="submit" size="large">
            Save Changes
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
