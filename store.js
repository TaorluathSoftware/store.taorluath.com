/* Renders the header/menu, footer, home, products grid, each product's own page,
   and the cart from catalog.js. Manage products in catalog.js, not here. */
(function () {
  "use strict";

  // Load the storefront web font (Poppins) once; system sans is the fallback.
  if (!document.getElementById("tl-font")) {
    const l = document.createElement("link");
    l.id = "tl-font"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }

  const enc = encodeURIComponent;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const page = (location.pathname.split("/").pop() || "index.html");
  const params = new URLSearchParams(location.search);
  const qp = (k) => params.get(k) || "";
  const productHref = (p) => `product.html?id=${enc(slug(p.name))}`;

  // Sales inbox shown to customers if something goes wrong.
  const STORE_EMAIL = "sales@taorluath.com";
  // Checkout posts the order here; the Cloudflare Function renders + emails the
  // invoice via Resend (from sales@taorluath.com). See functions/api/send-invoice.js.
  const INVOICE_ENDPOINT = "/api/send-invoice";
  // Taxes shown in the cart (BC: GST 5% + PST 7% = 12%). The server re-checks these.
  const GST_RATE = 0.05, PST_RATE = 0.07;

  // ------------------------------------------------------------------ cart
  const CART_KEY = "tl_cart";
  const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; } };
  const saveCart = (c) => { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch { /* ignore */ } updateCartBadge(); };
  const cartCount = () => getCart().reduce((n, i) => n + (i.qty || 1), 0);
  const priceNum = (str) => { const m = String(str || "").replace(/,/g, "").match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; };
  const money = (n) => "$" + n.toFixed(2) + " CAD";
  // A choice is either "Name" (no fee) or { name, add } (adds a fee to the price).
  const choiceOf = (c) => (c && typeof c === "object")
    ? { name: String(c.name), add: +c.add || 0 }
    : { name: String(c), add: 0 };
  const optsText = (o) => (o && Object.keys(o).length) ? Object.entries(o).map(([k, v]) => `${k}: ${v}`).join(" · ") : "";
  const lineKey = (name, o) => name + "|" + JSON.stringify(o || {});
  function addToCart(item) {
    const cart = getCart();
    const ex = cart.find((i) => lineKey(i.name, i.options) === lineKey(item.name, item.options));
    if (ex) ex.qty = (ex.qty || 1) + (item.qty || 1);
    else cart.push({ name: item.name, price: item.price || "", options: item.options || {}, qty: item.qty || 1 });
    saveCart(cart);
  }
  function updateCartBadge() {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const n = cartCount();
    el.textContent = n ? `(${n})` : "";
  }

  // ---------------------------------------------------------------- header
  function categoryMenu() {
    return CATEGORIES.map((c) => {
      const subs = (c.subs && c.subs.length)
        ? `<ul class="submenu">${c.subs.map((s) =>
            `<li><a href="products.html?cat=${enc(c.name)}&sub=${enc(s)}">${esc(s)}</a></li>`).join("")}</ul>`
        : "";
      return `<li><a class="menu-cat" href="products.html?cat=${enc(c.name)}">${esc(c.name)}</a>${subs}</li>`;
    }).join("");
  }
  function navLink(href, label) {
    return `<a href="${href}"${page === href ? ' class="active"' : ""}>${label}</a>`;
  }
  function renderHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;
    host.innerHTML = `
      <header class="topbar" id="topbar">
        <div class="brand"><a href="index.html">Taorluath <span>Store</span></a></div>
        <nav class="nav" id="nav">
          ${navLink("index.html", "Home")}
          <div class="has-menu" id="prodMenu">
            <a href="products.html"${page === "products.html" || page === "product.html" ? ' class="active"' : ""}>Products &#9662;</a>
            <ul class="menu">${categoryMenu()}</ul>
          </div>
          ${navLink("faqs.html", "FAQs")}
          ${navLink("reviews.html", "Reviews")}
          ${navLink("contact.html", "Contact")}
          <a href="cart.html"${page === "cart.html" ? ' class="active"' : ""}>Cart <span id="cart-count" class="cart-badge"></span></a>
        </nav>
        <button class="nav-toggle" id="navToggle" aria-label="Menu">&#9776;</button>
      </header>`;
    const bar = document.getElementById("topbar");
    document.getElementById("navToggle").addEventListener("click", () => bar.classList.toggle("open"));
    const pm = document.getElementById("prodMenu");
    pm.querySelector("a").addEventListener("click", (e) => {
      if (window.matchMedia("(max-width: 860px)").matches) { e.preventDefault(); pm.classList.toggle("open"); }
    });
    updateCartBadge();
  }

  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    host.innerHTML = `
      <footer class="footer">
        <div class="footer-inner">
          <span>Taorluath Store &nbsp;·&nbsp; Ships within Canada.</span>
          <nav>
            <a href="products.html">Products</a> &nbsp;·&nbsp;
            <a href="cart.html">Cart</a> &nbsp;·&nbsp;
            <a href="faqs.html">FAQs</a> &nbsp;·&nbsp;
            <a href="contact.html">Contact</a>
          </nav>
          <span>&copy; ${new Date().getFullYear()}</span>
        </div>
      </footer>`;
  }

  // ------------------------------------------- product card (whole tile = link)
  function card(p) {
    const href = productHref(p);
    const firstImg = (p.images && p.images.length) ? p.images[0] : p.image;
    const media = firstImg
      ? `<div class="p-media"><img src="${esc(firstImg)}" alt="${esc(p.name)}" loading="lazy"></div>`
      : `<div class="p-media p-media--ph">Product photo</div>`;
    return `<a class="product" href="${href}">
      ${media}
      <div class="p-body">
        <h3 class="p-name">${esc(p.name)}</h3>
        ${p.price ? `<p class="p-price">${esc(p.price)}</p>` : ""}
        ${p.description ? `<p class="p-desc">${esc(p.description)}</p>` : ""}
      </div>
    </a>`;
  }
  const emptyState = () =>
    `<p class="empty">No products here yet — add some in <code>catalog.js</code>.</p>`;

  // ------------------------------------------------------------------- home
  function renderHome(root) {
    const cats = CATEGORIES.map((c) => {
      const n = PRODUCTS.filter((p) => p.category === c.name).length;
      return `<a class="cat-card" href="products.html?cat=${enc(c.name)}">
        <span class="cat-card-name">${esc(c.name)}</span>
        <span class="cat-card-count">${n} item${n === 1 ? "" : "s"}</span>
      </a>`;
    }).join("");
    const featured = PRODUCTS.slice(0, 4).map(card).join("");
    root.innerHTML = `
      <section class="hero">
        <h1>Everything for the piper</h1>
        <p>Bagpipes, accessories, maintenance and Highland dress — shipped across Canada.</p>
        <a class="btn btn-lg" href="products.html">Shop all products</a>
      </section>
      <section class="section">
        <h2>Shop by category</h2>
        <div class="cat-grid">${cats}</div>
      </section>
      ${featured ? `<section class="section"><h2>Featured</h2><div class="grid">${featured}</div></section>` : ""}`;
  }

  // ------------------------------------------------------------------- shop
  function sidebar(cat, sub) {
    const catRows = CATEGORIES.map((c) => {
      const subs = c.subs.length
        ? `<div class="side-subs">${c.subs.map((s) =>
            `<a href="products.html?cat=${enc(c.name)}&sub=${enc(s)}" class="${cat === c.name && sub === s ? "active" : ""}">${esc(s)}</a>`).join("")}</div>`
        : "";
      return `<div class="side-cat">
        <a href="products.html?cat=${enc(c.name)}" class="${cat === c.name && !sub ? "active" : ""}">${esc(c.name)}</a>
        ${subs}
      </div>`;
    }).join("");
    return `<aside class="shop-side">
      <a class="side-all ${!cat ? "active" : ""}" href="products.html">All products</a>
      ${catRows}
    </aside>`;
  }

  function renderShop(root) {
    const cat = qp("cat"), sub = qp("sub"), q = qp("q").trim().toLowerCase();
    let items = PRODUCTS.slice();
    if (cat) items = items.filter((p) => p.category === cat);
    if (sub) items = items.filter((p) => p.subcategory === sub);
    if (q) items = items.filter((p) => (p.name || "").toLowerCase().includes(q)
      || (p.description || "").toLowerCase().includes(q));

    const title = q ? `Search: “${qp("q").trim()}”` : (sub ? `${cat} — ${sub}` : (cat || "All products"));
    const catDef = CATEGORIES.find((c) => c.name === cat);

    let grid;
    if (cat && catDef && catDef.subs.length && !sub && !q) {
      grid = catDef.subs.map((s) => {
        const inSub = items.filter((p) => p.subcategory === s);
        return inSub.length ? `<h3 class="grid-subhead">${esc(s)}</h3><div class="grid">${inSub.map(card).join("")}</div>` : "";
      }).join("");
      const noSub = items.filter((p) => !p.subcategory);
      if (noSub.length) grid += `<div class="grid">${noSub.map(card).join("")}</div>`;
      if (!grid) grid = emptyState();
    } else {
      grid = items.length ? `<div class="grid">${items.map(card).join("")}</div>` : emptyState();
    }

    root.innerHTML = `
      <div class="shop">
        ${sidebar(cat, sub)}
        <div class="shop-main">
          <div class="shop-head">
            <h1>${esc(title)} <span style="color:var(--muted);font-size:15px;font-weight:400">(${items.length})</span></h1>
            <input id="shopSearch" class="shop-search" type="search" placeholder="Search products…" value="${esc(qp("q"))}">
          </div>
          ${grid}
        </div>
      </div>`;

    const search = document.getElementById("shopSearch");
    search.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const u = new URL(location.href);
      u.searchParams.delete("cat"); u.searchParams.delete("sub");
      if (search.value.trim()) u.searchParams.set("q", search.value.trim()); else u.searchParams.delete("q");
      location.href = u.toString();
    });
  }

  // ----------------------------------------------------------- product page
  function renderProduct(root) {
    const p = PRODUCTS.find((x) => slug(x.name) === qp("id"));
    if (!p) {
      root.innerHTML = `<div class="prose"><h1>Product not found</h1>
        <p style="color:var(--muted)">That item isn't in the catalogue.</p>
        <p><a class="btn" href="products.html">Back to products</a></p></div>`;
      return;
    }
    const gallery = (p.images && p.images.length) ? p.images.slice() : (p.image ? [p.image] : []);
    const media = gallery.length
      ? `<div class="pdp-media" id="pdp-gallery">
           <img id="pdp-img" src="${esc(gallery[0])}" alt="${esc(p.name)}" title="Click to view full screen">
           ${gallery.length > 1 ? `
             <button class="pdp-arrow prev" data-dir="-1" aria-label="Previous image">&#8249;</button>
             <button class="pdp-arrow next" data-dir="1" aria-label="Next image">&#8250;</button>
             <div class="pdp-dots">${gallery.map((_, i) => `<button class="pdp-dot${i === 0 ? " active" : ""}" data-i="${i}" aria-label="Image ${i + 1}"></button>`).join("")}</div>` : ""}
         </div>`
      : `<div class="pdp-media pdp-media--ph">Product photo<br><small>(add an image in catalog.js)</small></div>`;
    const crumbs = `<nav class="breadcrumb">
      <a href="products.html">Products</a> &rsaquo;
      <a href="products.html?cat=${enc(p.category)}">${esc(p.category)}</a>${p.subcategory
        ? ` &rsaquo; <a href="products.html?cat=${enc(p.category)}&sub=${enc(p.subcategory)}">${esc(p.subcategory)}</a>` : ""}</nav>`;
    const SHADES = (typeof TARTAN_SHADES !== "undefined") ? TARTAN_SHADES : ["Modern", "Ancient", "Weathered"];
    const NO_SHADE = (typeof TARTANS_NO_SHADE !== "undefined") ? TARTANS_NO_SHADE : [];
    // Canadian tartans (named "… Tartan"/"… Canadian …") and listed fashion setts
    // have no shade variation.
    const noShadeTartan = (name) => NO_SHADE.includes(name) || /\btartan$/i.test(name) || /canadian/i.test(name);
    const optSelect = (o, extra) => `
      <label class="option"><span>${esc(o.label)}</span>
        <select data-label="${esc(o.label)}"${extra || ""}>
          ${(o.choices || []).map((c) => { const ch = choiceOf(c); const fee = ch.add ? ` (+$${ch.add.toFixed(2)})` : ""; return `<option value="${esc(ch.name)}" data-add="${ch.add}">${esc(ch.name)}${fee}</option>`; }).join("")}
        </select>
      </label>`;
    // A field can be shown only when a condition on other fields is met, via
    // showIf. Leaf: { option, equals } or { option, notEquals } (each may be an
    // array = OR of values). Combine with { all:[…] } (AND), { any:[…] } (OR),
    // or { not: … }. The whole tree is evaluated in syncConditional().
    const showIfAttrs = (o) => o.showIf ? ` data-showif="${esc(JSON.stringify(o.showIf))}"` : "";
    const optsHtml = (p.options || []).map((o) => {
      let inner;
      if (o.type === "tartan") {
        inner = optSelect(o, ' data-tartan="1"') +
          `<label class="option" data-shade-wrap><span>Weave / shade</span>
            <select data-label="Shade" data-shade>${SHADES.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}</select>
          </label>`;
      } else if (o.type === "text" || o.type === "input") {
        const feeNote = o.add ? ` <span class="opt-fee">+$${(+o.add).toFixed(2)}</span>` : "";
        inner = `
      <label class="option"><span>${esc(o.label)}${feeNote}</span>
        <input class="opt-input" type="text" data-label="${esc(o.label)}" data-add="${o.add || 0}"
               maxlength="${o.maxlength || 80}" placeholder="${esc(o.placeholder || "")}">
      </label>`;
      } else {
        inner = optSelect(o);
      }
      return `<div class="opt-group"${showIfAttrs(o)}>${inner}</div>`;
    }).join("");

    root.innerHTML = `
      <div class="pdp">
        ${media}
        <div class="pdp-info">
          ${crumbs}
          <h1 class="pdp-name">${esc(p.name)}</h1>
          ${p.price ? `<p class="pdp-price" id="pdp-price">${esc(p.price)}</p><p class="pdp-price-note" id="pdp-price-note" style="display:none">Includes option add-ons.</p>` : ""}
          ${p.description ? `<p class="pdp-desc">${esc(p.description)}</p>` : ""}
          ${optsHtml ? `<div class="pdp-options">${optsHtml}</div>` : ""}
          ${p.max === 0
            ? `<div class="pdp-cta"><p class="pdp-oos">Out of stock</p></div>`
            : `<div class="pdp-cta">
                 <div class="pdp-qty">
                   <button type="button" class="qbtn" data-q="-1" aria-label="Decrease quantity">&minus;</button>
                   <input id="pdp-qty" class="pdp-qty-input" type="number" min="1" value="1"${(typeof p.max === "number" && p.max > 0) ? ` max="${p.max}"` : ""} aria-label="Quantity">
                   <button type="button" class="qbtn" data-q="1" aria-label="Increase quantity">+</button>
                 </div>
                 <button class="btn btn-lg" id="addCart">Add to cart</button>
                 <a class="btn enquire" id="viewCart" href="cart.html" style="display:none">View cart &rarr;</a>
               </div>`}
          ${(typeof p.max === "number" && p.max > 0) ? `<p class="pdp-maxnote">Limit ${p.max} per order.</p>` : ""}
          <p class="pdp-added" id="addMsg"></p>
          <p class="pdp-back"><a href="products.html?cat=${enc(p.category)}">&larr; Back to ${esc(p.category)}</a></p>
        </div>
      </div>`;

    // Controls = every dropdown AND custom text input.
    const controls = [...root.querySelectorAll(".option [data-label]")];
    const tartanSel = root.querySelector("select[data-tartan]");
    const shadeSel = root.querySelector("select[data-shade]");
    const shadeWrap = root.querySelector("[data-shade-wrap]");
    function syncShade() {
      if (!tartanSel || !shadeSel) return;
      const off = noShadeTartan(tartanSel.value);
      shadeWrap.style.display = off ? "none" : "";
      shadeSel.disabled = off;              // disabled controls are ignored below
    }
    const controlValue = (c) => c.tagName === "SELECT" ? c.value : c.value.trim();
    const controlAdd = (c) => {
      if (c.disabled) return 0;
      if (c.tagName === "SELECT") { const o = c.options[c.selectedIndex]; return parseFloat(o && o.dataset.add) || 0; }
      return controlValue(c) ? (parseFloat(c.dataset.add) || 0) : 0;   // text fee only when filled in
    };
    const optionAdds = () => controls.reduce((sum, c) => sum + controlAdd(c), 0);
    function refreshPrice() {
      if (!p.price) return;
      const extra = optionAdds();
      document.getElementById("pdp-price").textContent = money(priceNum(p.price) + extra);
      document.getElementById("pdp-price-note").style.display = extra ? "" : "none";
    }
    // Evaluate a showIf condition tree against the fields' current values.
    // Leaf {option, equals|notEquals}; combinators {all:[…]}, {any:[…]}, {not:…}.
    const asArr = (v) => v == null ? [] : (Array.isArray(v) ? v : [v]);
    function evalCond(cond) {
      if (!cond || typeof cond !== "object") return true;
      if (Array.isArray(cond.all)) return cond.all.every(evalCond);
      if (Array.isArray(cond.any)) return cond.any.some(evalCond);
      if ("not" in cond) return !evalCond(cond.not);
      if (cond.option) {
        // The field this depends on must exist and be visible (not disabled).
        const ctrl = controls.find((c) => c.dataset.label === cond.option);
        if (!ctrl || ctrl.disabled) return false;
        const cur = controlValue(ctrl);
        if ("notEquals" in cond) return !asArr(cond.notEquals).map(String).includes(cur);
        return asArr(cond.equals != null ? cond.equals : cond.value).map(String).includes(cur);
      }
      return true;
    }
    // Show/hide `showIf` groups from their condition. Hidden groups' controls are
    // disabled, so they drop out of the price and the cart. Repeats until stable
    // to settle chained conditions (a revealed field controlling another).
    const condGroups = [...root.querySelectorAll(".opt-group[data-showif]")];
    function syncConditional() {
      if (!condGroups.length) return;
      for (let pass = 0; pass <= condGroups.length; pass++) {
        let changed = false;
        condGroups.forEach((g) => {
          let cond = null;
          try { cond = JSON.parse(g.dataset.showif || "null"); } catch { /* ignore */ }
          const show = evalCond(cond);
          if (show === (g.style.display === "none")) changed = true;
          g.style.display = show ? "" : "none";
          g.querySelectorAll("[data-label]").forEach((c) => { c.disabled = !show; });
        });
        if (!changed) break;
      }
    }
    function syncAll() { syncConditional(); syncShade(); refreshPrice(); }
    controls.forEach((c) => c.addEventListener(c.tagName === "INPUT" ? "input" : "change", syncAll));
    syncAll();

    // Quantity: no `max` = unlimited, max > 0 = capped, max === 0 = out of stock.
    const maxQty = (typeof p.max === "number" && p.max > 0) ? p.max : Infinity;
    const qtyInput = document.getElementById("pdp-qty");
    function readQty() {
      if (!qtyInput) return 1;
      let n = parseInt(qtyInput.value, 10);
      if (!Number.isFinite(n) || n < 1) n = 1;
      if (n > maxQty) n = maxQty;
      qtyInput.value = n;
      return n;
    }
    if (qtyInput) {
      root.querySelectorAll(".pdp-qty .qbtn").forEach((b) =>
        b.addEventListener("click", () => { qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + (+b.dataset.q); readQty(); }));
      qtyInput.addEventListener("change", readQty);
    }

    const addBtn = document.getElementById("addCart");
    if (addBtn) addBtn.addEventListener("click", () => {
      const options = {};
      controls.forEach((c) => {
        if (c.disabled) return;
        const v = controlValue(c);
        if (c.tagName === "INPUT" && !v) return;    // don't record an empty text box
        options[c.dataset.label] = v;
      });
      const unit = p.price ? money(priceNum(p.price) + optionAdds()) : "";
      addToCart({ name: p.name, price: unit, options, qty: readQty() });
      document.getElementById("addMsg").textContent = "✓ Added to cart";
      document.getElementById("viewCart").style.display = "";
    });
    document.title = `${p.name} — Taorluath Store`;

    // --- image gallery: arrows, auto-advance (15s), click to full-screen ------
    const galleryEl = document.getElementById("pdp-gallery");
    if (galleryEl && gallery.length) {
      const imgEl = document.getElementById("pdp-img");
      const dots = [...galleryEl.querySelectorAll(".pdp-dot")];
      let gi = 0, timer = null;
      function show(n) {
        gi = (n + gallery.length) % gallery.length;
        imgEl.src = gallery[gi];
        dots.forEach((d, i) => d.classList.toggle("active", i === gi));
      }
      function restart() {
        clearInterval(timer);
        if (gallery.length > 1) timer = setInterval(() => show(gi + 1), 15000);
      }
      galleryEl.querySelectorAll(".pdp-arrow").forEach((b) =>
        b.addEventListener("click", (e) => { e.stopPropagation(); show(gi + (+b.dataset.dir)); restart(); }));
      dots.forEach((d) => d.addEventListener("click", (e) => { e.stopPropagation(); show(+d.dataset.i); restart(); }));

      function openLightbox() {
        const lb = document.createElement("div");
        lb.className = "lightbox";
        lb.innerHTML =
          `<button class="lb-close" aria-label="Close">&times;</button>` +
          (gallery.length > 1 ? `<button class="lb-arrow prev" aria-label="Previous">&#8249;</button><button class="lb-arrow next" aria-label="Next">&#8250;</button>` : "") +
          `<img class="lb-img" src="${esc(gallery[gi])}" alt="${esc(p.name)}">`;
        document.body.appendChild(lb);
        document.body.style.overflow = "hidden";
        clearInterval(timer);                       // pause auto-advance while open
        const lbImg = lb.querySelector(".lb-img");
        const nav = (d) => { show(gi + d); lbImg.src = gallery[gi]; };
        const close = () => { lb.remove(); document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); restart(); };
        lb.querySelector(".lb-close").addEventListener("click", close);
        lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
        lb.querySelectorAll(".lb-arrow").forEach((b) =>
          b.addEventListener("click", (e) => { e.stopPropagation(); nav(b.classList.contains("next") ? 1 : -1); }));
        function onKey(e) {
          if (e.key === "Escape") close();
          else if (e.key === "ArrowRight") nav(1);
          else if (e.key === "ArrowLeft") nav(-1);
        }
        document.addEventListener("keydown", onKey);
      }
      imgEl.addEventListener("click", openLightbox);
      restart();
    }
  }

  // ------------------------------------------------------------------- cart
  function renderCart(root) {
    const cart = getCart();
    if (!cart.length) {
      root.innerHTML = `<div class="page-head"><h1>Your cart</h1></div>
        <div class="prose"><p style="color:var(--muted)">Your cart is empty.</p>
        <p><a class="btn" href="products.html">Browse products</a></p></div>`;
      return;
    }
    const rows = cart.map((it, idx) => {
      const ot = optsText(it.options);
      const line = priceNum(it.price) * (it.qty || 1);
      return `<div class="cart-row" data-idx="${idx}">
        <div class="cart-info">
          <div class="cart-name">${esc(it.name)}</div>
          ${ot ? `<div class="cart-opts">${esc(ot)}</div>` : ""}
          <div class="cart-unit">${esc(it.price || "")}</div>
        </div>
        <div class="cart-qty">
          <button class="qbtn" data-act="dec" aria-label="Decrease">−</button>
          <span>${it.qty || 1}</span>
          <button class="qbtn" data-act="inc" aria-label="Increase">+</button>
        </div>
        <div class="cart-line">${money(line)}</div>
        <button class="cart-remove" data-act="remove">Remove</button>
      </div>`;
    }).join("");
    const subtotal = cart.reduce((s, it) => s + priceNum(it.price) * (it.qty || 1), 0);
    const gst = subtotal * GST_RATE, pst = subtotal * PST_RATE, grand = subtotal + gst + pst;

    root.innerHTML = `
      <div class="page-head"><h1>Your cart</h1><p>Review your items and enter your shipping details, then place your order. No payment is taken yet.</p></div>
      <div class="cart-wrap">
        <div class="cart-list">${rows}</div>
        <aside class="cart-summary">
          <div class="cart-total"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
          <div class="cart-tax"><span>GST (5%)</span><span>${money(gst)}</span></div>
          <div class="cart-tax"><span>PST (7%)</span><span>${money(pst)}</span></div>
          <div class="cart-total cart-grand"><span>Total</span><strong>${money(grand)}</strong></div>
          <p class="cart-note">We email your invoice to you (and a copy to our sales team). <strong>No card is charged yet</strong> — we'll confirm shipping and payment by email. Ships within Canada only.</p>
          <div class="checkout-form">
            <input id="co-company" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">

            <label class="field"><span>Full name *</span><input id="co-name" type="text" autocomplete="name" placeholder="Jane MacLeod"></label>
            <label class="field"><span>Email *</span><input id="co-email" type="email" autocomplete="email" placeholder="you@example.com"></label>
            <label class="field"><span>Address line 1 *</span><input id="co-addr1" type="text" autocomplete="address-line1" placeholder="123 Main St"></label>
            <label class="field"><span>Address line 2</span><input id="co-addr2" type="text" autocomplete="address-line2" placeholder="Apt, unit (optional)"></label>
            <div class="field-row">
              <label class="field"><span>City *</span><input id="co-city" type="text" autocomplete="address-level2" placeholder="Kelowna"></label>
              <label class="field"><span>Province *</span><input id="co-prov" type="text" autocomplete="address-level1" placeholder="BC"></label>
              <label class="field"><span>Postal code *</span><input id="co-postal" type="text" autocomplete="postal-code" placeholder="V1X 7T8"></label>
            </div>
            <label class="field"><span>Phone</span><input id="co-phone" type="tel" autocomplete="tel" placeholder="(250) 000-0000"></label>
          </div>
          <button class="btn btn-lg btn-wide" id="checkout">Place order &amp; email invoice</button>
          <p id="checkout-status" class="checkout-status"></p>
          <button class="cart-clear" id="clear-cart">Clear cart</button>
        </aside>
      </div>`;

    root.querySelector(".cart-list").addEventListener("click", (e) => {
      const act = e.target.dataset.act;
      const row = e.target.closest(".cart-row");
      if (!act || !row) return;
      const idx = +row.dataset.idx;
      const c = getCart();
      if (act === "inc") c[idx].qty = (c[idx].qty || 1) + 1;
      else if (act === "dec") c[idx].qty = Math.max(1, (c[idx].qty || 1) - 1);
      else if (act === "remove") c.splice(idx, 1);
      saveCart(c);
      renderCart(root);
    });
    document.getElementById("clear-cart").addEventListener("click", () => {
      if (confirm("Clear the cart?")) { saveCart([]); renderCart(root); }
    });
    document.getElementById("checkout").addEventListener("click", async () => {
      const status = document.getElementById("checkout-status");
      const btn = document.getElementById("checkout");
      const val = (id) => (document.getElementById(id).value || "").trim();
      const name = val("co-name"), email = val("co-email"), addr1 = val("co-addr1"),
        addr2 = val("co-addr2"), city = val("co-city"), prov = val("co-prov"),
        postal = val("co-postal"), phone = val("co-phone"), company = val("co-company");
      if (!name) { status.textContent = "Please enter your full name."; return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { status.textContent = "Please enter a valid email."; return; }
      if (!addr1 || !city || !prov || !postal) { status.textContent = "Please complete your shipping address (address, city, province, postal code)."; return; }
      const c = getCart();
      if (!c.length) { status.textContent = "Your cart is empty."; return; }

      const order = {
        date: new Date().toLocaleDateString("en-CA"),
        orderId: "TL-" + Date.now().toString().slice(-8),
        name, email, phone, company, // `company` is a honeypot — bots fill it, humans don't
        address: { line1: addr1, line2: addr2, city, province: prov, postal },
        items: c.map((it) => ({ name: it.name, opts: optsText(it.options), unit: priceNum(it.price), qty: it.qty || 1 })),
      };

      btn.disabled = true;
      status.textContent = "Sending your invoice…";
      try {
        const r = await fetch(INVOICE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.ok) throw new Error(data.error || ("Server error " + r.status));
        saveCart([]);
        try { sessionStorage.setItem("tl_last_invoice", data.invoiceNo || ""); } catch { /* ignore */ }
        window.location.href = "thankyou.html";
      } catch (err) {
        btn.disabled = false;
        status.textContent = "Sorry — we couldn't send your invoice (" + err.message + "). Please email " + STORE_EMAIL + " and we'll help.";
      }
    });
  }

  // ------------------------------------------------------------------- init
  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    const home = document.getElementById("home-app");
    const shop = document.getElementById("shop-app");
    const prodPage = document.getElementById("product-app");
    const cartPage = document.getElementById("cart-app");
    if (home) renderHome(home);
    if (shop) renderShop(shop);
    if (prodPage) renderProduct(prodPage);
    if (cartPage) renderCart(cartPage);
  });
})();
