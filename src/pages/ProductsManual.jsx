import { useEffect, useState } from "react";
import { callApi } from "../api.js";
import { API } from "../apiRoutes.js";
import RowActions from "../components/RowActions.jsx";
import Toast from "../components/Toast.jsx";
import ProductFormPage from "./ProductFormPage.jsx";
import ProductDetailPage from "./ProductDetailPage.jsx";

const defaultFilters = { search: "", is_active: "", category_id: "", sort: "created_at", order: "desc", page: 1 };

export default function ProductsManual() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: "", is_active: "", category_id: "", sort: "created_at", order: "desc", page: 1, limit: 10,
  });
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false); // true: show the add/edit page instead of the list
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingId, setViewingId] = useState(null); // set: show the detail page
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // READ (list)
  async function load() {
    try {
      setError("");
      const res = await callApi(API.PRODUCT_LIST, { query: filters });
      setRows(res.data);
      setMeta(res.meta);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [filters]);

  // options for the Category dropdowns (filter + form)
  useEffect(() => {
    callApi(API.CATEGORY_LIST, { query: { is_active: "true", limit: 100, sort: "name", order: "asc" } })
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const setFilter = (name, value) => setFilters({ ...filters, [name]: value, page: 1 });
  // Back to the defaults; the chosen rows-per-page stays.
  const resetFilters = () => setFilters({ ...defaultFilters, limit: filters.limit });
  const isFiltered = Object.keys(defaultFilters).some((k) => filters[k] !== defaultFilters[k]);
  // READ (single)
  const view = (id) => setViewingId(id);

  // DELETE (hard delete on the server)
  async function remove(id) {
    if (!window.confirm(`Delete product ${id}?`)) return;
    setMessage("");
    setError("");
    try {
      await callApi(API.PRODUCT_DELETE, { params: { id } });
      setMessage(`Product ${id} deleted.`);
      load();
    } catch (err) { setError(err.message); }
  }

  function openCreate() { setEditingProduct(null); setFormOpen(true); }
  function openEdit(r) { setEditingProduct(r); setFormOpen(true); }

  function onSaved(msg) {
    setFormOpen(false);
    setEditingProduct(null);
    setMessage(msg);
    load();
  }

  if (viewingId) {
    return (
      <ProductDetailPage
        id={viewingId}
        onBack={() => setViewingId(null)}
        onEdit={(product) => { setViewingId(null); openEdit(product); }}
      />
    );
  }

  if (formOpen) {
    return (
      <ProductFormPage
        product={editingProduct}
        categories={categories}
        onSaved={onSaved}
        onCancel={() => { setFormOpen(false); setEditingProduct(null); }}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <button onClick={openCreate}>Add new</button>
      </div>
      <Toast message={message} onClose={() => setMessage("")} />
      {error && <div className="message">Error: {error}</div>}

      <h3>List</h3>
      <div className="filters">
        <input placeholder="Search name or SKU" value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)} />
        <select value={filters.is_active} onChange={(e) => setFilter("is_active", e.target.value)}>
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={filters.category_id} onChange={(e) => setFilter("category_id", e.target.value)}>
          <option value="">Category: all</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
          <option value="created_at">Sort: created</option>
          <option value="name">Sort: name</option>
          <option value="price">Sort: price</option>
        </select>
        <select value={filters.order} onChange={(e) => setFilter("order", e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        <button onClick={resetFilters} disabled={!isFiltered}>Reset filters</button>
        <button onClick={load}>Refresh</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>S.No</th><th>Image</th><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Active</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={9}>No records</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>{(meta.page - 1) * meta.limit + i + 1}</td>
              <td>{r.image_url ? <img src={r.image_url} alt={r.name} width="40" height="40" style={{ objectFit: "cover" }} /> : "-"}</td>
              <td>{r.name}</td>
              <td>{r.sku}</td>
              <td>{r.category?.name ?? r.category_id}</td>
              <td>{r.price}</td>
              <td>{r.stock}</td>
              <td>{r.is_active ? "Yes" : "No"}</td>
              <td>
                <RowActions
                  onView={() => view(r.id)}
                  onEdit={() => openEdit(r)}
                  onDelete={() => remove(r.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pager">
        <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
          Prev
        </button>
        <span>Page {meta.page} of {totalPages} ({meta.total} records)</span>
        <button disabled={filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
          Next
        </button>
        <label>
          Rows per page{" "}
          <select value={filters.limit} onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })}>
            {[5, 10, 30, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

    </div>
  );
}
