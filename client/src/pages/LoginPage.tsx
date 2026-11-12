import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getApiErrorMessage } from "../services/apiError";

export default function LoginPage() {
  const { login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [portal, setPortal] = useState<"patient" | "doctor">(
    searchParams.get("portal") === "doctor" ? "doctor" : "patient",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const authenticatedUser = await login({ email, password });
      const actualPortal = authenticatedUser.role ?? "patient";
      if (actualPortal === "doctor_pending") {
        logout();
        setError("Your doctor application is awaiting approval and patient assignment.");
        return;
      }
      if (actualPortal !== portal) {
        logout();
        setError(
          portal === "doctor"
            ? "This account does not have doctor access."
            : "This is a doctor account. Choose Doctor to sign in.",
        );
        return;
      }

      navigate(portal === "doctor" ? "/doctor" : "/dashboard");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Login failed. Please try again."));
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
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#f4f6ed]">{portal === "doctor" ? "Doctor login" : "Patient login"}</h2>
          <p className="mt-2 text-sm text-[#91a197]">
            {portal === "doctor"
              ? "Use your assigned doctor account credentials."
              : "Use the email and password for your patient account."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <fieldset>
              <legend className="mb-2 block text-xs font-medium text-[#bac8bc]">Choose account type</legend>
              <div className="relative grid grid-cols-2 rounded-md border border-white/10 bg-[#101a17] p-1">
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded bg-[#c4f06a] transition-transform duration-200 ${portal === "doctor" ? "translate-x-full" : "translate-x-0"}`}
                />
                {(["patient", "doctor"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={portal === option}
                    onClick={() => {
                      setPortal(option);
                      setError("");
                    }}
                    className={`relative z-10 rounded px-2 py-2.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${portal === option ? "text-[#16221a]" : "text-[#aab8ad] hover:text-white"}`}
                  >
                    {option === "patient" ? "Patient login" : "Doctor login"}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="login-email" className="mb-2 block text-xs font-medium text-[#bac8bc]">Email address</label>
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
              <span>{loading ? "Signing in..." : portal === "doctor" ? "Log in as doctor" : "Log in as patient"}</span>
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