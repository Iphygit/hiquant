(function () {
  "use strict";

  const rowsNode = document.querySelector("[data-appointment-rows]");
  if (!rowsNode) return;

  const searchInput = document.querySelector("[data-appointment-search]");
  const statusFilter = document.querySelector("[data-status-filter]");
  const countNode = document.querySelector("[data-appointment-count]");
  const emptyNode = document.querySelector("[data-appointment-empty]");
  const errorAlert = document.querySelector("[data-appointment-error]");
  const successAlert = document.querySelector("[data-appointment-success]");
  const refreshButton = document.querySelector("[data-refresh-appointments]");
  const detailPlaceholder = document.querySelector("[data-detail-placeholder]");
  const detailContent = document.querySelector("[data-detail-content]");
  const reviewForm = document.querySelector("[data-review-form]");
  const notesCount = document.querySelector("[data-notes-count]");
  const saveButton = document.querySelector("[data-save-review]");
  const fields = "id, client_name, client_email, company, meeting_type, preferred_date, preferred_time, timezone, consultation_topic, client_notes, status, admin_notes, created_at, updated_at";
  const statusLabels = { requested: "Requested", confirmed: "Confirmed", rescheduled: "Rescheduled", completed: "Completed", cancelled: "Cancelled" };
  const meetingLabels = { initial_consultation_30: "Initial consultation · 30 min", project_discovery_45: "Project discovery · 45 min", technical_consultation_60: "Technical consultation · 60 min" };
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
  const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  let appointments = [];
  let selected = null;

  function displayValue(input) { return input === null || input === undefined || input === "" ? "Not provided" : String(input); }
  function setText(selector, text) { document.querySelector(selector).textContent = text; }
  function setChip(node, status) { node.className = "status-chip status-" + status; node.textContent = statusLabels[status] || status; }
  function cell(content, className) { const node = document.createElement("td"); if (className) node.className = className; if (content instanceof Node) node.append(content); else node.textContent = content; return node; }
  function requestedTime(item) { return dateFormatter.format(new Date(item.preferred_date + "T00:00:00")) + " · " + timeFormatter.format(new Date("2000-01-01T" + item.preferred_time)); }

  function filteredAppointments() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    return appointments.filter(function (item) {
      if (statusFilter.value && item.status !== statusFilter.value) return false;
      const searchable = [item.client_name, item.client_email, item.company, item.consultation_topic, meetingLabels[item.meeting_type], item.meeting_type].filter(Boolean).join(" ").toLocaleLowerCase();
      return !query || searchable.includes(query);
    });
  }

  function renderRows() {
    const visible = filteredAppointments();
    rowsNode.replaceChildren();
    countNode.textContent = visible.length + (visible.length === 1 ? " appointment" : " appointments");
    emptyNode.classList.toggle("is-hidden", visible.length !== 0);
    visible.forEach(function (item) {
      const row = document.createElement("tr");
      if (selected && selected.id === item.id) row.classList.add("is-selected");
      const identity = document.createElement("span"); identity.className = "admin-table-client";
      const name = document.createElement("strong"); name.textContent = item.client_name;
      const email = document.createElement("span"); email.textContent = item.client_email;
      identity.append(name, email);
      const chip = document.createElement("span"); setChip(chip, item.status);
      const action = document.createElement("button"); action.className = "admin-row-action"; action.type = "button"; action.textContent = "View details"; action.setAttribute("aria-label", "View appointment from " + item.client_name); action.addEventListener("click", function () { selectAppointment(item.id, true); });
      row.append(cell(dateFormatter.format(new Date(item.created_at))), cell(identity), cell(meetingLabels[item.meeting_type] || item.meeting_type), cell(requestedTime(item)), cell(chip), cell(action, "admin-table-action"));
      rowsNode.append(row);
    });
  }

  function updateNotesCount() { notesCount.textContent = reviewForm.elements.admin_notes.value.length + " / 5000"; }

  function selectAppointment(id, updateUrl) {
    const item = appointments.find(function (entry) { return entry.id === id; });
    if (!item) return;
    selected = item;
    detailPlaceholder.classList.add("is-hidden"); detailContent.classList.remove("is-hidden");
    setText("[data-detail-name]", item.client_name); setText("[data-detail-company]", displayValue(item.company)); setText("[data-detail-created]", dateTimeFormatter.format(new Date(item.created_at))); setText("[data-detail-email]", item.client_email); setText("[data-detail-meeting]", meetingLabels[item.meeting_type] || item.meeting_type); setText("[data-detail-date]", dateFormatter.format(new Date(item.preferred_date + "T00:00:00"))); setText("[data-detail-time]", timeFormatter.format(new Date("2000-01-01T" + item.preferred_time))); setText("[data-detail-timezone]", item.timezone); setText("[data-detail-topic]", item.consultation_topic); setText("[data-detail-client-notes]", displayValue(item.client_notes));
    setChip(document.querySelector("[data-detail-status]"), item.status);
    reviewForm.elements.status.value = item.status; reviewForm.elements.admin_notes.value = item.admin_notes || ""; updateNotesCount(); renderRows();
    if (updateUrl) { const url = new URL(window.location.href); url.searchParams.set("id", item.id); window.history.replaceState(null, "", url); }
  }

  function showError(message) { errorAlert.textContent = message; errorAlert.classList.remove("is-hidden"); successAlert.classList.add("is-hidden"); errorAlert.focus(); }

  async function loadAppointments() {
    refreshButton.disabled = true; refreshButton.textContent = "Refreshing…"; errorAlert.classList.add("is-hidden"); countNode.textContent = "Loading records…";
    try {
      const result = await window.hiquantAuth.client().from("appointments").select(fields).order("created_at", { ascending: false }).limit(500);
      if (result.error) throw result.error;
      appointments = result.data || []; renderRows();
      const requestedId = new URLSearchParams(window.location.search).get("id");
      const targetId = requestedId || (selected && appointments.some(function (entry) { return entry.id === selected.id; }) ? selected.id : null);
      if (targetId && appointments.some(function (entry) { return entry.id === targetId; })) selectAppointment(targetId, false);
      else { selected = null; detailContent.classList.add("is-hidden"); detailPlaceholder.classList.remove("is-hidden"); if (requestedId) { const url = new URL(window.location.href); url.searchParams.delete("id"); window.history.replaceState(null, "", url); } }
    } catch (error) {
      console.error("Appointments could not be loaded."); appointments = []; renderRows(); showError("Appointments are temporarily unavailable. Refresh the page to try again.");
    } finally { refreshButton.disabled = false; refreshButton.textContent = "Refresh records"; }
  }

  searchInput.addEventListener("input", renderRows);
  statusFilter.addEventListener("change", renderRows);
  refreshButton.addEventListener("click", loadAppointments);
  reviewForm.elements.admin_notes.addEventListener("input", updateNotesCount);

  reviewForm.addEventListener("submit", async function (event) {
    event.preventDefault(); if (!selected) return;
    saveButton.disabled = true; saveButton.textContent = "Saving appointment…"; errorAlert.classList.add("is-hidden"); successAlert.classList.add("is-hidden");
    try {
      const result = await window.hiquantAuth.client().from("appointments").update({ status: reviewForm.elements.status.value, admin_notes: reviewForm.elements.admin_notes.value.trim() || null }).eq("id", selected.id).eq("updated_at", selected.updated_at).select(fields).maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) { await loadAppointments(); showError("This appointment changed after you opened it. The latest version has been loaded; review it before saving again."); return; }
      appointments = appointments.map(function (item) { return item.id === result.data.id ? result.data : item; }); selected = result.data; selectAppointment(result.data.id, false);
      successAlert.textContent = "The appointment status and administrator notes were saved."; successAlert.classList.remove("is-hidden"); successAlert.focus();
    } catch (error) { console.error("The appointment could not be saved."); showError("The appointment could not be saved. Your changes remain on screen; please try again."); }
    finally { saveButton.disabled = false; saveButton.textContent = "Save appointment"; }
  });

  window.addEventListener("hiquant:admin-ready", loadAppointments, { once: true });
  if (window.hiquantAdminContext) loadAppointments();
})();
