/* ======================================================================
   TAORLUATH STORE — CATALOG   (this is the ONLY file you edit to run the shop)
   ----------------------------------------------------------------------
   Every product automatically gets its OWN page (product.html?id=…) — you
   never create a page by hand. Adding a product is just a block below.

   ➊ ADD A PRODUCT
       Copy any { ... } block inside PRODUCTS and change the fields.
         name        (required)  the product title
         category    (required)  must match a CATEGORIES name below
         price       (required)  any text, e.g. "$1,499.00 CAD"
         subcategory (optional)  only for categories that list `subs`
         image       (optional)  ONE photo, e.g. "images/mccallum.jpg"  ("" = placeholder)
         images      (optional)  MULTIPLE photos as an array -> a gallery on the
                                 product page (arrows, auto-rotate every 15s, click
                                 to view full screen). Overrides `image`. e.g.
                                 images: ["images/x/1.jpg", "images/x/2.jpg"]
         buyUrl      (optional)  a Stripe Payment Link ("" = "Enquire" button)
         description (optional)  a short line of text
         max         (optional)  quantity cap: omit = unlimited, a number = the
                                 most a customer can buy per order, 0 = OUT OF STOCK
                                 (hides Add to cart)
         options     (optional)  CUSTOMISATION DROPDOWNS on the product page.
                                 Each choice is either a plain string (no extra
                                 cost) OR { name: "Silver", add: 120 } to ADD a
                                 fee. The price on the page and in the cart update
                                 live as the customer picks options.
                                   options: [
                                     { label: "Waist size", choices: ["34\"", { name: "44\"", add: 25 }] },
                                     { label: "Mounts",     choices: ["Nickel", { name: "Silver", add: 120 }] }
                                   ]
                                 For a FREE-TEXT box (engraving, a name, notes) use
                                 type: "text":
                                   { label: "Engraving", type: "text",
                                     placeholder: "up to 20 chars", maxlength: 20, add: 10 }
                                 `add` (optional) is charged only when the box is
                                 filled in.
                                 CONDITIONAL FIELDS — show a field only when another
                                 field has a certain value, with `showIf`:
                                   options: [
                                     { label: "Add engraving?", choices: ["No", "Yes"] },
                                     { label: "Engraving text", type: "text", add: 10,
                                       showIf: { option: "Add engraving?", equals: "Yes" } }
                                   ]
                                 `option` is the OTHER field's label; `equals` is the
                                 value (or array of values) that reveals this field.
                                 A hidden field is left out of the price and the cart.

   ➋ ADD A CATEGORY or SUBCATEGORY
       Add it to CATEGORIES (in the order you want it shown). A name in `subs`
       is a subcategory; products point at it with `subcategory`.
   ====================================================================== */

const CATEGORIES = [
  // Bagpipe brands are set up as (currently empty) subcategories — add your
  // pipe models under a brand with subcategory: "McCallum Deluxe Bagpipes" etc.
  { name: "Bagpipes",             subs: ["McCallum Deluxe Bagpipes", "Dunbar Bagpipes"] },
  { name: "Bagpipe Accessories",  subs: ["Bags", "Bag Covers", "Drone Cords"] },
  { name: "Bagpipe Maintenance",  subs: [] },
  { name: "Practice Chanters",    subs: [] },
  { name: "Kilts",                subs: [] },
  { name: "Kilt Accessories",     subs: ["Sporrans", "Hoses & Flashes", "Headwear", "Footwear", "Clan Items"] },
];

/* Shared clan / tartan list used by every "Tartan" dropdown. Add or remove
   clans here once and every kilt & tartan item updates. Reference it in a
   product with:  options: [ { label: "Tartan", choices: TARTANS } ] */
