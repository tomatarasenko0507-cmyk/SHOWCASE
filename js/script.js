(() => {
  "use strict";
  const root = document.documentElement;
  root.lang = "ru";
  try { localStorage.removeItem("tamara-language"); } catch { /* Storage can be unavailable. */ }
  // Add confirmed assets here, using the visible data-asset label as the key.
  // Example: { LABEL: { src: "assets/file.webp", alt: "Описание изображения" } }
  const assetSources = {};
  document.querySelectorAll("[data-asset]").forEach((figure) => {
    const asset = assetSources[figure.dataset.asset];
    if (!asset) return;
    const image = document.createElement("img");
    image.src = asset.src;
    image.alt = asset.alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => image.remove());
    figure.prepend(image);
  });
  const readPreference = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const savePreference = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Preferences remain usable when storage is blocked. */
    }
  };
  function setTheme(theme) {
    root.dataset.theme = theme;
    document
      .querySelectorAll("button[data-theme]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.theme === theme),
        ),
      );
    savePreference("tamara-theme", theme);
  }
  setTheme(readPreference("tamara-theme") === "dark" ? "dark" : "light");
  document
    .querySelectorAll("button[data-theme]")
    .forEach((button) =>
      button.addEventListener("click", () => setTheme(button.dataset.theme)),
    );
  const menu = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#mobile-nav");
  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    navigation.hidden = true;
  }
  menu.addEventListener("click", () => {
    const isOpen = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!isOpen));
    navigation.hidden = isOpen;
  });
  navigation
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !navigation.hidden) {
      closeMenu();
      menu.focus();
    }
  });
  window
    .matchMedia("(min-width: 1100px)")
    .addEventListener("change", closeMenu);
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function activateTab(tab, focus = false) {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activateTab(tabs[next], true);
      }
    });
  });
  // Observe the requested navigation sections without hiding content or changing scroll position.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          document.querySelectorAll(".main-nav a").forEach((link) => {
            if (link.hash === "#" + entry.target.id)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-15% 0px -55% 0px" },
    );
    ["work", "writing", "production", "about", "contact"].forEach((id) =>
      observer.observe(document.getElementById(id)),
    );
  }
})();
