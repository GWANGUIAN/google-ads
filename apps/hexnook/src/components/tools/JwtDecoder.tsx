import { useEffect, useState } from "react";
import { decodeJwt, formatClaimDate, isHmacAlg, verifyHmacSignature, type DecodedJwt } from "@/lib/jwt/jwt";
import { highlightJson } from "@/lib/json/highlight";
import CopyButton from "./shared/CopyButton";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";

type VerifyState = "idle" | "checking" | "valid" | "invalid" | "unsupported" | "error";

export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE);
  const [decoded, setDecoded] = useState<{ ok: true; value: DecodedJwt } | { ok: false; error: string } | null>(null);
  const [secret, setSecret] = useState("");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");

  useEffect(() => {
    if (token.trim() === "") {
      setDecoded(null);
      return;
    }
    const id = setTimeout(() => setDecoded(decodeJwt(token)), 150);
    return () => clearTimeout(id);
  }, [token]);

  useEffect(() => {
    setVerifyState("idle");
  }, [token, secret]);

  const alg = decoded?.ok && typeof (decoded.value.header as { alg?: unknown })?.alg === "string"
    ? ((decoded.value.header as { alg: string }).alg)
    : undefined;

  async function handleVerify() {
    if (!decoded?.ok || !alg) return;
    if (!isHmacAlg(alg)) {
      setVerifyState("unsupported");
      return;
    }
    setVerifyState("checking");
    try {
      const valid = await verifyHmacSignature(alg, decoded.value.signingInput, decoded.value.signature, secret);
      setVerifyState(valid ? "valid" : "invalid");
    } catch {
      setVerifyState("error");
    }
  }

  const payload = decoded?.ok ? (decoded.value.payload as Record<string, unknown>) : null;
  const dateClaims = payload
    ? (["iat", "exp", "nbf"] as const)
        .map((key) => ({ key, date: formatClaimDate(payload[key]) }))
        .filter((c) => c.date !== null)
    : [];

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">JWT</p>
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        spellCheck={false}
        placeholder="Paste a JWT (header.payload.signature)…"
        className="h-24 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-xs text-neutral-200 focus:border-accent-500 focus:outline-none sm:text-sm"
      />

      {decoded && !decoded.ok && (
        <div className="mt-4 rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">
          {decoded.error}
        </div>
      )}

      {decoded?.ok && (
        <>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Header</p>
                <CopyButton getText={() => JSON.stringify(decoded.value.header, null, 2)} />
              </div>
              <pre className="overflow-auto rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-xs sm:text-sm">
                <code dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(decoded.value.header, null, 2)) }} />
              </pre>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Payload</p>
                <CopyButton getText={() => JSON.stringify(decoded.value.payload, null, 2)} />
              </div>
              <pre className="overflow-auto rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-xs sm:text-sm">
                <code dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(decoded.value.payload, null, 2)) }} />
              </pre>
            </div>
          </div>

          {dateClaims.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {dateClaims.map(({ key, date }) => (
                <div key={key} className="rounded-control border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">
                  <span className="font-mono font-bold text-accent-400">{key}</span>{" "}
                  <span className="text-neutral-400">{date}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-card border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Verify signature</p>
            <p className="mt-1 text-xs text-neutral-500">
              Algorithm: <span className="font-mono text-neutral-300">{alg ?? "unknown"}</span>
              {alg && !isHmacAlg(alg) && " — asymmetric, decode-only (can't verify without the issuer's public key)"}
            </p>
            {alg && isHmacAlg(alg) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Shared secret"
                  className="min-w-0 flex-1 rounded-control border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-200 focus:border-accent-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!secret || verifyState === "checking"}
                  className="rounded-control bg-accent-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Verify
                </button>
                {verifyState === "valid" && <span className="text-xs font-semibold text-emerald-400">✓ Signature valid</span>}
                {verifyState === "invalid" && <span className="text-xs font-semibold text-red-400">✗ Signature invalid</span>}
                {verifyState === "error" && <span className="text-xs font-semibold text-red-400">Couldn't verify — check the secret.</span>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
