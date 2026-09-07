(function () {
  "use strict";

  const loginForm = document.querySelector("[data-login-form]");
  if (!loginForm) return;

  const loginButton = document.querySelector("[data-login-button]");
  const loginLabel = document.querySelector("[data-login-label]");
  const errorAlert = document.querySelector("[data-auth-error]");
  const successAlert = document.querySelector("[data-auth-success]");
  const recoveryForm = document.querySelector("[data-recovery-form]");
  const recoveryEmail = recoveryForm.elements.email;
  const recoveryError = document.querySelector("[data-recovery-error]");
  const recoveryButton = document.querySelector("[data-recovery-button]");

  function showAlert(node, message) {
    node.textContent = message;
    node.classList.remove("is-hidden");
    node.focus();
  }

  function clearAlerts() {
    errorAlert.classList.add("is-hidden");
    successAlert.classList.add("is-hidden");
    errorAlert.textContent = "";
    successAlert.textContent = "";
  }

  function setLoginLoading(loading) {
    loginButton.disabled = loading;
    loginButton.dataset.loading = String(loading);
    loginButton.setAttribute("aria-busy", String(loading));
    loginLabel.textContent = loading ? "Verifying access…" : "Sign in securely";
  }

  function fieldError(control, node) {
    const message = control.validity.valueMissing
      ? (control.type === "email" ? "Email address" : "Password") + " is required."
      : control.validity.typeMismatch
        ? "Enter a valid email address."
        : control.validity.tooShort
          ? "Password must contain at least " + control.minLength + " characters."
          : "";

    control.setAttribute("aria-invalid", String(Boolean(message)));
    node.textContent = message;
    return message;
  }

  async function redirectIfAuthorized() {
    try {
      const result = await window.hiquantAuth.authorizedAdmin();
      if (result.authorized) {
        window.location.replace("index.html");
      }
    } catch (error) {
      console.error("The existing administrator session could not be checked.");
    }
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearAlerts();

    const email = loginForm.elements.email;
    const password = loginForm.elements.password;
    const emailError = fieldError(email, document.querySelector("[data-error-for='email']"));
    const passwordError = fieldError(password, document.querySelector("[data-error-for='password']"));
    if (emailError || passwordError) return;

    setLoginLoading(true);

    try {
      const supabase = window.hiquantAuth.client();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      });

      if (error) {
        showAlert(errorAlert, "The email or password is incorrect.");
        return;
      }

      const result = await window.hiquantAuth.authorizedAdmin();
      if (!result.authorized) {
        await window.hiquantAuth.signOut();
        showAlert(errorAlert, "This account is not approved for administrator access.");
        return;
      }

      window.location.replace("index.html");
    } catch (error) {
      console.error("Administrator sign-in failed.");
      showAlert(errorAlert, "Administrator sign-in is temporarily unavailable. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  });

  [loginForm.elements.email, loginForm.elements.password].forEach(function (control) {
    control.addEventListener("input", function () {
      if (control.getAttribute("aria-invalid") === "true") {
        const node = document.querySelector("[data-error-for='" + control.name + "']");
        fieldError(control, node);
      }
    });
  });

  document.querySelector("[data-show-recovery]").addEventListener("click", function () {
    recoveryForm.classList.remove("is-hidden");
    recoveryEmail.value = loginForm.elements.email.value.trim();
    recoveryEmail.focus();
  });

  document.querySelector("[data-hide-recovery]").addEventListener("click", function () {
    recoveryForm.classList.add("is-hidden");
    recoveryError.textContent = "";
    recoveryEmail.setAttribute("aria-invalid", "false");
  });

  recoveryForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearAlerts();

    const message = recoveryEmail.validity.valueMissing
      ? "Email address is required."
      : recoveryEmail.validity.typeMismatch
        ? "Enter a valid email address."
        : "";

    recoveryEmail.setAttribute("aria-invalid", String(Boolean(message)));
    recoveryError.textContent = message;
    if (message) return;

    recoveryButton.disabled = true;
    recoveryButton.setAttribute("aria-busy", "true");

    try {
      const { error } = await window.hiquantAuth.client().auth.resetPasswordForEmail(
        recoveryEmail.value.trim(),
        { redirectTo: window.hiquantAuth.pageUrl("reset-password.html") }
      );

      if (error) throw error;

      recoveryForm.classList.add("is-hidden");
      showAlert(successAlert, "If an administrator account exists for that email, recovery instructions have been sent.");
    } catch (error) {
      console.error("The password recovery request failed.");
      showAlert(errorAlert, "Password recovery is temporarily unavailable. Please try again.");
    } finally {
      recoveryButton.disabled = false;
      recoveryButton.setAttribute("aria-busy", "false");
    }
  });

  const reason = new URLSearchParams(window.location.search).get("reason");
  const notices = {
    unauthorized: "Sign in with an approved administrator account to continue.",
    "password-updated": "Your password was updated. Sign in with the new password.",
    signedout: "You have signed out securely.",
    unavailable: "Administrator verification was interrupted. Please sign in again."
  };
  if (notices[reason]) {
    showAlert(reason === "password-updated" ? successAlert : errorAlert, notices[reason]);
  }

  redirectIfAuthorized();
})();
