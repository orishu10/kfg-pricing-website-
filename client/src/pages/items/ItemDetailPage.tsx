import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { toNum, toInt, fmt, calcDerived } from "./utils/helpers";
import type { FormState } from "./utils/types";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from "@mui/material";
import { Box, Grid } from "@mui/system";

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
    cases_per_pallet:
      item.cases_per_pallet != null ? String(item.cases_per_pallet) : "",
    pallets_per_fcl:
      item.pallets_per_fcl != null ? String(item.pallets_per_fcl) : "",
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
    kfg_commission_total: fmt(item.kfg_commission_total),
    tariffs_total: fmt(item.tariffs_total),
    usd_nis: fmt(item.usd_nis),
    cost_unit: fmt(item.cost_unit),
    cost_case: fmt(item.cost_case),
    price_unit: fmt(item.price_unit),
    price_case: fmt(item.price_case),
    sap_price_unit: fmt(item.sap_price_unit),
    sap_price_case: fmt(item.sap_price_case),
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
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {title && (
          <Typography
            variant="overline"
            color="primary"
            fontWeight={700}
            display="block"
            mb={3}
          >
            {title}
          </Typography>
        )}
        <Grid container spacing={3}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          py: 1,
          mt: 0.5,
        }}
      >
        <Typography variant="body2" fontFamily="monospace">
          {value || "—"}
        </Typography>
      </Box>
    </Grid>
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
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <TextField
        label={label}
        fullWidth
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Grid>
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
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <TextField
        label={label}
        fullWidth
        type="number"
        slotProps={{
          htmlInput: { step: "0.0001" },
          ...(calc
            ? {
                input: {
                  endAdornment: (
                    <Chip
                      label="auto"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        bgcolor: "rgba(111,66,193,0.25)",
                        color: "#b39ddb",
                        ml: 0.5,
                      }}
                    />
                  ),
                },
              }
            : {}),
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
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
    </Grid>
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
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <TextField
        label={label}
        fullWidth
        type="number"
        slotProps={{ htmlInput: { step: "1", min: "0" } }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
      />
    </Grid>
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
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <FormControl fullWidth>
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
    </Grid>
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
        const f = itemToForm(data);
        setForm({ ...f, ...calcDerived(f) });
      })
      .catch(() => navigate("/"));
    // navigate is a stable reference — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      return { ...next, ...calcDerived(next) };
    });
  };

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
      cases_per_pallet: toInt(form.cases_per_pallet),
      pallets_per_fcl: toInt(form.pallets_per_fcl),
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
      kfg_commission_total: toNum(form.kfg_commission_total),
      tariffs_total: toNum(form.tariffs_total),
      usd_nis: toNum(form.usd_nis),
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
        <Section title="Logistics">
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
        <Section title="Incoterm Prices">
          <FormTextField label="FOB" value={form.fob} onChange={set("fob")} />
          <FormTextField label="CIF" value={form.cif} onChange={set("cif")} />
          <FormTextField label="DAP" value={form.dap} onChange={set("dap")} />
          <FormTextField label="DDP" value={form.ddp} onChange={set("ddp")} />
        </Section>

        {/* ── 5. Volume & Weight ── */}
        <Section title="Volume & Weight">
          <IntField        label="Units in Case"    value={form.units_in_case}    onChange={set("units_in_case")} />
          <NumField        label="Unit Weight"      value={form.unit_weight}      onChange={set("unit_weight")} />
          <IntField        label="Cases per Pallet" value={form.cases_per_pallet} onChange={set("cases_per_pallet")} />
          <IntField        label="Pallets per FCL"  value={form.pallets_per_fcl}  onChange={set("pallets_per_fcl")} />
          <ReadonlyField   label="Cases in FCL"     value={form.cases_in_fcl} />
        </Section>

        {/* ── 6. Supplier Pricing ── */}
        <Section title="Supplier Pricing">
          <NumField      label="Supplier Price — Unit" value={form.supplier_price_unit} onChange={set("supplier_price_unit")} />
          <ReadonlyField label="Supplier Price — Case" value={form.supplier_price_case} />
          <ReadonlyField label="Supplier Price — FCL"  value={form.supplier_price_fcl} />
          <ReadonlyField label="Supplier Price — 1 Kg" value={form.supplier_price_1kg} />
        </Section>

        {/* ── 7. Cost Build-up ── */}
        <Section title="Cost Build-up">
          <ReadonlyField label="Sub Total 1 (FOB+CIF+DAP+DDP+Supplier FCL)" value={form.sub_total_1} />
          <NumField      label="US Tariff"                                   value={form.us_tariff}   onChange={set("us_tariff")} />
          <ReadonlyField label="Sub Total 2 (Sub1 + US Tariff)"             value={form.sub_total_2} />
          <NumField label="Import Factor"                      value={form.import_factor}         onChange={set("import_factor")} />
          <NumField label="KFG Commission"                     value={form.kfg_commission}        onChange={set("kfg_commission")} />
          <NumField label="Total (Sub2 + KFG)"                 value={form.total}                 onChange={setDirect("total")}         calc />
          <NumField label="KFG Commission Total"               value={form.kfg_commission_total}  onChange={set("kfg_commission_total")} />
          <NumField label="Tariffs Total"                      value={form.tariffs_total}         onChange={set("tariffs_total")} />
          <NumField label="USD / NIS"                          value={form.usd_nis}               onChange={set("usd_nis")} />
        </Section>

        {/* ── 8. Final Cost & Price ── */}
        <Section title="Final Cost & Price">
          <FormTextField
            label="Cost — Unit"
            value={form.cost_unit}
            onChange={set("cost_unit")}
          />
          <FormTextField
            label="Cost — Case"
            value={form.cost_case}
            onChange={set("cost_case")}
          />
          <FormTextField
            label="Price — Unit"
            value={form.price_unit}
            onChange={set("price_unit")}
          />
          <FormTextField
            label="Price — Case"
            value={form.price_case}
            onChange={set("price_case")}
          />
          <FormTextField
            label="SAP Price — Unit"
            value={form.sap_price_unit}
            onChange={set("sap_price_unit")}
          />
          <FormTextField
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
