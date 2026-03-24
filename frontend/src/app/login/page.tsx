"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { apiPost } from "@/lib/api";
import { setToken } from "@/lib/auth";

type AuthResponse = {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  token: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"Login" | "Register">("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);

    try {
      const url = mode === "Login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "Login"
          ? { email, password }
          : { email, password, name: name || undefined };

      const res = await apiPost<AuthResponse>(url, payload);
      setToken(res.token);
      router.push("/traces");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.title}>
          {mode === "Login" ? "Welcome Back" : "Create Account"}
        </div>
        <div className={styles.subtitle}>
          {mode === "Login" ? "Login to continue" : "Register to get started"}
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${
              mode === "Login" ? styles.tabActive : ""
            }`}
            onClick={() => setMode("Login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === "Register" ? styles.tabActive : ""}`}
            onClick={() => setMode("Register")}
          >
            Register
          </button>
        </div>

        {mode === "Register" ? (
          <div className={styles.field}>
            <label className={styles.label}>Name(Optional)</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="James"
            />
          </div>
        ) : null}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="test1234"
          />
        </div>

        {error ? <div className={styles.error}>{error}</div> : null}

        <button
          type="button"
          className={styles.primary}
          onClick={submit}
          disabled={loading || !email || !password}
        >
          {loading
            ? "Working..."
            : mode === "Login"
              ? "Sign In"
              : "Create Account"}
        </button>

        <div className={styles.hint}>
          Backend health:{" "}
          <a href="http://localhost:4000/health" target="_blank">
            /health
          </a>
        </div>
      </div>
    </main>
  );
}
