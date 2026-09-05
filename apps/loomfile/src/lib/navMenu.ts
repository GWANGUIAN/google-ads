/** Wires the header's hamburger toggle/panel: open/close, Escape-to-close
 *  with focus return, outside-click close, and closing on link click. Plain
 *  vanilla JS (no React island) — called once from NavMenu.astro's inline
 *  <script>. Ported verbatim from apps/hexnook/src/lib/navMenu.ts — fully
 *  generic/theme-agnostic, no changes needed for loomfile's light theme. */
export function initNavMenu(): void {
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-panel");
  const iconOpen = document.getElementById("nav-icon-open");
  const iconClose = document.getElementById("nav-icon-close");
  if (!toggle || !panel || !iconOpen || !iconClose) return;

  function open() {
    panel!.hidden = false;
    toggle!.setAttribute("aria-expanded", "true");
    iconOpen!.hidden = true;
    iconClose!.hidden = false;
  }

  function close() {
    panel!.hidden = true;
    toggle!.setAttribute("aria-expanded", "false");
    iconOpen!.hidden = false;
    iconClose!.hidden = true;
  }

  function isOpen() {
    return !panel!.hidden;
  }

  toggle.addEventListener("click", () => {
    if (isOpen()) close();
    else open();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      close();
      toggle!.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    const target = e.target as Node;
    if (!panel!.contains(target) && !toggle!.contains(target)) close();
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => close());
  });
}
