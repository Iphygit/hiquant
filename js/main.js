(function () {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const navigation = document.querySelector("#primary-navigation");
  const menuLabel = toggle?.querySelector(".sr-only");

  function setMenu(open) {
    if (!toggle || !navigation) return;

    toggle.setAttribute("aria-expanded", String(open));
    navigation.dataset.open = String(open);
    document.body.classList.toggle("nav-open", open);

    if (menuLabel) {
      menuLabel.textContent = open ? "Close navigation menu" : "Open navigation menu";
    }
  }

  toggle?.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  navigation?.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle?.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 896) setMenu(false);
  });

  document.querySelectorAll("[data-current-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
})();

