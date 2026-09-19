"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("citizen@demo.ng");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError("Could not sign in");
      return;
    }
    const data = await res.json();
    router.push(data.redirect || "/action");
    router.refresh();
  }

  return (
    <div className="site-container py-16">
      <div className="mx-auto max-w-md border border-paper-border bg-paper-card p-6">
        <h1 className="font-display text-3xl text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Authentication is for participation — browsing the public record does not require an
          account.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs uppercase tracking-wider text-ink-faint">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-paper-border px-3 py-2 outline-none focus:border-civic-green"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs uppercase tracking-wider text-ink-faint">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-paper-border px-3 py-2 outline-none focus:border-civic-green"
            />
          </div>
          {error ? <p className="text-sm text-civic-red">{error}</p> : null}
          <button type="submit" className="w-full bg-civic-green py-2.5 text-sm font-medium text-white">
            Continue
          </button>
        </form>
        <ul className="mt-6 space-y-1 text-xs text-ink-faint">
          <li>citizen@demo.ng — submit reports</li>
          <li>verify@demo.ng — verifier desk</li>
          <li>gov@demo.ng — official responses</li>
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-civic-green">
            ← Continue browsing without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}
