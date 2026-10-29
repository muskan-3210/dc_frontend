import { useEffect, useState } from "react";
import { onboardingApi } from "../api.js";
import OnboardingForm from "../components/OnboardingForm.jsx";

export default function Profile() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    onboardingApi
      .me()
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message));
  }, []);

  async function save(payload) {
    setMessage("");
    setError("");
    try {
      const res = await onboardingApi.update(payload);
      setData(res.data);
      setMessage("Profile updated.");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Profile</h2>
      {message && <div className="message">{message}</div>}
      {error && <div className="message">Error: {error}</div>}
      {data && <OnboardingForm initial={data} submitLabel="Update profile" onSubmit={save} />}
    </div>
  );
}
