/* global window, document, fetch */

(function () {
  "use strict";

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function makeTag(tag) {
    return '<span class="tag">' + escapeHtml(tag) + "</span>";
  }

  function projectCard(p) {
    var tags = (p.tags || []).slice(0, 5).map(makeTag).join(" ");
    var repoLink = p.links && p.links.repo ? '<a class="link" href="' + escapeHtml(p.links.repo) + '" target="_blank" rel="noreferrer">Repo</a>' : "";
    var demoLink = p.links && p.links.demo ? ' <a class="link" href="' + escapeHtml(p.links.demo) + '" target="_blank" rel="noreferrer">Demo</a>' : "";
    var writeup = p.links && p.links.writeup ? p.links.writeup : "#";

    return (
      '<article class="card project-card">' +
        '<div class="project-top">' +
          "<h3>" + escapeHtml(p.title) + "</h3>" +
          '<p class="muted small">' + escapeHtml(p.subtitle || "") + "</p>" +
        "</div>" +
        '<p class="project-summary">' + escapeHtml(p.summary || "") + "</p>" +
        '<div class="tag-row">' + tags + "</div>" +
        '<div class="project-links">' +
          '<a class="btn btn-ghost" href="' + escapeHtml(writeup) + '">Writeup</a>' +
          (repoLink ? (" " + repoLink) : "") +
          (demoLink ? demoLink : "") +
        "</div>" +
      "</article>"
    );
  }

  function uniqueTags(projects) {
    var map = {};
    projects.forEach(function (p) {
      (p.tags || []).forEach(function (t) { map[t] = true; });
    });
    return Object.keys(map).sort();
  }

  function loadProjects(cb) {
    fetch("assets/data/projects.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        cb((data && data.projects) ? data.projects : []);
      })
      .catch(function () { cb([]); });
  }

  function renderFeatured() {
    loadProjects(function (projects) {
      var el = byId("featured-projects");
      if (!el) return;

      var featured = projects.filter(function (p) { return !!p.featured; }).slice(0, 6);
      el.innerHTML = featured.map(projectCard).join("");
    });
  }

  function renderAllProjectsPage() {
    loadProjects(function (projects) {
      var listEl = byId("all-projects");
      var searchEl = byId("search");
      var tagsEl = byId("tag-filters");
      if (!listEl || !searchEl || !tagsEl) return;

      var activeTag = "";
      var tags = uniqueTags(projects);

      function renderTagButtons() {
        var html = "";
        html += '<button class="pill' + (activeTag === "" ? " pill-active" : "") + '" data-tag="">All</button>';
        tags.forEach(function (t) {
          html += '<button class="pill' + (activeTag === t ? " pill-active" : "") + '" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + "</button>";
        });
        tagsEl.innerHTML = html;

        Array.prototype.slice.call(tagsEl.querySelectorAll("button")).forEach(function (btn) {
          btn.addEventListener("click", function () {
            activeTag = btn.getAttribute("data-tag") || "";
            renderTagButtons();
            renderList();
          });
        });
      }

      function matches(p, q) {
        q = q.toLowerCase();
        var hay = [
          p.title || "",
          p.subtitle || "",
          p.summary || "",
          (p.tags || []).join(" ")
        ].join(" ").toLowerCase();

        if (activeTag && (p.tags || []).indexOf(activeTag) === -1) return false;
        return hay.indexOf(q) !== -1;
      }

      function renderList() {
        var q = searchEl.value.trim();
        var filtered = projects.filter(function (p) { return matches(p, q); });
        listEl.innerHTML = filtered.map(projectCard).join("");
      }

      renderTagButtons();
      renderList();

      searchEl.addEventListener("input", renderList);
    });
  }

  window.PortfolioProjects = {
    renderProjectsPage: renderAllProjectsPage,
    renderHomeFeatured: renderFeatured
  };

  // If on home page, render featured automatically.
  renderFeatured();
})();
