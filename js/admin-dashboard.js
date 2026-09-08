(function () {
  "use strict";
  const errorAlert = document.querySelector("[data-dashboard-error]");
  const recentIntakes = document.querySelector("[data-recent-list]");
  const recentAppointments = document.querySelector("[data-recent-appointments]");
  if (!recentIntakes || !recentAppointments) return;

  const serviceLabels = { biotech_consulting: "Biotech consulting", pharmaceutical_consulting: "Pharmaceutical consulting", quality_gmp: "Quality / GMP", laboratory_analytical: "Laboratory / analytical", it_consulting: "IT consulting", data_automation: "Data / automation", digital_transformation: "Digital transformation", strategy_advisory: "Strategy / advisory", other: "Other" };
  const intakeStatuses = { new: "New", reviewing: "Reviewing", contacted: "Contacted", qualified: "Qualified", proposal_sent: "Proposal sent", converted: "Converted", closed: "Closed", declined: "Declined" };
  const appointmentStatuses = { requested: "Requested", confirmed: "Confirmed", rescheduled: "Rescheduled", completed: "Completed", cancelled: "Cancelled" };
  const meetingLabels = { initial_consultation_30: "Initial consultation · 30 min", project_discovery_45: "Project discovery · 45 min", technical_consultation_60: "Technical consultation · 60 min" };
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
  const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

  function countQuery(table, status) {
    let query = window.hiquantAuth.client().from(table).select("id", { count: "exact", head: true });
    if (status) query = query.eq("status", status);
    return query;
  }
  function textNode(className, value) { const node = document.createElement("span"); node.className = className; node.textContent = value; return node; }
  function emptyList(target, message) { target.replaceChildren(); const node = document.createElement("p"); node.className = "admin-muted"; node.textContent = message; target.append(node); }

  function renderIntakes(items) {
    recentIntakes.replaceChildren();
    if (!items.length) return emptyList(recentIntakes, "No client inquiries have been received yet.");
    items.forEach(function (item) {
      const link = document.createElement("a"); link.className = "admin-recent-item"; link.href = "intakes.html?id=" + encodeURIComponent(item.id);
      const identity = document.createElement("span"); identity.className = "admin-recent-identity"; identity.append(textNode("admin-recent-name", item.first_name + " " + item.last_name), textNode("admin-recent-meta", (item.company || "No company provided") + " · " + (serviceLabels[item.service_category] || item.service_category)));
      const timing = document.createElement("span"); timing.className = "admin-recent-timing"; timing.append(textNode("status-chip status-" + item.status, intakeStatuses[item.status] || item.status), textNode("admin-recent-date", dateTimeFormatter.format(new Date(item.created_at))));
      link.append(identity, timing); recentIntakes.append(link);
    });
  }

  function renderAppointments(items) {
    recentAppointments.replaceChildren();
    if (!items.length) return emptyList(recentAppointments, "No appointment requests have been received yet.");
    items.forEach(function (item) {
      const link = document.createElement("a"); link.className = "admin-recent-item"; link.href = "appointments.html?id=" + encodeURIComponent(item.id);
      const identity = document.createElement("span"); identity.className = "admin-recent-identity"; identity.append(textNode("admin-recent-name", item.client_name), textNode("admin-recent-meta", (meetingLabels[item.meeting_type] || item.meeting_type) + " · " + dateFormatter.format(new Date(item.preferred_date + "T00:00:00"))));
      const timing = document.createElement("span"); timing.className = "admin-recent-timing"; timing.append(textNode("status-chip status-" + item.status, appointmentStatuses[item.status] || item.status), textNode("admin-recent-date", dateTimeFormatter.format(new Date(item.created_at))));
      link.append(identity, timing); recentAppointments.append(link);
    });
  }

  async function loadDashboard() {
    try {
      const client = window.hiquantAuth.client();
      const results = await Promise.all([
        countQuery("intakes", "new"), countQuery("appointments", "requested"), countQuery("appointments", "confirmed"), countQuery("intakes", null), countQuery("appointments", null),
        client.from("intakes").select("id, first_name, last_name, company, service_category, status, created_at").order("created_at", { ascending: false }).limit(5),
        client.from("appointments").select("id, client_name, meeting_type, preferred_date, status, created_at").order("created_at", { ascending: false }).limit(5)
      ]);
      const failed = results.find(function (result) { return Boolean(result.error); }); if (failed) throw failed.error;
      document.querySelector("[data-count-new]").textContent = String(results[0].count || 0);
      document.querySelector("[data-count-requested]").textContent = String(results[1].count || 0);
      document.querySelector("[data-count-confirmed]").textContent = String(results[2].count || 0);
      document.querySelector("[data-count-total]").textContent = String((results[3].count || 0) + (results[4].count || 0));
      renderIntakes(results[5].data || []); renderAppointments(results[6].data || []);
    } catch (error) {
      console.error("The dashboard summary could not be loaded."); errorAlert.textContent = "The dashboard summary is temporarily unavailable. Refresh the page to try again."; errorAlert.classList.remove("is-hidden"); emptyList(recentIntakes, "Recent inquiries could not be loaded."); emptyList(recentAppointments, "Recent appointments could not be loaded.");
    }
  }
  window.addEventListener("hiquant:admin-ready", loadDashboard, { once: true }); if (window.hiquantAdminContext) loadDashboard();
})();
