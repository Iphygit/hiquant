(function () {
  "use strict";

  const rowsNode = document.querySelector("[data-intake-rows]");
  if (!rowsNode) return;

  const searchInput = document.querySelector("[data-intake-search]");
  const statusFilter = document.querySelector("[data-status-filter]");
  const countNode = document.querySelector("[data-intake-count]");
  const emptyNode = document.querySelector("[data-intake-empty]");
  const errorAlert = document.querySelector("[data-intake-error]");
  const successAlert = document.querySelector("[data-intake-success]");
  const refreshButton = document.querySelector("[data-refresh-intakes]");
  const detailCard = document.querySelector(".admin-detail-card");
  const detailPlaceholder = document.querySelector("[data-detail-placeholder]");
  const detailContent = document.querySelector("[data-detail-content]");
  const reviewForm = document.querySelector("[data-review-form]");
  const notesCount = document.querySelector("[data-notes-count]");
  const saveButton = document.querySelector("[data-save-review]");

  const fieldList = [
    "id",
    "first_name",
    "last_name",
    "company",
    "job_title",
    "email",
    "phone",
    "service_category",
    "industry",
    "project_description",
    "expected_start_date",
    "project_duration",
    "budget_range",
    "preferred_contact_method",
    "referral_source",
    "consent_acknowledged",
    "consent_acknowledged_at",
    "status",
    "admin_notes",
    "created_at",
    "updated_at"
  ].join(", ");

  const statusLabels = {
    new: "New",
    reviewing: "Reviewing",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal sent",
    converted: "Converted",
    closed: "Closed",
    declined: "Declined"
  };

  const serviceLabels = {
    biotech_consulting: "Biotech consulting",
    pharmaceutical_consulting: "Pharmaceutical consulting",
    quality_gmp: "Quality / GMP",
    laboratory_analytical: "Laboratory / analytical",
    it_consulting: "IT consulting",
    data_automation: "Data / automation",
    digital_transformation: "Digital transformation",
    strategy_advisory: "Strategy / advisory",
    other: "Other"
  };

  const valueLabels = {
    biotechnology: "Biotechnology",
    pharmaceuticals: "Pharmaceuticals",
    laboratory_analytical: "Laboratory / analytical",
    information_technology: "Information technology",
    professional_services: "Professional services",
    under_1_month: "Under 1 month",
    "1_to_3_months": "1–3 months",
    "3_to_6_months": "3–6 months",
    "6_to_12_months": "6–12 months",
    ongoing: "Ongoing support",
    not_sure: "Not sure yet",
    under_5000: "Under $5,000",
    "5000_15000": "$5,000–$15,000",
    "15000_50000": "$15,000–$50,000",
    "50000_plus": "$50,000+",
    not_determined: "Not determined",
    email: "Email",
    phone: "Phone",
    video_call: "Video call",
    professional_referral: "Professional referral",
    search: "Online search",
    linkedin: "LinkedIn",
    conference_event: "Conference or event",
    previous_connection: "Previous connection",
    other: "Other"
  };

  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  });

  let intakes = [];
  let selectedIntake = null;

  function displayValue(value, labels) {
    if (value === null || value === undefined || value === "") return "Not provided";
    return labels && labels[value] ? labels[value] : String(value);
  }

  function setText(selector, value) {
    document.querySelector(selector).textContent = value;
  }

  function setStatusChip(node, status) {
    node.className = "status-chip status-" + status;
    node.textContent = statusLabels[status] || status;
  }

  function tableCell(value, className) {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    if (value instanceof Node) {
      cell.append(value);
    } else {
      cell.textContent = value;
    }
    return cell;
  }

  function filteredIntakes() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const status = statusFilter.value;

    return intakes.filter(function (intake) {
      const matchesStatus = !status || intake.status === status;
      if (!query) return matchesStatus;

      const searchable = [
        intake.first_name,
        intake.last_name,
        intake.company,
        intake.email,
        serviceLabels[intake.service_category],
        intake.service_category
      ].filter(Boolean).join(" ").toLocaleLowerCase();

      return matchesStatus && searchable.includes(query);
    });
  }

  function renderRows() {
    const visible = filteredIntakes();
    rowsNode.replaceChildren();
    countNode.textContent = visible.length + (visible.length === 1 ? " inquiry" : " inquiries");
    emptyNode.classList.toggle("is-hidden", visible.length !== 0);

    visible.forEach(function (intake) {
      const row = document.createElement("tr");
      if (selectedIntake && intake.id === selectedIntake.id) {
        row.classList.add("is-selected");
      }

      const identity = document.createElement("span");
      identity.className = "admin-table-client";
      const name = document.createElement("strong");
      name.textContent = intake.first_name + " " + intake.last_name;
      const email = document.createElement("span");
      email.textContent = intake.email;
      identity.append(name, email);

      const chip = document.createElement("span");
      setStatusChip(chip, intake.status);

      const action = document.createElement("button");
      action.className = "admin-row-action";
      action.type = "button";
      action.textContent = "View details";
      action.setAttribute("aria-label", "View inquiry from " + intake.first_name + " " + intake.last_name);
      action.addEventListener("click", function () {
        selectIntake(intake.id, true);
      });

      row.append(
        tableCell(dateFormatter.format(new Date(intake.created_at))),
        tableCell(identity),
        tableCell(displayValue(intake.company)),
        tableCell(displayValue(intake.service_category, serviceLabels)),
        tableCell(chip),
        tableCell(action, "admin-table-action")
      );
      rowsNode.append(row);
    });
  }

  function updateNotesCount() {
    notesCount.textContent = reviewForm.elements.admin_notes.value.length + " / 5000";
  }

  function selectIntake(id, updateUrl) {
    const match = intakes.find(function (intake) {
      return intake.id === id;
    });
    if (!match) return;

    selectedIntake = match;
    detailPlaceholder.classList.add("is-hidden");
    detailContent.classList.remove("is-hidden");

    setText("[data-detail-name]", match.first_name + " " + match.last_name);
    setText("[data-detail-company]", displayValue(match.company));
    setText("[data-detail-created]", dateTimeFormatter.format(new Date(match.created_at)));
    setText("[data-detail-email]", match.email);
    setText("[data-detail-phone]", displayValue(match.phone));
    setText("[data-detail-job-title]", displayValue(match.job_title));
    setText("[data-detail-service]", displayValue(match.service_category, serviceLabels));
    setText("[data-detail-industry]", displayValue(match.industry, valueLabels));
    setText(
      "[data-detail-start]",
      match.expected_start_date
        ? dateFormatter.format(new Date(match.expected_start_date + "T00:00:00"))
        : "Not provided"
    );
    setText("[data-detail-duration]", displayValue(match.project_duration, valueLabels));
    setText("[data-detail-budget]", displayValue(match.budget_range, valueLabels));
    setText("[data-detail-contact]", displayValue(match.preferred_contact_method, valueLabels));
    setText("[data-detail-referral]", displayValue(match.referral_source, valueLabels));
    setText("[data-detail-consent]", match.consent_acknowledged ? "Acknowledged" : "Not acknowledged");
    setText(
      "[data-detail-consent-time]",
      match.consent_acknowledged_at
        ? dateTimeFormatter.format(new Date(match.consent_acknowledged_at))
        : "Not recorded"
    );
    setText("[data-detail-description]", match.project_description);
    setStatusChip(document.querySelector("[data-detail-status]"), match.status);

    reviewForm.elements.status.value = match.status;
    reviewForm.elements.admin_notes.value = match.admin_notes || "";
    updateNotesCount();
    renderRows();

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("id", match.id);
      window.history.replaceState(null, "", url);
    }
  }

  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.remove("is-hidden");
    successAlert.classList.add("is-hidden");
    errorAlert.focus();
  }

  async function loadIntakes() {
    refreshButton.disabled = true;
    refreshButton.textContent = "Refreshing…";
    errorAlert.classList.add("is-hidden");
    countNode.textContent = "Loading records…";

    try {
      const { data, error } = await window.hiquantAuth.client()
        .from("intakes")
        .select(fieldList)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      intakes = data || [];
      renderRows();

      const requestedId = new URLSearchParams(window.location.search).get("id");
      const targetId =
        requestedId ||
        (selectedIntake && intakes.some(function (item) {
          return item.id === selectedIntake.id;
        }) ? selectedIntake.id : null);

      const targetExists = targetId && intakes.some(function (item) {
        return item.id === targetId;
      });

      if (targetExists) {
        selectIntake(targetId, false);
      } else {
        selectedIntake = null;
        detailContent.classList.add("is-hidden");
        detailPlaceholder.classList.remove("is-hidden");
        if (requestedId) {
          const url = new URL(window.location.href);
          url.searchParams.delete("id");
          window.history.replaceState(null, "", url);
        }
      }
    } catch (error) {
      console.error("Client intakes could not be loaded.");
      intakes = [];
      renderRows();
      showError("Client intakes are temporarily unavailable. Refresh the page to try again.");
    } finally {
      refreshButton.disabled = false;
      refreshButton.textContent = "Refresh records";
    }
  }

  searchInput.addEventListener("input", renderRows);
  statusFilter.addEventListener("change", renderRows);
  refreshButton.addEventListener("click", loadIntakes);
  reviewForm.elements.admin_notes.addEventListener("input", updateNotesCount);

  reviewForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!selectedIntake) return;

    saveButton.disabled = true;
    saveButton.textContent = "Saving review…";
    errorAlert.classList.add("is-hidden");
    successAlert.classList.add("is-hidden");

    const payload = {
      status: reviewForm.elements.status.value,
      admin_notes: reviewForm.elements.admin_notes.value.trim() || null
    };

    try {
      const { data, error } = await window.hiquantAuth.client()
        .from("intakes")
        .update(payload)
        .eq("id", selectedIntake.id)
        .eq("updated_at", selectedIntake.updated_at)
        .select(fieldList)
        .maybeSingle();
      if (error) throw error;

      if (!data) {
        await loadIntakes();
        showError("This inquiry changed after you opened it. The latest version has been loaded; review it before saving again.");
        return;
      }

      intakes = intakes.map(function (intake) {
        return intake.id === data.id ? data : intake;
      });
      selectedIntake = data;
      selectIntake(data.id, false);
      successAlert.textContent = "The intake status and administrator notes were saved.";
      successAlert.classList.remove("is-hidden");
      successAlert.focus();
    } catch (error) {
      console.error("The intake review could not be saved.");
      showError("The review could not be saved. Your changes remain on screen; please try again.");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Save review";
    }
  });

  window.addEventListener("hiquant:admin-ready", loadIntakes, { once: true });
  if (window.hiquantAdminContext) loadIntakes();
})();