const TARTANS = [
  "Anderson", "Armstrong", "Baird", "Barclay", "Black Watch", "Boyd",
  "Brodie", "Bruce", "Buchanan", "Caledonia", "Cameron", "Cameron of Erracht",
  "Cameron of Lochiel", "Campbell", "Campbell of Argyll", "Campbell of Breadalbane",
  "Campbell of Cawdor", "Carnegie", "Chisholm", "Clark", "Cochrane", "Colquhoun",
  "Crawford", "Cumming", "Cunningham", "Dalziel", "Davidson", "Douglas", "Drummond",
  "Dunbar", "Duncan", "Dundas", "Elliot", "Erskine", "Farquharson", "Ferguson",
  "Fletcher", "Flower of Scotland", "Forbes", "Forsyth", "Fraser", "Fraser of Lovat",
  "Gordon", "Graham", "Graham of Montrose", "Grant", "Gunn", "Guthrie", "Hamilton",
  "Hannay", "Hay", "Henderson", "Home", "Hunter", "Innes", "Irvine", "Isle of Skye",
  "Jacobite", "Jardine", "Johnstone", "Keith", "Kennedy", "Kerr", "Kincaid", "Lamont",
  "Leslie", "Lindsay", "Livingstone", "Logan", "Lumsden", "MacAlister", "MacArthur",
  "MacAulay", "MacBean", "MacBeth", "MacCallum", "MacDonald", "MacDonald of Clanranald",
  "MacDonald of Sleat", "MacDonell of Glengarry", "MacDonell of Keppoch", "MacDougall",
  "MacDuff", "MacEwen", "MacFarlane", "MacFie", "MacGillivray", "MacGregor",
  "MacInnes", "MacIntyre", "MacIver", "MacKay", "MacKenzie", "MacKinnon", "Mackintosh",
  "MacLachlan", "MacLaren", "MacLean", "MacLean of Duart", "MacLennan", "MacLeod",
  "MacLeod of Harris", "MacLeod of Lewis", "MacMillan", "MacNab", "MacNaughton",
  "MacNeil", "MacNeil of Barra", "MacPherson", "MacQuarrie", "MacRae", "MacTavish",
  "MacThomas", "Malcolm", "Matheson", "Maxwell", "Menzies", "Moffat", "Montgomery",
  "Morrison", "Muir", "Munro", "Murray", "Murray of Atholl", "Napier", "Nicolson",
  "Ogilvie", "Oliphant", "Pride of Scotland", "Ramsay", "Robertson", "Rollo", "Rose",
  "Ross", "Royal Stewart", "Ruthven", "Scott", "Scrymgeour", "Seton", "Shaw",
  "Sinclair", "Skene", "Spirit of Scotland", "Stewart", "Stewart of Appin",
  "Sutherland", "Urquhart", "Wallace", "Wemyss", {name: "Royal Canadian Air Force", add: 35},
  {name: "Alberta Tartan", add: 25}, {name: "British Columbia Tartan", add: 25},
  {name: "Manitoba Tartan", add: 25}, {name: "New Brunswick Tartan", add: 25}, 
  {name: "Nova Scotia Tartan", add: 25},  {name: "Newfoundland and Labrador Tartan", add: 25},
  {name: "Ontario Tartan", add: 25}, {name: "Prince Edward Island Tartan", add: 25},
  {name: "Quebec Tartan", add: 25}, {name: "Saskatchewan Tartan", add: 25},
  {name: "Maple Leaf Tartan", add: 35},
];

