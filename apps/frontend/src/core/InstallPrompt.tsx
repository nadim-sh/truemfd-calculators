import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("truemfd-install-dismissed") === "true");

  useEffect(() => {
    const handler = (promptEvent: Event) => {
      promptEvent.preventDefault();
      setEvent(promptEvent as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!event || dismissed) return null;

  async function install() {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
  }

  function dismiss() {
    localStorage.setItem("truemfd-install-dismissed", "true");
    setDismissed(true);
  }

  return (
    <aside className="install-prompt" aria-label="Install TrueMFD app">
      <div>
        <strong>Install TrueMFD</strong>
        <span>Add these calculators to your home screen.</span>
      </div>
      <button type="button" onClick={install}><Download aria-hidden /> Install</button>
      <button type="button" className="install-dismiss" aria-label="Dismiss install prompt" onClick={dismiss}><X aria-hidden /></button>
    </aside>
  );
}
