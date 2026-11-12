import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <main className="journal-grid min-h-screen text-[#edf3e9]">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 md:grid-cols-[1fr_0.9fr] md:gap-16">
        <section className="mx-auto w-full max-w-lg">
          <Link to="/login" className="mb-12 inline-flex items-center gap-3 no-underline">
            <span className="grid size-10 place-items-center rounded-lg bg-[#c4f06a] font-display text-xl font-bold text-[#16221a]">S</span>
            <span className="font-display text-xl font-bold text-[#f4f6ed]">Sweety</span>
          </Link>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#c4f06a]">Welcome back</p>
          <h1 className="mt-5 max-w-md font-display text-4xl font-semibold leading-tight text-[#f4f6ed] sm:text-5xl">Your readings, gathered in one place.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[#aab8ad]">Sign in to pick up where your daily journal left off.</p>
          <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197]">
            <span className="size-2 rounded-full bg-[#f28d75]" />
            Personal tracking, on your terms
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-lg border border-white/10 bg-[#182520] p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f28d75]">Your journal</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#f4f6ed]">Log in</h2>
          <p className="mt-2 text-sm text-[#91a197]">Enter your account details to continue.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-xs font-medium text-[#bac8bc]">Email</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-white/10 bg-[#101a17] px-3.5 py-3 text-sm text-[#f4f6ed] outline-none placeholder:text-[#66756b] focus:border-[#c4f06a] focus:ring-2 focus:ring-[#c4f06a]/15"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-xs font-medium text-[#bac8bc]">Password</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-md border border-white/10 bg-[#101a17] px-3.5 py-3 text-sm text-[#f4f6ed] outline-none placeholder:text-[#66756b] focus:border-[#c4f06a] focus:ring-2 focus:ring-[#c4f06a]/15"
              />
            </div>

            {error && <p role="alert" className="rounded-md border border-[#f28d75]/25 bg-[#f28d75]/10 px-3 py-2.5 text-sm text-[#ffad9b]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-between rounded-md bg-[#c4f06a] px-4 py-3.5 text-sm font-bold text-[#16221a] transition hover:bg-[#d3fa82] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{loading ? "Signing in..." : "Log in"}</span>
              <span aria-hidden="true" className="font-mono text-lg">→</span>
            </button>
          </form>

          <p className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-[#aab8ad]">
            New to Sweety?{" "}
            <Link to="/signup" className="font-semibold text-[#c4f06a] hover:text-[#d3fa82]">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
}