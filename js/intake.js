(function () {
  "use strict";

  const form = document.querySelector("#intake-form");
  if (!form) return;

  const submitButton = form.querySelector("[data-submit-button]");
  const submitLabel = form.querySelector("[data-submit-label]");
  const errorSummary = document.querySelector("[data-error-summary]");
  const errorList = document.querySelector("[data-error-list]");
  const successMessage = document.querySelector("[data-success-message]");
  const description = form.elements.project_description;
  const characterCount = document.querySelector("[data-character-count]");
  const startDate = form.elements.expected_start_date;
  const controls = Array.from(form.elements).filter(function (control) {
    return control.matches("input:not([type='hidden']), select, textarea") && control.name !== "website";
  });

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function updateDateMinimum() {
    startDate.min = localDateString(new Date());
  }

  function fieldLabel(control) {
    if (control.dataset.label) return control.dataset.label;
    const label = document.querySelector(`label[for="${control.id}"]`);
    return label ? label.textContent.replace("*", "").trim() : "This field";
  }

  function errorMessage(control) {
    const label = fieldLabel(control);

    if (control.validity.valueMissing) return `${label} is required.`;
    if (control.validity.typeMismatch && control.type === "email") return "Enter a valid email address, such as name@company.com.";
    if (control.validity.tooShort) return `${label} must contain at least ${control.minLength} characters.`;
    if (control.validity.tooLong) return `${label} must contain no more than ${control.maxLength} characters.`;
    if (control.validity.patternMismatch && control.type === "tel") return "Enter a valid phone number using numbers, spaces, parentheses, +, or -.";

    if (control === startDate && control.value && control.value < startDate.min) {
      return "Expected start date cannot be in the past.";
    }

    return control.validationMessage || `${label} is not valid.`;
  }

  function fieldIsValid(control) {
    return control.validity.valid && !(control === startDate && control.value && control.value < startDate.min);
  }

  function setFieldState(control, showError) {
    const errorNode = document.getElementById(`${control.id}-error`);
    const message = showError ? errorMessage(control) : "";

    control.setAttribute("aria-invalid", String(Boolean(message)));
    if (errorNode) errorNode.textContent = message;
    return message;
  }

  function validateField(control) {
    return setFieldState(control, !fieldIsValid(control));
  }

  function clearSummary() {
    errorSummary.classList.add("is-hidden");
    errorList.replaceChildren();
  }

  function showSummary(errors) {
    errorList.replaceChildren();

    errors.forEach(function (entry) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${entry.control.id}`;
      link.textContent = `${fieldLabel(entry.control)}: ${entry.message}`;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        entry.control.focus();
      });
      item.append(link);
      errorList.append(item);
    });

    errorSummary.classList.remove("is-hidden");
    errorSummary.focus();
  }

  function setLoading(loading) {
    submitButton.disabled = loading;
    submitButton.setAttribute("aria-busy", String(loading));
    submitButton.dataset.loading = String(loading);
    submitLabel.textContent = loading ? "Checking inquiry…" : "Check and preview submission";
  }

  function updateCharacterCount() {
    characterCount.textContent = `${description.value.length} / ${description.maxLength}`;
  }

  function mockSubmit() {
    return new Promise(function (resolve, reject) {
      window.setTimeout(function () {
        if (new URLSearchParams(window.location.search).get("mockError") === "1") {
          reject(new Error("Simulated submission error"));
          return;
        }
        resolve();
      }, 650);
    });
  }

  controls.forEach(function (control) {
    control.addEventListener("blur", function () {
      validateField(control);
    });

    control.addEventListener(control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input", function () {
      if (control.getAttribute("aria-invalid") === "true") validateField(control);
    });
  });

  description.addEventListener("input", updateCharacterCount);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearSummary();
    successMessage.classList.add("is-hidden");

    const errors = controls.map(function (control) {
      return { control, message: validateField(control) };
    }).filter(function (entry) {
      return Boolean(entry.message);
    });

    if (errors.length) {
      showSummary(errors);
      return;
    }

    setLoading(true);

    try {
      await mockSubmit();
      form.reset();
      controls.forEach(function (control) {
        setFieldState(control, false);
      });
      updateCharacterCount();
      successMessage.classList.remove("is-hidden");
      successMessage.focus();
    } catch (error) {
      errorList.replaceChildren();
      const item = document.createElement("li");
      item.textContent = "The preview could not be completed. Your information was not sent or saved. Please try again.";
      errorList.append(item);
      errorSummary.classList.remove("is-hidden");
      errorSummary.focus();
    } finally {
      setLoading(false);
    }
  });

  updateDateMinimum();
  updateCharacterCount();
})();
