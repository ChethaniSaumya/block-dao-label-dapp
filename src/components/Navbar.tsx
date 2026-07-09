import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Wallet, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { fetchNonce, verifySignature } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/airdrop", label: "Airdrop" },
  { to: "/referral", label: "Referral" },
  { to: "/about", label: "About" },
] as const;

/** RainbowKit-powered wallet button for the navbar */
function NavWalletButton({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        if (!connected) {
          return (
            <button onClick={openConnectModal} className={className}>
              <Wallet className="w-4 h-4" />
              {t("Connect Wallet")}
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 transition"
            >
              Wrong Network
            </button>
          );
        }

        return (
          <button onClick={openAccountModal} className={className}>
            <Wallet className="w-4 h-4" />
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
// ── Auth lock helpers ──
// sessionStorage survives page reloads AND React StrictMode re-mounts
function isAuthLocked(): boolean {
  const until = parseInt(sessionStorage.getItem("nxt_auth_lock") || "0", 10);
  return Date.now() < until;
}
function setAuthLock() {
  sessionStorage.setItem("nxt_auth_lock", String(Date.now() + 30000));
}
function clearAuthLock() {
  sessionStorage.removeItem("nxt_auth_lock");
}

export function Navbar() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { jwt, setJwt, clearJwt, _hasHydrated } = useAuthStore();
  const wasEverConnected = useRef(false);

  // Track REAL disconnections (not just wagmi reconnecting on page load)
  useEffect(() => {
    if (!_hasHydrated) return;

    if (isConnected) {
      wasEverConnected.current = true;
    }

    // Only clear JWT when user ACTUALLY disconnects
    if (!isConnected && wasEverConnected.current) {
      clearJwt();
      clearAuthLock();
      wasEverConnected.current = false;
    }
  }, [isConnected, _hasHydrated, clearJwt]);

  // Auto-authenticate ONLY on first connect (not on refresh with stored JWT)
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isConnected || !address) return;
    if (jwt) return;
    if (isAuthLocked()) return;

    setAuthLock();

    const auth = async () => {
      try {
        const { nonce } = await fetchNonce(address);
        const signature = await signMessageAsync({ account: address as `0x${string}`, message: nonce });
        const { token } = await verifySignature(address, signature);
        setJwt(token);
        toast.success(t("Wallet authenticated successfully"));
      } catch (err) {
        console.error("Auth error:", err);
        toast.error(t("Failed to authenticate wallet"));
        clearAuthLock(); // Allow retry on failure
      }
    };
    auth();
  }, [isConnected, address, jwt, _hasHydrated, signMessageAsync, setJwt, t]);
  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={BRAND.logo}
            alt={BRAND.foundation}
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-xl font-semibold tracking-tight">
            {BRAND.shortName}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground bg-secondary" }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground",
              }}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t(l.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "kr" : "en")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-border hover:bg-secondary transition-colors"
          >
            <Languages className="w-4 h-4" />
            {lang === "en" ? "EN" : "한국어"}
          </button>
          <NavWalletButton className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-gold text-gold-foreground font-semibold text-sm shadow-gold hover:opacity-90 transition" />
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-md text-sm hover:bg-secondary"
              >
                {t(l.label)}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLang(lang === "en" ? "kr" : "en")}
                className="flex-1 px-3 py-2 text-sm rounded-md border border-border"
              >
                {lang === "en" ? "EN" : "한국어"}
              </button>
              <NavWalletButton className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gradient-gold text-gold-foreground font-semibold text-sm" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
