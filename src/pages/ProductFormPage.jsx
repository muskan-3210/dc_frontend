import { useRef, useState } from "react";
import { callApi } from "../api.js";
import { API } from "../apiRoutes.js";

const MAX_SIZE = 2 * 1024 * 1024; // keep in sync with the server limit
const TYPES = ["image/jpeg", "image/png", "image/webp"];

const emptyForm = { name: "", sku: "", description: "", price: "", stock: "0", category_id: "", is_active: true, image_url: "" };

const toForm = (p) =>
  p
    ? {
        name: p.name,
        sku: p.sku,
        description: p.description ?? "",
        price: String(p.price),
        stock: String(p.stock),
        category_id: String(p.category_id),
        is_active: p.is_active,
        image_url: p.image_url ?? "",
      }
    : emptyForm;

/**
 * Full-page create/edit form for a product.
 * product: the row being edited, or null to create. onSaved(message) / onCancel() return to the list.
 */
export default function ProductFormPage({ product, categories, onSaved, onCancel }) {
  const editingId = product?.id ?? null;
  const [form, setForm] = useState(() => toForm(product));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function uploadFile(file) {
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setError("Only JPG, PNG or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be 2 MB or smaller");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", file); // must match upload.single("image") on the server
      const res = await callApi(API.UPLOAD_PRODUCT_IMAGE, { body: data });
      setForm((f) => ({ ...f, image_url: res.data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    uploadFile(e.dataTransfer.files[0]);
  }

  function onFileChosen(e) {
    uploadFile(e.target.files[0]);
    e.target.value = ""; // allow choosing the same file again
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    if (!form.category_id) {
      setError("Please select a category");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock || 0),
        category_id: Number(form.category_id),
        is_active: form.is_active,
        image_url: form.image_url || null,
      };
      if (editingId) {
        await callApi(API.PRODUCT_UPDATE, { params: { id: editingId }, body });
        onSaved(`Product ${editingId} updated.`);
      } else {
        const res = await callApi(API.PRODUCT_CREATE, { body });
        onSaved(`Product created with id ${res.data.id}.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>{editingId ? `Edit product ${editingId}` : "Add product"}</h2>
        <button type="button" onClick={onCancel}>
          Back to list
        </button>
      </div>

      {error && (
        <div className="message" role="alert">
          Error: {error}
        </div>
      )}

      <form className="product-form" onSubmit={save}>
        <section className="form-card">
          <h3>Product image</h3>
          <div
            className={`dropzone${dragging ? " dragging" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => fileInput.current.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            {form.image_url ? (
              <img src={form.image_url} alt="Product preview" />
            ) : (
              <div className="dropzone-hint">
                <strong>{uploading ? "Uploading..." : "Drag and drop an image here"}</strong>
                <span>or click to browse</span>
                <small>JPG, PNG or WEBP, up to 2 MB</small>
              </div>
            )}
            {uploading && form.image_url && <div className="dropzone-busy">Uploading...</div>}
          </div>
          <input ref={fileInput} type="file" accept={TYPES.join(",")} hidden onChange={onFileChosen} />
          {form.image_url && (
            <div className="dropzone-actions">
              <button type="button" onClick={() => fileInput.current.click()}>
                Replace
              </button>
              <button type="button" onClick={() => setForm({ ...form, image_url: "" })}>
                Remove
              </button>
            </div>
          )}
        </section>

        <section className="form-card">
          <h3>Details</h3>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="pf-name">Name</label>
              <input id="pf-name" name="name" value={form.name} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="pf-sku">SKU</label>
              <input id="pf-sku" name="sku" value={form.sku} onChange={onChange} />
            </div>
            <div className="field span-2">
              <label htmlFor="pf-description">Description</label>
              <textarea id="pf-description" name="description" rows="3" value={form.description} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="pf-price">Price</label>
              <input id="pf-price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="pf-stock">Stock</label>
              <input id="pf-stock" name="stock" type="number" min="0" value={form.stock} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="pf-category">Category</label>
              <select id="pf-category" name="category_id" value={form.category_id} onChange={onChange}>
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <div className="radio-row">
                <label>
                  <input
                    type="radio"
                    name="is_active"
                    checked={form.is_active === true}
                    onChange={() => setForm({ ...form, is_active: true })}
                  />{" "}
                  Active
                </label>
                <label>
                  <input
                    type="radio"
                    name="is_active"
                    checked={form.is_active === false}
                    onChange={() => setForm({ ...form, is_active: false })}
                  />{" "}
                  Inactive
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" disabled={saving || uploading}>
            {saving ? "Saving..." : editingId ? "Update product" : "Create product"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
