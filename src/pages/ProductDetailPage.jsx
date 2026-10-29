import { useEffect, useState } from "react";
import { callApi } from "../api.js";
import { API } from "../apiRoutes.js";

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");
const formatPrice = (value) =>
  Number(value).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

function availability(product) {
  if (!product.is_active) return { text: "Currently unavailable", tone: "off" };
  if (product.stock <= 0) return { text: "Out of stock", tone: "off" };
  if (product.stock <= 10) return { text: `Only ${product.stock} left in stock`, tone: "low" };
  return { text: "In stock", tone: "ok" };
}

/**
 * Read-only product page in a three-part layout:
 * image gallery | title, price, details, about | side box with availability and actions.
 * Loads the product with GET /products/:id. onBack() returns to the list, onEdit(product) opens the edit page.
 */
export default function ProductDetailPage({ id, onBack, onEdit }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setError("");
    callApi(API.PRODUCT_GET, { params: { id } })
      .then((res) => !cancelled && setProduct(res.data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const stock = product ? availability(product) : null;
  const aboutLines = product?.description ? product.description.split(/\r?\n/).filter(Boolean) : [];

  return (
    <div>
      <button type="button" className="pd-back" onClick={onBack}>
        &lsaquo; Back to products
      </button>

      {error && (
        <div className="message" role="alert">
          Error: {error}
        </div>
      )}
      {!product && !error && <p>Loading...</p>}

      {product && (
        <div className="pd-layout">
          {/* 1. Gallery: thumbnail rail + main image */}
          <div className="pd-gallery">
            <div className="pd-thumbs">
              <div className="pd-thumb active">
                {product.image_url ? <img src={product.image_url} alt="" /> : <span>-</span>}
              </div>
            </div>
            <div className="pd-main-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <span>No image</span>
              )}
            </div>
          </div>

          {/* 2. Title, price, details, about */}
          <div className="pd-info">
            <h1 className="pd-title">{product.name}</h1>
            <div className="pd-sub">
              Category: <strong>{product.category?.name ?? product.category_id}</strong> &nbsp;|&nbsp; SKU:{" "}
              <strong>{product.sku}</strong>
            </div>

            <hr />

            <div className="pd-price">{formatPrice(product.price)}</div>
            <div className="pd-note">Inclusive of all taxes</div>

            <hr />

            <table className="pd-specs">
              <tbody>
                <tr>
                  <th>Category</th>
                  <td>{product.category?.name ?? product.category_id}</td>
                </tr>
                <tr>
                  <th>SKU</th>
                  <td>{product.sku}</td>
                </tr>
                <tr>
                  <th>Stock</th>
                  <td>{product.stock}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>{product.is_active ? "Active" : "Inactive"}</td>
                </tr>
              </tbody>
            </table>

            <hr />

            <h3>About this item</h3>
            {aboutLines.length > 0 ? (
              <ul className="pd-about">
                {aboutLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="pd-note">No description.</p>
            )}
          </div>

          {/* 3. Side box */}
          <aside className="pd-box">
            <div className="pd-box-price">{formatPrice(product.price)}</div>
            <div className={`pd-stock ${stock.tone}`}>{stock.text}</div>

            <button type="button" className="pd-box-button" onClick={() => onEdit(product)}>
              Edit product
            </button>
            <button type="button" className="pd-box-button" onClick={onBack}>
              Back to list
            </button>

            <dl className="pd-meta">
              <dt>Product ID</dt>
              <dd>{product.id}</dd>
              <dt>Created</dt>
              <dd>{formatDate(product.created_at)}</dd>
              <dt>Last updated</dt>
              <dd>{formatDate(product.updated_at)}</dd>
            </dl>
          </aside>
        </div>
      )}
    </div>
  );
}
