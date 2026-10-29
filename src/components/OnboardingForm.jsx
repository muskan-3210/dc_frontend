import { useState } from "react";

const EMPTY = { full_name: "", email: "", phone: "", company_name: "", role: "", address: "" };

// Shared by the first-time onboarding page and the Profile page.
export default function OnboardingForm({ initial = {}, submitLabel, onSubmit }) {
  const [form, setForm] = useState({ ...EMPTY, ...Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, v ?? ""])) });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      const value = String(v).trim();
      if (value !== "") payload[k] = value;
    });
    onSubmit(payload);
  }

  return (
    <form onSubmit={submit}>
      <label>Full name</label>
      <input name="full_name" value={form.full_name} onChange={onChange} />
      <label>Email</label>
      <input name="email" value={form.email} onChange={onChange} />
      <label>Phone</label>
      <input name="phone" value={form.phone} onChange={onChange} placeholder="+919876543210" />
      <label>Company</label>
      <input name="company_name" value={form.company_name} onChange={onChange} />
      <label>Role</label>
      <input name="role" value={form.role} onChange={onChange} />
      <label>Address</label>
      <input name="address" value={form.address} onChange={onChange} />
      <div className="actions">
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
