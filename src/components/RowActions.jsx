// View / Edit / Delete as plain black outline icons (no icon library needed).
const svgProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const ViewIcon = () => (
  <svg {...svgProps}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg {...svgProps}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg {...svgProps}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export default function RowActions({ onView, onEdit, onDelete, canDelete = true }) {
  return (
    <div className="icon-actions">
      <button className="icon-btn" title="View" aria-label="View" onClick={onView}>
        <ViewIcon />
      </button>
      <button className="icon-btn" title="Edit" aria-label="Edit" onClick={onEdit}>
        <EditIcon />
      </button>
      <button className="icon-btn" title="Delete" aria-label="Delete" onClick={onDelete} disabled={!canDelete}>
        <DeleteIcon />
      </button>
    </div>
  );
}
