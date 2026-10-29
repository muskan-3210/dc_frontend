import { useState } from "react";
import { useAuth } from "../auth.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email: form.email.trim(), password: form.password });
      } else {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-box">
      <h1>{mode === "login" ? "Login" : "Register"}</h1>
      {error && <div className="message">Error: {error}</div>}
      <form onSubmit={onSubmit}>
        {mode === "register" && (
          <>
            <label>Name</label>
            <input name="name" value={form.name} onChange={onChange} />
          </>
        )}
        <label>Email</label>
        <input name="email" value={form.email} onChange={onChange} />
        <label>Password</label>
        <PasswordInput name="password" value={form.password} onChange={onChange} />
        <div className="actions">
          <button type="submit" disabled={busy}>
            {mode === "login" ? "Login" : "Register"}
          </button>
        </div>
      </form>
      <p>
        {mode === "login" ? "No account? " : "Already registered? "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}
