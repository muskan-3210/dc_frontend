import CrudPage from "../components/CrudPage.jsx";
import { categoryApi } from "../api.js";

const loadParents = async () => {
  const res = await categoryApi.list({ is_active: "true", limit: 100, sort: "name", order: "asc" });
  return res.data.map((c) => ({ value: c.id, label: `${c.id} - ${c.name}` }));
};

const fields = [
  { name: "name", label: "Name" },
  { name: "description", label: "Description" },
  {
    name: "parent_id",
    label: "Parent",
    type: "select",
    numeric: true,
    nullable: true,
    excludeSelf: true,
    emptyLabel: "None (top level)",
    loadOptions: loadParents,
  },
  { name: "is_active", label: "Active", type: "checkbox" },
];

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "parent_id", label: "Parent ID" },
  { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
];

const sortOptions = [
  { value: "created_at", label: "created" },
  { value: "name", label: "name" },
];

export default function Categories() {
  return (
    <CrudPage
      title="Categories"
      api={categoryApi}
      fields={fields}
      columns={columns}
      sortOptions={sortOptions}
      canDelete={(r) => r.is_active}
    />
  );
}
