import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { FormSelectField } from "./formSelectField/FormSelectField";
import { FormTextField } from "./formTextField/FormTextField";
import { IntField } from "./intField/IntField";
import { NumField } from "./numField/NumField";
import { ReadonlyField } from "./readonlyField/ReadonlyField";
import { useItemDetailPage } from "../hooks/useItemDetailPage";
import { INCOTERMS_OPTIONS, CONTAINER_OPTIONS } from "../utils/consts";
import { IdentityField } from "./identityField/IdentityField";
import { Section } from "./section/Section";

export const ItemDetailPage = () => {
  const navigate = useNavigate();
  const { item, form, saved, error, set, handleSave, handleDelete } =
    useItemDetailPage();

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
        <Section title="Identity">
          <IdentityField label="Item ID" value={item.id} />
          <IdentityField
            label="Customer"
            value={item.customer_name ?? item.customer_id}
          />
          <IdentityField
            label="Supplier"
            value={item.supplier_name ?? String(item.supplier_id)}
          />
          <IdentityField label="Last Updated" value={updatedAt} />
        </Section>

        <Section>
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

        <Section>
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

        <Section>
          <FormTextField
            label="FOB"
            value={form.fob}
            onChange={set("fob")}
            currency
          />
          <FormTextField
            label="CIF"
            value={form.cif}
            onChange={set("cif")}
            currency
          />
          <FormTextField
            label="DAP"
            value={form.dap}
            onChange={set("dap")}
            currency
          />
          <FormTextField
            label="DDP"
            value={form.ddp}
            onChange={set("ddp")}
            currency
          />
        </Section>

        <Section>
          <IntField
            label="Units in Case"
            value={form.units_in_case}
            onChange={set("units_in_case")}
            col
          />
          <FormTextField
            label="Unit Weight"
            value={form.unit_weight}
            onChange={set("unit_weight")}
            col
          />
          <IntField
            label="Cases per Pallet"
            value={form.cases_per_pallet}
            onChange={set("cases_per_pallet")}
            col
          />
          <IntField
            label="Pallets per FCL"
            value={form.pallets_per_fcl}
            onChange={set("pallets_per_fcl")}
            col
          />
          <ReadonlyField label="Cases in FCL" value={form.cases_in_fcl} col />
        </Section>

        <Section>
          <FormTextField
            label="Supplier Price — Unit"
            value={form.supplier_price_unit}
            onChange={set("supplier_price_unit")}
            col
          />
          <ReadonlyField
            label="Supplier Price — Case"
            value={form.supplier_price_case}
            col
          />
          <ReadonlyField
            label="Supplier Price — FCL"
            value={form.supplier_price_fcl}
            col
          />
          <ReadonlyField
            label="Supplier Price — 1 Kg"
            value={form.supplier_price_1kg}
            col
          />
        </Section>

        <Section>
          <ReadonlyField
            label="Sub Total 1 (FOB+CIF+DAP+DDP+Supplier FCL)"
            value={form.sub_total_1}
            col
          />
          <NumField
            label="US Tariff"
            value={form.us_tariff}
            onChange={set("us_tariff")}
            col
          />
          <ReadonlyField
            label="Sub Total 2 (Sub1 + US Tariff)"
            value={form.sub_total_2}
            col
          />
          <ReadonlyField label="Import Factor" value={form.import_factor} col />
          <NumField
            label="KFG Commission"
            value={form.kfg_commission}
            onChange={set("kfg_commission")}
            col
          />
          <ReadonlyField
            label="KFG Commission Total"
            value={form.kfg_commission_total}
            col
          />
          <ReadonlyField label="Tariffs Total" value={form.tariffs_total} col />
          <ReadonlyField label="Total (Sub2 + KFG)" value={form.total} col />
          <NumField
            label="USD / NIS"
            value={form.usd_nis}
            onChange={set("usd_nis")}
            col
          />
        </Section>

        <Section>
          <ReadonlyField label="Cost — Case" value={form.cost_case} col />
          <ReadonlyField label="Cost — Unit" value={form.cost_unit} col />
          <ReadonlyField label="Price — Case" value={form.price_case} col />
          <ReadonlyField label="Price — Unit" value={form.price_unit} col />
          <ReadonlyField
            label="SAP Price — Unit"
            value={form.sap_price_unit}
            col
          />
          <NumField
            label="SAP Price — Case"
            value={form.sap_price_case}
            onChange={set("sap_price_case")}
            col
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
};

export default ItemDetailPage;
