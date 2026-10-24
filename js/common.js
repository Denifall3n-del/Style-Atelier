/* Style Atelier - shared JS: i18n, nav, reveal */
(function(){
  "use strict";
  var LANG = window.LANG || {ru:{}, en:{}};
  var store = null;
  try{ store = window.localStorage; }catch(e){}

  function getLang(){
    var l = "ru";
    try{ l = store.getItem("sa-lang") || "ru"; }catch(e){}
    return (l === "en") ? "en" : "ru";
  }
  function t(key, lang){
    var d = LANG[lang] || {};
    if(typeof d[key] === "string") return d[key]; /* flat keys: "meta.title" */
    var parts = key.split("."); /* nested keys: {meta:{title:...}} */
    var v = d;
    for(var i=0;i<parts.length;i++){ v = (v||{})[parts[i]]; }
    if(typeof v === "string") return v;
    if(lang !== "ru") return t(key, "ru");
    return "";
  }
  function applyLang(lang){
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      el.textContent = t(el.getAttribute("data-i18n"), lang);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function(el){
      el.innerHTML = t(el.getAttribute("data-i18n-html"), lang);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function(el){
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"), lang));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function(el){
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"), lang));
    });
    document.querySelectorAll("[data-i18n-content]").forEach(function(el){
      el.setAttribute("content", t(el.getAttribute("data-i18n-content"), lang));
    });
    document.querySelectorAll(".lang-switch button").forEach(function(b){
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try{ store.setItem("sa-lang", lang); }catch(e){}
    window.SA_LANG = lang;
    document.dispatchEvent(new CustomEvent("sa:lang", {detail:{lang:lang}}));
  }

  document.addEventListener("click", function(e){
    var b = e.target.closest(".lang-switch button");
    if(b){ applyLang(b.getAttribute("data-lang")); }
    var s = e.target.closest(".skip-link");
    if(s){
      var mt = document.getElementById("main");
      if(mt && typeof mt.focus === "function"){ mt.focus({preventScroll:true}); }
    }
  });

  // Mobile nav
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if(navToggle && mainNav){
    navToggle.addEventListener("click", function(){ mainNav.classList.toggle("open"); });
    mainNav.addEventListener("click", function(e){
      if(e.target.closest("a")) mainNav.classList.remove("open");
    });
  }

  // Reveal on scroll
  var revealEls = [];
  function observeReveals(){
    revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal:not(.observed)"));
    if(!("IntersectionObserver" in window)){
      revealEls.forEach(function(el){ el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, {threshold:.12});
    revealEls.forEach(function(el){ el.classList.add("observed"); io.observe(el); });
  }

  // Helpers exposed to pages
  window.SA = {
    t: t,
    getLang: getLang,
    applyLang: applyLang,
    esc: function(s){ return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); },
    observeReveals: observeReveals
  };

  document.addEventListener("DOMContentLoaded", function(){
    applyLang(getLang());
    observeReveals();
  });
})();
