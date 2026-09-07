(function () {
  "use strict";

  const errorAlert = document.querySelector("[data-dashboard-error]");
  const recentList = document.querySelector("[data-recent-list]");
  if (!recentList) return;

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

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  function countQuery(status) {
    let query = window.hiquantAuth.client()
      .from("intakes")
      .select("id", { count: "exact", head: true });
    if (status) query = query.eq("status", status);
    return query;
  }

  function makeText(className, value) {
    const node = document.createElement("span");
    node.className = className;
    node.textContent = value;
    return node;
  }

  function renderRecent(intakes) {
    recentList.replaceChildren();

    if (!intakes.length) {
      const empty = document.createElement("p");
      empty.className = "admin-muted";
      empty.textContent = "No client inquiries have been received yet.";
      recentList.append(empty);
      return;
    }

    intakes.forEach(function (intake) {
      const link = document.createElement("a");
      link.className = "admin-recent-item";
      link.href = "intakes.html?id=" + encodeURIComponent(intake.id);

      const identity = document.createElement("span");
      identity.className = "admin-recent-identity";
      identity.append(
        makeText("admin-recent-name", intake.first_name + " " + intake.last_name),
        makeText(
          "admin-recent-meta",
          (intake.company || "No company provided") + " · " +
            (serviceLabels[intake.service_category] || intake.service_category)
        )
      );

      const timing = document.createElement("span");
      timing.className = "admin-recent-timing";
      timing.append(
        makeText("status-chip status-" + intake.status, statusLabels[intake.status] || intake.status),
        makeText("admin-recent-date", dateFormatter.format(new Date(intake.created_at)))
      );

      link.append(identity, timing);
      recentList.append(link);
    });
  }

  async function loadDashboard() {
    try {
      const supabase = window.hiquantAuth.client();
      const results = await Promise.all([
        countQuery("new"),
        countQuery("reviewing"),
        countQuery("qualified"),
        countQuery(null),
        supabase
          .from("intakes")
          .select("id, first_name, last_name, company, service_category, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      const failed = results.find(function (result) {
        return Boolean(result.error);
      });
      if (failed) throw failed.error;

      document.querySelector("[data-count-new]").textContent = String(results[0].count || 0);
      document.querySelector("[data-count-reviewing]").textContent = String(results[1].count || 0);
      document.querySelector("[data-count-qualified]").textContent = String(results[2].count || 0);
      document.querySelector("[data-count-total]").textContent = String(results[3].count || 0);
      renderRecent(results[4].data || []);
    } catch (error) {
      console.error("The intake summary could not be loaded.");
      errorAlert.textContent = "The intake summary is temporarily unavailable. Refresh the page to try again.";
      errorAlert.classList.remove("is-hidden");
      recentList.replaceChildren();
      const message = document.createElement("p");
      message.className = "admin-muted";
      message.textContent = "Recent inquiries could not be loaded.";
      recentList.append(message);
    }
  }

  window.addEventListener("hiquant:admin-ready", loadDashboard, { once: true });
  if (window.hiquantAdminContext) loadDashboard();
})();
