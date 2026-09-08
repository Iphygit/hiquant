(function () {
  "use strict";

  const form = document.querySelector("#schedule-form");
  if (!form) return;

  const submitButton = form.querySelector("[data-submit-button]");
  const submitLabel = form.querySelector("[data-submit-label]");
  const errorSummary = document.querySelector("[data-error-summary]");
  const errorList = document.querySelector("[data-error-list]");
  const successMessage = document.querySelector("[data-success-message]");
  const preferredDate = form.elements.preferred_date;
  const topic = form.elements.consultation_topic;
  const notes = form.elements.client_notes;
  const controls = Array.from(form.elements).filter(function (control) {
    return control.matches("input:not([type='hidden']), select, textarea") && control.name !== "website";
  });

  function localDateString(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function labelFor(control) {
    if (control.dataset.label) return control.dataset.label;
    const label = document.querySelector('label[for="' + control.id + '"]');
    return label ? label.textContent.replace("*", "").trim() : "This field";
  }

  function validationMessage(control) {
    const label = labelFor(control);
    if (control.required && control.type !== "checkbox" && !control.value.trim()) return label + " is required.";
    if (control.minLength > 0 && control.value.trim().length < control.minLength) return label + " must contain at least " + control.minLength + " characters.";
    if (control.validity.valueMissing) return label + " is required.";
    if (control.validity.typeMismatch) return "Enter a valid email address, such as name@company.com.";
    if (control.validity.tooShort) return label + " must contain at least " + control.minLength + " characters.";
    if (control.validity.tooLong) return label + " must contain no more than " + control.maxLength + " characters.";
    if (control === preferredDate && control.value && control.value < control.min) return "Preferred date cannot be in the past.";
    return control.validationMessage || label + " is not valid.";
  }

  function isValid(control) {
    const hasRequiredText = control.type === "checkbox" || !control.required || Boolean(control.value.trim());
    const hasMinimumText = control.minLength < 1 || control.value.trim().length >= control.minLength;
    return control.validity.valid && hasRequiredText && hasMinimumText && !(control === preferredDate && control.value && control.value < control.min);
  }

  function validate(control) {
    const message = isValid(control) ? "" : validationMessage(control);
    control.setAttribute("aria-invalid", String(Boolean(message)));
    const target = document.getElementById(control.id + "-error");
    if (target) target.textContent = message;
    return message;
  }

  function showErrors(errors) {
    errorList.replaceChildren();
    errors.forEach(function (entry) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#" + entry.control.id;
      link.textContent = labelFor(entry.control) + ": " + entry.message;
      link.addEventListener("click", function (event) { event.preventDefault(); entry.control.focus(); });
      item.append(link);
      errorList.append(item);
    });
    errorSummary.classList.remove("is-hidden");
    errorSummary.focus();
  }

  function showServiceError() {
    errorList.replaceChildren();
    const item = document.createElement("li");
    item.textContent = "We couldn't submit your request right now. Your information was not saved. Please try again.";
    errorList.append(item);
    errorSummary.classList.remove("is-hidden");
    errorSummary.focus();
  }

  function setLoading(loading) {
    submitButton.disabled = loading;
    submitButton.setAttribute("aria-busy", String(loading));
    submitButton.dataset.loading = String(loading);
    submitLabel.textContent = loading ? "Submitting request…" : "Request consultation time";
  }

  function value(name) {
    return form.elements[name].value.trim() || null;
  }

  function payload() {
    return {
      client_name: value("client_name"), client_email: value("client_email"), company: value("company"),
      meeting_type: value("meeting_type"), preferred_date: value("preferred_date"), preferred_time: value("preferred_time"),
      timezone: value("timezone"), consultation_topic: value("consultation_topic"), client_notes: value("client_notes")
    };
  }

  function updateCounts() {
    document.querySelector("[data-topic-count]").textContent = topic.value.length + " / 300";
    document.querySelector("[data-notes-count]").textContent = notes.value.length + " / 2000";
  }

  controls.forEach(function (control) {
    control.addEventListener("blur", function () { validate(control); });
    control.addEventListener(control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input", function () {
      if (control.getAttribute("aria-invalid") === "true") validate(control);
    });
  });
  topic.addEventListener("input", updateCounts);
  notes.addEventListener("input", updateCounts);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorSummary.classList.add("is-hidden");
    successMessage.classList.add("is-hidden");
    const errors = controls.map(function (control) { return { control: control, message: validate(control) }; }).filter(function (entry) { return entry.message; });
    if (errors.length) return showErrors(errors);
    setLoading(true);
    try {
      if (!form.elements.website.value) {
        if (!window.hiquantSupabase) throw new Error("Submission service unavailable");
        const result = await window.hiquantSupabase.from("appointments").insert(payload());
        if (result.error) throw result.error;
      }
      form.reset();
      preferredDate.min = localDateString(new Date());
      try { form.elements.timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (error) { form.elements.timezone.value = "UTC"; }
      controls.forEach(function (control) { control.setAttribute("aria-invalid", "false"); const node = document.getElementById(control.id + "-error"); if (node) node.textContent = ""; });
      updateCounts();
      successMessage.classList.remove("is-hidden");
      successMessage.focus();
    } catch (error) {
      console.error("The appointment request failed.");
      showServiceError();
    } finally { setLoading(false); }
  });

  preferredDate.min = localDateString(new Date());
  try { form.elements.timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (error) { form.elements.timezone.value = "UTC"; }
  updateCounts();
})();
