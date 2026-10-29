import { useState } from "react";
import { useAuth } from "../auth.jsx";
import { onboardingApi } from "../api.js";
import OnboardingForm from "../components/OnboardingForm.jsx";

export default function OnboardingPage() {
  const { user, refresh, logout } = useAuth();
  const [error, setError] = useState("");

  async function submit(payload) {
    setError("");
    try {
      await onboardingApi.create(payload);
      await refresh(); // onboarding_completed is now true, so the app opens
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="auth-box">
      <h1>Complete onboarding</h1>
      <p>Welcome, {user.name}. Fill in these details to continue.</p>
      {error && <div className="message">Error: {error}</div>}
      <OnboardingForm
        initial={{ full_name: user.name, email: user.email }}
        submitLabel="Complete onboarding"
        onSubmit={submit}
      />
      <button onClick={logout}>Logout</button>
    </div>
  );
}
