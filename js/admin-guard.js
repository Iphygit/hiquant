(function () {
  "use strict";

  const loading = document.querySelector("[data-auth-loading]");
  const protectedContent = document.querySelector("[data-protected-content]");
  const signOutButton = document.querySelector("[data-signout]");

  function loginUrl(reason) {
    const url = new URL("login.html", window.location.href);
    url.searchParams.set("reason", reason);
    return url.href;
  }

  async function guardPage() {
    try {
      const result = await window.hiquantAuth.authorizedAdmin();
      if (!result.authorized) {
        if (result.user) await window.hiquantAuth.signOut();
        window.location.replace(loginUrl("unauthorized"));
        return;
      }

      document.querySelector("[data-admin-name]").textContent =
        result.profile.full_name || "Administrator";
      document.querySelector("[data-admin-email]").textContent =
        result.user.email || "";
      loading.classList.add("is-hidden");
      protectedContent.classList.remove("is-hidden");
    } catch (error) {
      console.error("Administrator access verification failed.");
      window.location.replace(loginUrl("unavailable"));
    }
  }

  signOutButton.addEventListener("click", async function () {
    signOutButton.disabled = true;
    signOutButton.textContent = "Signing out…";

    try {
      await window.hiquantAuth.signOut();
      window.location.replace(loginUrl("signedout"));
    } catch (error) {
      console.error("Administrator sign-out failed.");
      signOutButton.disabled = false;
      signOutButton.textContent = "Sign out";
    }
  });

  guardPage();
})();