const CLANS = [
  "Anderson", "Armstrong", "Baird", "Barclay", "Boyd",
  "Brodie", "Bruce", "Buchanan", "Caledonia", "Cameron", "Cameron of Erracht",
  "Cameron of Lochiel", "Campbell", "Campbell of Argyll", "Campbell of Breadalbane",
  "Campbell of Cawdor", "Carnegie", "Chisholm", "Clark", "Cochrane", "Colquhoun",
  "Crawford", "Cumming", "Cunningham", "Dalziel", "Davidson", "Douglas", "Drummond",
  "Dunbar", "Duncan", "Dundas", "Elliot", "Erskine", "Farquharson", "Ferguson",
  "Fletcher", "Forbes", "Forsyth", "Fraser", "Fraser of Lovat",
  "Gordon", "Graham", "Graham of Montrose", "Grant", "Gunn", "Guthrie", "Hamilton",
  "Hannay", "Hay", "Henderson", "Home", "Hunter", "Innes", "Irvine",
  "Jardine", "Johnstone", "Keith", "Kennedy", "Kerr", "Kincaid", "Lamont",
  "Leslie", "Lindsay", "Livingstone", "Logan", "Lumsden", "MacAlister", "MacArthur",
  "MacAulay", "MacBean", "MacBeth", "MacCallum", "MacDonald", "MacDonald of Clanranald",
  "MacDonald of Sleat", "MacDonell of Glengarry", "MacDonell of Keppoch", "MacDougall",
  "MacDuff", "MacEwen", "MacFarlane", "MacFie", "MacGillivray", "MacGregor",
  "MacInnes", "MacIntyre", "MacIver", "MacKay", "MacKenzie", "MacKinnon", "Mackintosh",
  "MacLachlan", "MacLaren", "MacLean", "MacLean of Duart", "MacLennan", "MacLeod",
  "MacLeod of Harris", "MacLeod of Lewis", "MacMillan", "MacNab", "MacNaughton",
  "MacNeil", "MacNeil of Barra", "MacPherson", "MacQuarrie", "MacRae", "MacTavish",
  "MacThomas", "Malcolm", "Matheson", "Maxwell", "Menzies", "Moffat", "Montgomery",
  "Morrison", "Muir", "Munro", "Murray", "Murray of Atholl", "Napier", "Nicolson",
  "Ogilvie", "Oliphant", "Ramsay", "Robertson", "Rollo", "Rose", "Ross", "Ruthven",
  "Scott", "Scrymgeour", "Seton", "Shaw", "Sinclair", "Skene", "Stewart",
  "Stewart of Appin", "Sutherland", "Urquhart", "Wallace", "Wemyss",
  {name: "Royal Canadian Air Force", add: 35}, {name: "Canadian", add: 35}
];

/* Shade (weave) variations apply to most clan setts. Write a tartan option as
   { label: "Tartan", type: "tartan", choices: TARTANS } and a linked
   "Weave / shade" dropdown (below) appears next to it. It AUTO-HIDES when the
   chosen tartan is Canadian (any "… Tartan" name, or "… Canadian …") or a
   single-colourway fashion sett listed in TARTANS_NO_SHADE. */
const TARTAN_SHADES = ["Modern", "Ancient", "Weathered", "Muted", "Hunting", "Dress"];
const TARTANS_NO_SHADE = [
  "Caledonia", "Flower of Scotland", "Isle of Skye", "Jacobite",
  "Pride of Scotland", "Spirit of Scotland", "Black Watch", "Royal Stewart", "Royal Canadian Air Force",
  "Alberta Tartan", "British Columbia Tartan", "Manitoba Tartan", "New Brunswick Tartan",
  "Nova Scotia Tartan", "Newfoundland and Labrador Tartan", "Ontario Tartan",
  "Prince Edward Island Tartan", "Quebec Tartan", "Saskatchewan Tartan", "Maple Leaf Tartan"
];

