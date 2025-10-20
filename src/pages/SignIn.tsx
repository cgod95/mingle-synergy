import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const { signInDemo, isDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemo = () => {
    if (signInDemo) {
      signInDemo();
      navigate("/venues", { replace: true });
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Sign in</h1>
      {isDemo ? (
        <>
          <p>This is demo mode. Click below to simulate sign-in.</p>
          <button onClick={handleDemo}>Demo Sign in</button>
        </>
      ) : (
        <p>Real sign-in form will go here.</p>
      )}
    </main>
  );
}
