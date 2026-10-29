import { useEffect, useState } from "react";

const initialForm = (fields) =>
  Object.fromEntries(fields.map((f) => [f.name, f.type === "checkbox" ? true : ""]));

function buildPayload(fields, form) {
  const payload = {};
  fields.forEach((f) => {
    if (f.type === "checkbox") {
      payload[f.name] = Boolean(form[f.name]);
      return;
    }
    const value = typeof form[f.name] === "string" ? form[f.name].trim() : form[f.name];
    if (value === "" || value === null || value === undefined) {
      if (f.nullable) payload[f.name] = null;
    } else if (f.type === "number" || f.numeric) {
      payload[f.name] = Number(value);
    } else {
      payload[f.name] = value;
    }
  });
  return payload;
}

/**
 * Generic table page: create/edit form, search, filters, sort, pagination, view, delete.
 *
 * Props:
 *  title, api ({ list, get, create, update, remove }),
 *  fields  [{ name, label, type: text|number|select|checkbox, step, numeric, nullable, emptyLabel, excludeSelf, loadOptions }]
 *  columns [{ key, label, render(row) }]
 *  sortOptions [{ value, label }], extraFilters [{ name, label, loadOptions }]
 *  canDelete(row)
 */
export default function CrudPage({ title, api, fields, columns, sortOptions = [], extraFilters = [], canDelete = () => true }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    is_active: "",
    sort: sortOptions[0]?.value ?? "",
    order: "desc",
    page: 1,
    limit: 10,
    ...Object.fromEntries(extraFilters.map((f) => [f.name, ""])),
  });
  const [form, setForm] = useState(() => initialForm(fields));
  const [editingId, setEditingId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [options, setOptions] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const res = await api.list(filters);
      setRows(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    }
  }

  // Dropdown choices that come from another API (e.g. the category list for a product).
  async function loadAllOptions() {
    const withLoaders = [...fields, ...extraFilters].filter((f) => f.loadOptions);
    const entries = await Promise.all(
      withLoaders.map(async (f) => {
        try {
          return [f.name, await f.loadOptions()];
        } catch {
          return [f.name, []];
        }
      })
    );
    setOptions(Object.fromEntries(entries));
  }

  useEffect(() => {
    load();
  }, [filters]);

  useEffect(() => {
    loadAllOptions();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const setFilter = (name, value) => setFilters({ ...filters, [name]: value, page: 1 });

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm(fields));
    setShowForm(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(initialForm(fields));
    setShowForm(true);
  }

  function startEdit(row) {
    setShowForm(true);
    setEditingId(row.id);
    setForm(
      Object.fromEntries(fields.map((f) => [f.name, f.type === "checkbox" ? Boolean(row[f.name]) : row[f.name] ?? ""]))
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = buildPayload(fields, form);
      if (editingId) {
        await api.update(editingId, payload);
        setMessage(`${title}: record ${editingId} updated.`);
      } else {
        const res = await api.create(payload);
        setMessage(`${title}: record created with id ${res.data.id}.`);
      }
      cancelEdit();
      load();
      loadAllOptions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm(`Delete record ${id}?`)) return;
    setMessage("");
    setError("");
    try {
      await api.remove(id);
      setMessage(`${title}: record ${id} deleted.`);
      load();
      loadAllOptions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function view(id) {
    try {
      setError("");
      const res = await api.get(id);
      setDetail(res.data);
    } catch (err) {
      setError(err.message);
    }
  }

  function renderField(f) {
    if (f.type === "checkbox") {
      return <input type="checkbox" name={f.name} checked={Boolean(form[f.name])} onChange={onChange} />;
    }
    if (f.type === "select") {
      const list = (options[f.name] || []).filter((o) => !(f.excludeSelf && o.value === editingId));
      return (
        <select name={f.name} value={form[f.name]} onChange={onChange}>
          <option value="">{f.emptyLabel || "Select..."}</option>
          {list.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={f.type === "number" ? "number" : "text"}
        step={f.step}
        name={f.name}
        value={form[f.name]}
        onChange={onChange}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div>
      <div className="page-header">
        <h2>{title}</h2>
        <button onClick={startCreate}>Add new</button>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="message">Error: {error}</div>}

      {showForm && (
        <div className="modal-backdrop" onClick={cancelEdit}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? `Edit record ${editingId}` : "Create record"}</h3>
            <form onSubmit={onSubmit}>
              {fields.map((f) => (
                <div key={f.name} className="row">
                  <label>{f.label}</label>
                  {renderField(f)}
                </div>
              ))}
              <div className="actions">
                <button type="submit">{editingId ? "Update" : "Create"}</button>{" "}
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h3>List</h3>
      <div className="filters">
        <input placeholder="Search" value={filters.search} onChange={(e) => setFilter("search", e.target.value)} />
        <select value={filters.is_active} onChange={(e) => setFilter("is_active", e.target.value)}>
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {extraFilters.map((f) => (
          <select key={f.name} value={filters[f.name]} onChange={(e) => setFilter(f.name, e.target.value)}>
            <option value="">{f.label}: all</option>
            {(options[f.name] || []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        {sortOptions.length > 0 && (
          <>
            <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
            <select value={filters.order} onChange={(e) => setFilter("order", e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </>
        )}
        <button onClick={load}>Refresh</button>
      </div>

      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1}>No records</td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(r) : String(r[c.key] ?? "-")}</td>
              ))}
              <td>
                <button onClick={() => view(r.id)}>View</button> <button onClick={() => startEdit(r)}>Edit</button>{" "}
                <button onClick={() => remove(r.id)} disabled={!canDelete(r)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pager">
        <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
          Prev
        </button>
        <span>
          Page {meta.page} of {totalPages} ({meta.total} records)
        </span>
        <button disabled={filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
          Next
        </button>
      </div>

      {detail && (
        <div>
          <h3>Record {detail.id} (GET by id)</h3>
          <pre>{JSON.stringify(detail, null, 2)}</pre>
          <button onClick={() => setDetail(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