const PRODUCTS = [
  // ---------------- Bagpipes (brands are subcategories; no products yet) ------
  // Add a bagpipe under a brand like this:
  { name: "McCallum Poly P0 Bagpipes", category: "Bagpipes", subcategory: "McCallum Deluxe Bagpipes",
    price: "$989.99 CAD", image: "images/mccallum/p0.png", buyUrl: "",
    description: "A plain-turned, entry-level model with simple imitation ivory accents designed for maximum affordability and durability.",
    options: [
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  { name: "McCallum Poly P1 Bagpipes", category: "Bagpipes", subcategory: "McCallum Deluxe Bagpipes",
    price: "$1,075.99 CAD", image: "images/mccallum/p1.png", buyUrl: "",
    description: "A plain-turned, entry-level model with simple imitation ivory accents designed for maximum affordability and durability.",
    options: [
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  { name: "McCallum Poly P2 Bagpipes", category: "Bagpipes", subcategory: "McCallum Deluxe Bagpipes",
    price: "$1,149.99 CAD", image: "images/mccallum/p2.png", buyUrl: "",
    description: "A plain-turned, entry-level model with simple imitation ivory accents designed for maximum affordability and durability.",
    options: [
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  { name: "McCallum Poly P3 Bagpipes", category: "Bagpipes", subcategory: "McCallum Deluxe Bagpipes",
    price: "$1,095.99 CAD", image: "images/mccallum/p3.png", buyUrl: "",
    description: "A plain-turned, entry-level model with simple imitation ivory accents designed for maximum affordability and durability.", 
    options: [
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  { name: "McCallum Poly P4 (Engraved) Bagpipes", category: "Bagpipes", subcategory: "McCallum Deluxe Bagpipes",
    price: "$1,699.99 CAD", image: "images/mccallum/p4.png", buyUrl: "",
    description: "A plain-turned, entry-level model with simple imitation ivory accents designed for maximum affordability and durability.", 
    options: [
      { label: "Engraving", choices: ["None",  { name: "Celtic Knot", add: 89.99 }, { name: "Thistle", add: 89.99 }, { name: "Victorian", add: 89.99 }, { name: "Zoomorphic", add: 89.99 } ] },
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  // ---------------- DUNBAR BAGPIPES ----------------

  { name: "Dunbar African Blackwood DB1 Bagpipes", category: "Bagpipes", subcategory: "Dunbar Bagpipes",
    price: "$1,849.99 CAD", image: "images/dunbar/db1.png", buyUrl: "",
    description: "Plain-turned African Blackwood with button mounts — understated and traditional.",
    options: [
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  { name: "Dunbar African Blackwood DB2 Bagpipes", category: "Bagpipes", subcategory: "Dunbar Bagpipes",
    price: "$2,199.99 CAD", image: "images/dunbar/db2.png", buyUrl: "",
    description: "Fully combed and beaded with a mix of alloy and imitation ivory mounts.",
    options: [
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  { name: "Dunbar African Blackwood DB3 Bagpipes", category: "Bagpipes", subcategory: "Dunbar Bagpipes",
    price: "$2,099.99 CAD", image: "images/dunbar/db3.png", buyUrl: "",
    description: "A uniform imitation ivory-mounted set with fully combed and beaded drones.",
    options: [
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  { name: "Dunbar African Blackwood DB4 Bagpipes", category: "Bagpipes", subcategory: "Dunbar Bagpipes",
    price: "$2,499.99 CAD", image: "images/dunbar/db4.png", buyUrl: "",
    description: "Blackwood tone paired with full engraved alloy mounts for prestige and durability.",
    options: [
      { label: "Bag Type", choices: ["None", { name: "Bannatyne Synthetic Bag", add: 149.99 }, { name: "Bannatyne Synthetic Hide Bag", add: 169.99 }, { name: "Bannatyne Synthetic Hide Bag (W.M.C)", add: 189.99 },] },
      { label: "Bag Size", choices: ["Small", "Extended Small", "Medium", "Large"], showIf: { option: "Bag Type", notEquals: ["None", "Bannatyne Synthetic Hide Bag (W.M.C)"] } },
      { label: "Bag Cover", choices: ["None", { name: "Navy with Silver Trim", add: 59.99 }, { name: "Navy with Navy Trim", add: 59.99 }, { name: "Green with Silver Trim", add: 59.99 }, { name: "Black with Silver Trim", add: 59.99 }] },
      { label: "Drone Cords", choices: ["None", { name: "Red", add: 39 }, { name: "Blue", add: 39 }, { name: "Green", add: 39 }, { name: "Black", add: 39 }, { name: "White", add: 39 }, { name: "Silver", add: 44 }, { name: "Gold", add: 49 }] },
      { label: "Drone Reeds", choices: ["None", { name: "Ezeedrone™ Bagpipe Drone Reeds", add: 135 }, { name: "Kinnaird Carbon Fibre Drone Reeds", add: 145 }] },
      { label: "Chanter", choices: ["None", { name: "McCallum Poly Ceòl Chanter", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Bb)", add: 269 }, { name: "McCallum Poly Ceòl Chanter (Key of A)", add: 269 }, { name: "McCallum Blackwood Ceòl Chanter", add: 589 },] },
      { label: "Chanter Reed", choices: ["None", { name: "Chesney Bagpipe Reed", add: 28.99 }, { name: "EzeePC™ Bagpipe Reed", add: 28.99 }, { name: "Broadley Bagpipe Reed", add: 28.99 }]},
      { label: "Reed Strength", choices: ["Easy", "Easy+", "Medium", "Medium+", "Hard", "Hard+"], showIf: { option: "Chanter Reed", notEquals: "None" } },
    ]
  },

  // ---------------- Bagpipe Accessories > Bags ----------------
  { name: "Bannatyne Synthetic Bags", category: "Bagpipe Accessories", subcategory: "Bags",
    price: "$149.00 CAD", image: "images/bags/synth.png", buyUrl: "",
    description: "Zip-in synthetic bag with moisture control.",
    options: [ { label: "Size", choices: ["Small", "Extended Small", "Medium", "Large"] } ] },

  { name: "Bannatyne Synthetic Hide Bags", category: "Bagpipe Accessories", subcategory: "Bags",
    price: "$169.00 CAD", image: "images/bags/hide.png", buyUrl: "",
    description: "Synthetic hide feel with a secure seal.",
    options: [ { label: "Size", choices: ["Small", "Extended Small", "Medium", { name: "Willie McCallum", add: 20 }, "Large"] } ] },

  // ---------------- Bagpipe Accessories > Bag Covers ----------------
  { name: "Weather Restistant Contour Bag Cover", category: "Bagpipe Accessories", subcategory: "Bag Covers",
    price: "$189.00 CAD", images: ["images/bag_covers/all.png", "images/bag_covers/black.png", "images/bag_covers/green.png", "images/bag_covers/navy1.png", "images/bag_covers/navy2.png"], buyUrl: "",
    description: "Fringed velvet cover to dress your bag.",
    options: [
      { label: "Colour", choices: ["Navy with Silver Trim", "Navy with Navy Trim", "Green with Silver Trim", "Black with Silver Trim"] },
      { label: "Size", choices: ["Small", "Extended Small", "Medium", { name: "Extended Medium", add: 10 }, "Large"] } ] },

  // ---------------- Bagpipe Accessories > Drone Cords ----------------
  { name: "Silk Drone Cords", category: "Bagpipe Accessories", subcategory: "Drone Cords",
    price: "$39.00 CAD", images: ["images/drone_cords/all.png", "images/drone_cords/navy.png", "images/drone_cords/green.png", "images/drone_cords/gold.png", "images/drone_cords/red.png", "images/drone_cords/black.png", "images/drone_cords/silver.png", "images/drone_cords/white.png"], buyUrl: "",
    description: "Traditional silk cords to dress your drones.",
    options: [ { label: "Colour", choices: ["Red", "Navy", "Green", "Black", "White", { name: "Silver", add: 5 }, { name: "Gold", add: 10 }] } ] },

  // ---------------- Bagpipe Maintenance ----------------
  { name: "Plain Yellow Hemp", category: "Bagpipe Maintenance", price: "$11.50 CAD",
    image: "images/accessories/yellow_hemp.png", buyUrl: "", description: "Plain yellow hemp for a snug joint seal." },

  { name: "Waxed Yellow Hemp", category: "Bagpipe Maintenance", price: "$16.50 CAD",
    image: "images/accessories/yellow_hemp.png", buyUrl: "", description: "Waxed yellow hemp for a snug joint seal." },

  { name: "Black Waxed Hemp", category: "Bagpipe Maintenance", price: "$17.50 CAD",
    image: "images/accessories/black_hemp.png", buyUrl: "", description: "Black waxed hemp for reeds and joints." },

  { name: "Airtight Bag Seasoning", category: "Bagpipe Maintenance", price: "$22.00 CAD",
    image: "images/accessories/season.png", buyUrl: "", description: "Seasoning for maintaining the airtightness of your bag." },

  { name: "Chanter Tape", category: "Bagpipe Maintenance", price: "$15.00 CAD",
    image: "images/accessories/chanter_tape.png", buyUrl: "", description: "Change and modify the pitch of your notes with this tape." },

  { name: "Stock Stoppers", category: "Bagpipe Maintenance", price: "$7.50 CAD",
    image: "images/accessories/stk_stop.png", buyUrl: "", description: "Test the airtightness of your bag by plugging the stocks with these stoppers. (5pk)" },

  { name: "Drone Plugs", category: "Bagpipe Maintenance", price: "$4.50 CAD",
    image: "images/accessories/drn_stop.png", buyUrl: "", description: "Stop your drones from making noise with these drone stoppers. (3pk)" },

  { name: "Blowpipe Protectors", category: "Bagpipe Maintenance", price: "$4.50 CAD",
    image: "images/accessories/mouth_prt.png", buyUrl: "", description: "Protect the mouthpiece of your blowpipe with these rubber protectors. (2pk)" },
  
  { name: "Flapper Valve", category: "Bagpipe Maintenance", price: "$4.50 CAD",
    image: "images/accessories/flp_valve.png", buyUrl: "", description: "Prevent backflow of air from your blowpipe with this rubber flapper valve." },

  { name: "Reed Elastics", category: "Bagpipe Maintenance", price: "$3.50 CAD",
    image: "images/accessories/rbr_band.png", buyUrl: "", description: "Elastic bands for changing the tone and weight of chanter reeds." },
      
  { name: "Bagpipe Beeswax", category: "Bagpipe Maintenance", price: "$3.50 CAD",
    image: "images/accessories/bgpip_wax.png", buyUrl: "", description: "Beeswax for waterproofing and adding tackiness to yellow hemp." },

  { name: "Cobbler's Wax", category: "Bagpipe Maintenance", price: "$4.50 CAD",
    image: "images/accessories/bgpip_wax_black.png", buyUrl: "", description: "Beeswax for waterproofing and adding tackiness to black hemp." },

  // ---------------- Practice Chanters ----------------
  { name: "McCallum Short Practice Chanter (PC1)", category: "Practice Chanters", price: "$89.00 CAD",
    image: "images/practice_chanters/pc1.png", buyUrl: "", description: "A short (16.5\") practice chanter designed for ages 9 and under."},

  { name: "McCallum Short Coloured Practice Chanter (PC1)", category: "Practice Chanters", price: "$99.00 CAD",
    images: ["images/practice_chanters/pc1_a.png", "images/practice_chanters/pc1_b.png", "images/practice_chanters/pc1_c.png", "images/practice_chanters/pc1_d.png"], buyUrl: "", description: "A short (16.5\") coloured practice chanter designed for ages 9 and under.",
    options: [ { label: "Colour", choices: ["Red", "Blue", "Green"] } ] },

  { name: "McCallum Standard Practice Chanter (PC2)", category: "Practice Chanters", price: "$109.00 CAD",
    image: "images/practice_chanters/pc2.png", buyUrl: "", description: "A standard (18.5\") practice chanter designed for anyone to use."},

  { name: "McCallum Standard Footed Practice Chanter (PC3)", category: "Practice Chanters", price: "$119.00 CAD",
    image: "images/practice_chanters/pc3.png", buyUrl: "", description: "A standard (18.5\") practice chanter with a foot designed for anyone to use."},

  { name: "McCallum Long Practice Chanter (PC4)", category: "Practice Chanters", price: "$129.00 CAD",
    image: "images/practice_chanters/pc4.png", buyUrl: "", description: "A long andard (22\") practice chanter with wider finger spacing designed for ages 10 and up."},

  { name: "McCallum Long Footed Practice Chanter (PC5)", category: "Practice Chanters", price: "$149.00 CAD",
    image: "images/practice_chanters/pc5.png", buyUrl: "", description: "A long (22\") practice chanter with wider finger spacing and a footed design."},

  { name: "McCallum Long Footed Practice Chanter (PC6)", category: "Practice Chanters", price: "$239.00 CAD",
    image: "images/practice_chanters/pc6.png", buyUrl: "", description: "A standard (18.5\") practice chanter with wider finger spacing, African blackwood and a footed design."},
  
  { name: "Dunbar Poly Long Practice Chanter", category: "Practice Chanters", price: "$121.00 CAD",
    image: "images/practice_chanters/dbpc1.png", buyUrl: "", description: "A standard (21.75\") practice chanter with wider finger spacing."},

  { name: "Dunbar Child's Length Practice Chanter", category: "Practice Chanters", price: "$80.00 CAD",
    image: "images/practice_chanters/dbpc2.png", buyUrl: "", description: "A standard (15.25\") practice chanter with wider finger spacing."},

  { name: "Dunbar Deluxe African Blackwood Practice Chanter", category: "Practice Chanters", price: "$295.00 CAD",
    image: "images/practice_chanters/dbpc3.png", buyUrl: "", description: "A standard practice chanter with African blackwood and wider finger spacing."},

  // ---------------- Kilts ----------------
  { name: "5yrd Kilts", category: "Kilts", price: "$249.00 CAD",
    image: "", buyUrl: "", description: "5-yard kilt, made to your size and tartan.",
    options: [
      { label: "Waist size", choices: ["28\"", "30\"", "32\"", "34\"", "36\"", "38\"", "40\"", { name: "42\"", add: 15 }, { name: "44\"", add: 15 }] },
      { label: "Kilt height (inches, knee to waist)", choices: ["20\"", "21\"", "22\"", "23\"", "24\"", "25\"", "26\"", "27\"", "28\"", "29\"", "30\""] },
      { label: "Tartan", type: "tartan", choices: TARTANS },
    ] },
  { name: "8yrd Kilts", category: "Kilts", price: "$399.00 CAD",
    image: "", buyUrl: "", description: "Traditional 8-yard kilt, fully pleated to your size.",
    options: [
      { label: "Waist size", choices: ["28\"", "30\"", "32\"", "34\"", "36\"", "38\"", "40\"", { name: "42\"", add: 15 }, { name: "44\"", add: 15 }] },
      { label: "Kilt height (inches, knee to waist)", choices: ["20\"", "21\"", "22\"", "23\"", "24\"", "25\"", "26\"", "27\"", "28\"", "29\"", "30\""] },
      { label: "Tartan", type: "tartan", choices: TARTANS },
    ] },
  { name: "Scottish Greatkilts", category: "Kilts", price: "$299.00 CAD",
    image: "", buyUrl: "", description: "Great kilt (feileadh mòr) for historical wear.",
    options: [
      { label: "Kilt height (inches, knee to waist)", choices: ["20\"", "21\"", "22\"", "23\"", "24\"", "25\"", "26\"", "27\"", "28\"", "29\"", "30\""] },
      { label: "Tartan", type: "tartan", choices: TARTANS } ] },

  // ---------------- Kilt Accessories ----------------
  { name: "Glengarrys", category: "Kilt Accessories", subcategory: "Headwear", price: "$49.00 CAD",
    images: ["images/headwear/glen_rwb.png", "images/headwear/glen_bw.png", "images/headwear/glen_black_r.png", "images/headwear/glen_n.png"], buyUrl: "", description: "Wool Glengarry bonnet.",
    options: [
      { label: "Size", choices: ["54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64"] }, 
      { label: "Pattern", choices: ["Red-White-Black Checkard", {name: "White-Black Checkard", add: 10}, "Black with Red Toorie", {name: "Navy", add: 10}] }
    ] },

  { name: "Balmorals", category: "Kilt Accessories", subcategory: "Headwear", price: "$99.00 CAD",
    images: ["images/headwear/bal_red-dice.png", "images/headwear/bal_blk-dice.png"], buyUrl: "", description: "Wool Balmoral bonnet.",
    options: [
      { label: "Size", choices: ["54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64"] }, 
      { label: "Pattern", choices: ["Red Diced", "Black Diced"] }
    ] },

  { name: "Harris Tweed Cap (NAVY)", category: "Kilt Accessories", subcategory: "Headwear", price: "$69.00 CAD",
    image: "images/headwear/harris_tweed_navy.png", buyUrl: "", description: "Tweed plain cap. One size fits all.", },

  { name: "Economy Leather Sporran", category: "Kilt Accessories", subcategory: "Sporrans", price: "$59.00 CAD",
    images: ["images/sporrans/econ_brn_leather.png", "images/sporrans/econ_blk_leather.png", "images/sporrans/brn_twd.png"], buyUrl: "", description: "A simple, plain leather sporran. Comes with a waistband.",
    options: [
      { label: "Colour", choices: ["Brown", "Black", {name: "Brown Tooled, Tweed", add: 250}] },
      { label: "Waist Size (in Inches)", type: "text", placeholder: "e.g. 38", maxlength: 2, },
    ] },

  { name: "Dress Celtic Sporran", category: "Kilt Accessories", subcategory: "Sporrans", price: "$169.00 CAD",
    images: ["images/sporrans/drs_blk_celt.png", "images/sporrans/drs_brn_celt.png"], buyUrl: "", description: "A very elegant sporran for formal occasions. Comes with a waistband.",
    options: [ 
      { label: "Colour", choices: ["Brown", "Black"] },
      { label: "Waist Size (in Inches)", type: "text", placeholder: "e.g. 38", maxlength: 2, },
    ] },

  { name: "Dress Bovine Sporran", category: "Kilt Accessories", subcategory: "Sporrans", price: "$199.00 CAD",
    image: "images/sporrans/drs_bvn.png", buyUrl: "", description: "A more \"heritage\" sporran for people who like traditional styles. Comes with a waistband.",
    options: [ { label: "Waist Size (in Inches)", type: "text", placeholder: "e.g. 38", maxlength: 2, } ] },

  { name: "Vintage Small Horsehair Sporran", category: "Kilt Accessories", subcategory: "Sporrans", price: "$199.00 CAD",
    image: "images/sporrans/vntg_sml_hair.png", buyUrl: "", description: "A more \"heritage\" sporran for people who like traditional styles. Comes with a waistband.",
    options: [ { label: "Waist Size (in Inches)", type: "text", placeholder: "e.g. 38", maxlength: 2, } ] },

  { name: "Economy Horsehair Sporran", category: "Kilt Accessories", subcategory: "Sporrans", price: "$299.00 CAD",
    image: "images/sporrans/econ_hair.png", buyUrl: "", description: "A more \"heritage\" sporran for people who like traditional styles. Comes with a waistband.",
    options: [ { label: "Waist Size (in Inches)", type: "text", placeholder: "e.g. 38", maxlength: 2, } ] },

  { name: "Dress Saltire (Scottish Flag) Sporran", category: "Kilt Accessories", subcategory: "Sporrans", price: "$149.00 CAD",
    image: "images/sporrans/drs_slt_flg-sc.png", buyUrl: "", description: "A more \"heritage\" sporran for people who like traditional styles. Comes with a waistband.",
    options: [ { label: "Waist Size (in Inches)", type: "text", placeholder: "e.g. 38", maxlength: 2, } ] },

  { name: "Kilt Hoses", category: "Kilt Accessories", subcategory: "Hoses & Flashes", price: "$29.00 CAD",
    images: ["images/hoses/all.png", "images/hoses/cream.png", "images/hoses/charcoal.png", "images/hoses/black.png", "images/hoses/bottle_green.png", "images/hoses/lovat_green.png", "images/hoses/lovat_blue.png", "images/hoses/navy.png"], buyUrl: "", description: "Full-length kilt hose.",
    options: [
      { label: "Colour", choices: ["Cream", "Charcoal", "Black", "Bottle Green", "Lovat Green", "Lovat Blue", "Navy"] },
      { label: "Size", choices: ["Small (6-9)", "Medium (10-12)", "Large (13-15)"] },
    ] },

  { name: "Kilt Hose Flashes (Tartan)", category: "Kilt Accessories", subcategory: "Hoses & Flashes", price: "$89.00 CAD",
    image: "images/flashes/tartan.png", buyUrl: "", description: "Tartan garter flashes to match your kilt.",
    options: [ { label: "Tartan", type: "tartan", choices: CLANS } ] },

  { name: "Kilt Hose Flashes (Solid)", category: "Kilt Accessories", subcategory: "Hoses & Flashes", price: "$29.00 CAD",
    images: ["images/flashes/all.png", "images/flashes/black.png", "images/flashes/red.png", "images/flashes/navy.png", "images/flashes/green.png",], buyUrl: "", description: "Solid-colour garter flashes.",
    options: [ { label: "Colour", choices: ["Black", "Red", "Navy", "Green"] } ] },

  { name: "Clan Kilt Pins", category: "Kilt Accessories", subcategory: "Clan Items", price: "$21.00 CAD",
    images: ["images/kilt_pins/scottish.png", "images/kilt_pins/canada.png"], buyUrl: "", description: "Decorative kilt pin." ,
    options: [ { label: "Clan", choices: CLANS } ] },

  { name: "Glengarry pins", category: "Kilt Accessories", subcategory: "Clan Items", price: "$28.00 CAD",
    image: "images/headwear/pin.png", buyUrl: "", description: "Cap badge / Glengarry pin.",
    options: [ { label: "Clan", choices: CLANS }, ] },
]
