import CrudPage from "../components/CrudPage.jsx";
import { categoryApi, productApi } from "../api.js";

const loadCategories = async () => {
  const res = await categoryApi.list({ is_active: "true", limit: 100, sort: "name", order: "asc" });
  return res.data.map((c) => ({ value: c.id, label: `${c.id} - ${c.name}` }));
};

const fields = [
  { name: "name", label: "Name" },
  { name: "sku", label: "SKU" },
  { name: "description", label: "Description" },
  { name: "price", label: "Price", type: "number", step: "0.01" },
  { name: "stock", label: "Stock", type: "number" },
  { name: "category_id", label: "Category", type: "select", numeric: true, loadOptions: loadCategories },
  { name: "is_active", label: "Active", type: "checkbox" },
];

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category", render: (r) => r.category?.name ?? r.category_id },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stock" },
  { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
];

const sortOptions = [
  { value: "created_at", label: "created" },
  { value: "name", label: "name" },
  { value: "price", label: "price" },
];

const extraFilters = [{ name: "category_id", label: "Category", loadOptions: loadCategories }];

export default function Products() {
  return (
    <CrudPage
      title="Products"
      api={productApi}
      fields={fields}
      columns={columns}
      sortOptions={sortOptions}
      extraFilters={extraFilters}
    />
  );
}
