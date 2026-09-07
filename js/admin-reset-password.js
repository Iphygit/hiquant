(function () {
  "use strict";

  const form = document.querySelector("[data-reset-form]");
  if (!form) return;

  const status = document.querySelector("[data-recovery-status]");
  const errorAlert = document.querySelector("[data-reset-error]");
  const passwordError = document.querySelector("[data-password-error]");
  const confirmError = document.querySelector("[data-confirm-error]");
  const submitButton = document.querySelector("[data-reset-button]");

  function enableForm() {
    status.textContent = "Your recovery link is verified. Enter a new password below.";
    errorAlert.textContent = "";
    errorAlert.classList.add("is-hidden");
    form.classList.remove("is-hidden");
  }

  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.remove("is-hidden");
    errorAlert.focus();
  }

  function validate() {
    const password = form.elements.password;
    const confirmation = form.elements.confirm_password;
    const passwordMessage = password.validity.valueMissing
      ? "New password is required."
      : password.validity.tooShort
        ? "Use at least " + password.minLength + " characters."
        : "";
    const confirmationMessage = confirmation.validity.valueMissing
      ? "Confirm the new password."
      : confirmation.value !== password.value
        ? "The passwords do not match."
        : "";

    password.setAttribute("aria-invalid", String(Boolean(passwordMessage)));
    confirmation.setAttribute("aria-invalid", String(Boolean(confirmationMessage)));
    passwordError.textContent = passwordMessage;
    confirmError.textContent = confirmationMessage;
    return !passwordMessage && !confirmationMessage;
  }

  window.hiquantAuth.client().auth.onAuthStateChange(function (event) {
    if (event === "PASSWORD_RECOVERY") enableForm();
  });

  window.setTimeout(async function () {
    try {
      const { data, error } = await window.hiquantAuth.client().auth.getSession();
      if (error || !data.session) {
        status.textContent = "This recovery link is invalid or has expired.";
        showError("Request a new recovery email from the administrator sign-in page.");
        return;
      }
      enableForm();
    } catch (error) {
      status.textContent = "The recovery link could not be verified.";
      showError("Password recovery is temporarily unavailable. Please try again.");
    }
  }, 0);

  [form.elements.password, form.elements.confirm_password].forEach(function (control) {
    control.addEventListener("input", function () {
      if (control.getAttribute("aria-invalid") === "true") validate();
    });
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorAlert.classList.add("is-hidden");
    if (!validate()) return;

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButton.textContent = "Updating password…";

    try {
      const { error } = await window.hiquantAuth.client().auth.updateUser({
        password: form.elements.password.value
      });
      if (error) throw error;

      await window.hiquantAuth.signOut();
      window.location.replace("login.html?reason=password-updated");
    } catch (error) {
      console.error("The administrator password could not be updated.");
      showError("The password could not be updated. Request a new recovery link and try again.");
      submitButton.disabled = false;
      submitButton.setAttribute("aria-busy", "false");
      submitButton.textContent = "Update password";
    }
  });
})();
