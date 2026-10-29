import { useEffect, useState } from "react";
import { callApi } from "../api.js";
import { API } from "../apiRoutes.js";
import RowActions from "../components/RowActions.jsx";
import Toast from "../components/Toast.jsx";

const defaultFilters = { search: "", is_active: "", parent_id: "", sort: "created_at", order: "desc" };

export default function CategoriesManual() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", is_active:true });
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState(""); // shown inside the dialog
  const [message, setMessage] = useState(""); // success toast
  const [filters, setFilters] = useState({
  search: "", is_active: "", parent_id: "", sort: "created_at", order: "desc",
    });
  const [parents, setParents] = useState([]);
  

  async function load() {
    try {
        setError("");
        const res = await callApi(API.CATEGORY_LIST, { query: { ...filters, limit: 50 } });
        setRows(res.data);
    } catch (e) { setError(e.message); }
    }
    useEffect(() => { load(); }, [filters]);

    // options for the Parent filter
    useEffect(() => {
    callApi(API.CATEGORY_LIST, { query: { limit: 100, sort: "name", order: "asc" } })
        .then((res) => setParents(res.data))
        .catch(() => {});
    }, []);

    const setFilter = (name, value) => setFilters({ ...filters, [name]: value });
    const resetFilters = () => setFilters(defaultFilters);
    const isFiltered = Object.keys(defaultFilters).some((k) => filters[k] !== defaultFilters[k]);

  // READ (list)
  async function load() {
    try {
      const res = await callApi(API.CATEGORY_LIST, { query: { limit: 50 } });
      setRows(res.data);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  // CREATE or UPDATE
  async function save(e) {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await callApi(API.CATEGORY_UPDATE, { params: { id: editingId }, body: form });
        setMessage(`Category ${editingId} updated.`);
      } else {
        const res = await callApi(API.CATEGORY_CREATE, { body: form });
        setMessage(`Category created with id ${res.data.id}.`);
      }
      close();
      load();
    } catch (err) { setFormError(err.message); }
  }

  // READ (single)
  async function view(id) {
    const res = await callApi(API.CATEGORY_GET, { params: { id } });
    alert(JSON.stringify(res.data, null, 2));
  }

  // DELETE (soft delete on the server)
  async function remove(id) {
    if (!window.confirm("Delete?")) return;
    try {
      await callApi(API.CATEGORY_DELETE, { params: { id } });
      setMessage(`Category ${id} deleted.`);
      load();
    } catch (e) { setError(e.message); }
  }

  function openCreate() { setFormError(""); setEditingId(null); setForm({ name: "", description: "", is_active: true }); setOpen(true); }
  function openEdit(r) { setFormError(""); setEditingId(r.id); setForm({ name: r.name, description: r.description ?? "", is_active: r.is_active }); setOpen(true); }
  function close() { setOpen(false); setEditingId(null); setFormError(""); }

  return (
    <div>
      <div className="page-header">
        <h2>Categories</h2>
        <button onClick={openCreate}>Add new</button>
      </div>
      <Toast message={message} onClose={() => setMessage("")} />
      {error && <div className="message">Error: {error}</div>}
      <h3>List</h3>
        <div className="filters">
        <input placeholder="Search" value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)} />

        <select value={filters.is_active} onChange={(e) => setFilter("is_active", e.target.value)}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
        </select>

        <select value={filters.parent_id} onChange={(e) => setFilter("parent_id", e.target.value)}>
            <option value="">Parent: all</option>
            {parents.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>

        <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
            <option value="created_at">Sort: created</option>
            <option value="name">Sort: name</option>
        </select>

        <select value={filters.order} onChange={(e) => setFilter("order", e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
        </select>

        <button onClick={resetFilters} disabled={!isFiltered}>Reset filters</button>
        <button onClick={load}>Refresh</button>
        </div>

      <table>
        <thead><tr><th>S.No</th><th>Name</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td><td>{r.name}</td><td>{r.is_active ? "Yes" : "No"}</td>
              <td>
                <RowActions
                  onView={() => view(r.id)}
                  onEdit={() => openEdit(r)}
                  onDelete={() => remove(r.id)}
                  canDelete={r.is_active}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {open && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit" : "Create"} category</h3>
            {formError && <div className="message" role="alert">Error: {formError}</div>}
            <form onSubmit={save}>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <label>Status</label>
              <div>
                <label>
                    <input type="radio" name="is_active" checked={form.is_active === true}
                    onChange={() => setForm({ ...form, is_active: true })} /> Active
                </label>{" "}
                <label>
                    <input type="radio" name="is_active" checked={form.is_active === false}
                    onChange={() => setForm({ ...form, is_active: false })} /> Inactive
                </label>
              </div>
              <div className="actions">
                <button type="submit">{editingId ? "Update" : "Create"}</button>{" "}
                <button type="button" onClick={close}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}