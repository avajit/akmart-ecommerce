You are working on AkMart, a Nepal-based multi-vendor e-commerce site
(React + Tailwind frontend, Node/Express + MongoDB/Mongoose backend).
Inspect the existing code first and keep my current folder structure, naming
and libraries where possible. Work in the phases below, in order, and after
each phase summarise what changed and wait for me to review before the next.
Before editing, list the files you plan to touch.

GOAL
A minimal, premium, top-class marketplace UI like Myntra/Amazon/Flipkart in
functionality but much cleaner in design. All categories, products, filters,
navigation and search must come from the database through the backend. Nothing
hardcoded in the frontend. Sellers add products and an admin approves them.

=====================================================================
PHASE 0 - DESIGN SYSTEM
=====================================================================
- Palette: black/#0D0D0D background, white text, grey secondary text.
  ONE accent colour: orange (matches the logo). Use it only for the primary
  button, active link, badges and focus rings. Remove emerald/amber/indigo.
- Fonts: one display font for headings (keep the current bold condensed
  style), Poppins for body. Body text minimum 14px. Small labels may be
  uppercase with wide tracking.
- Define colours/spacing as Tailwind theme tokens or CSS variables.
- Use a transparent logo (no grey box behind it).
- Accessibility: visible focus rings, aria-labels on icon buttons, labels
  linked to inputs, good contrast (no tiny light-grey text).
- No fake stats (no "20,000+ shoppers", fake ratings).

=====================================================================
PHASE 1 - LOGIN / REGISTER REFINEMENT
=====================================================================
- Routes: /login and /register (separate routes, not one URL with state).
  Keep the Sign In / Create Account tab switcher but make it use links.
- Make the card match the dark site theme (dark card, thin border) with the
  inputs in bg-white/5 border-white/10 and orange focus rings.
- Left panel: transparent logo, one headline, one sentence, 3 plain
  icon+text lines (no boxed cards). Hide on mobile but show a short tagline.
- Remove prefilled credentials (admin@akmart.com / Admin@123) and make sure
  nothing is hardcoded. Set correct autoComplete values
  (name, username, new-password, current-password), id/name and htmlFor.
- Register form: Full Name, Email or Mobile (detect which one it is and
  validate; Nepal numbers 98XXXXXXXX), Password + Confirm Password side by
  side on desktop, show/hide toggle, strength bar only after typing starts,
  Buyer/Supplier toggle with one short line each (Supplier needs approval),
  Terms/Privacy checkbox, loading spinner on submit, inline errors under each
  field (aria-invalid/aria-describedby), Google button at the top.
- Login form: Email/Mobile, Password with show/hide, Remember me,
  Forgot password link, generic error ("Invalid email or password").
- Role radios must show a focus ring for keyboard users.
- Hide the full footer on auth pages (tiny copyright only).
- Backend: only allow roles buyer and seller on registration; never accept
  "admin" from the client. Rate-limit login attempts.

=====================================================================
PHASE 2 - NAVBAR
=====================================================================
- Sticky, backdrop blur, thin bottom border, same max-w-7xl container as the
  page sections so the edges align.
- Left: logo. Centre: top-level departments loaded from
  GET /api/categories/tree (show the first 6-7, rest under "More").
  Active link = orange underline.
- Hover on a department opens a MEGA MENU: columns of subcategories with
  their children listed underneath (data from the tree), optional promo image.
- Desktop: pill-shaped search bar ("Search essentials, brands...") with live
  suggestions dropdown (products, brands, categories, recent and trending
  searches when empty). Mobile: search icon that opens a full-width search.
- Right: Profile (dropdown: logged out = Login / Sign up; buyer = My Orders,
  Wishlist, Logout; seller = Seller Dashboard, Logout; admin = Admin
  Dashboard), Wishlist, Cart. Each with a small label and an orange count
  badge (show badge only when count > 0).
- Mobile: hamburger opens a side drawer with an accordion of departments →
  subcategories, plus login/profile links.
- Cache the category tree on the client (react-query or similar).

=====================================================================
PHASE 3 - HOME PAGE (max 5 sections, minimal)
=====================================================================
1. Hero: keep the Kids Wear hero; make hero content configurable later.
2. Shop by Category: 4-8 large editorial image tiles from categories with
   isFeatured=true (image, name, hover zoom, subtle overlay).
3. Featured/Trending products: 4-column grid, "View all" link.
4. Trust strip: 3 items (Delivery, Authentic products, Secure payment) with
   thin dividers, no coloured boxes.
5. Slim footer (company, delivery, privacy, contact). Use a Nepal phone
   number/email, not +1.

Product card (reusable component):
- 4:5 image with soft grey placeholder while loading; optional second image
  on hover.
- Brand (small uppercase grey), product name (single line, truncated),
  price bold, MRP struck through, discount % in the accent colour.
- Wishlist heart appears on hover (always visible on mobile).
- Rating pill only when ratingCount > 0.
- Skeleton loading cards and a proper empty state.
- Don't add quick filter pills on the home page.

=====================================================================
PHASE 4 - DATA MODELS (Mongoose)
=====================================================================
User: name, email, phone, passwordHash, role (buyer|seller|admin),
sellerProfile { storeName, status: pending|approved|suspended, documents },
isVerified, createdAt.

Category (tree):
 name, slug (unique within parent), parent (ObjectId|null), path (e.g.
 "men/footwear/sneakers", unique), ancestors [ObjectId], level, image,
 isActive, isFeatured, sortOrder, requiresApproval (stricter admin check),
 restricted (e.g. medicines), filterSchema [{ key, label, type:
 "multi"|"range"|"boolean", options? }].
 Recompute path/ancestors/level automatically on save.

Product:
 title, slug (unique), description, brand, seller (User), category (leaf),
 categoryPath, ancestors [ObjectId] (copied from the category),
 price, mrp, discountPercent (auto-calculated),
 images [{ url, alt, isPrimary }],
 attributes (flexible object: color, material, gender
 men|women|unisex|boys|girls, etc.),
 variants [{ sku, size, color, stock, price? }],
 tags [string], ratingAvg, ratingCount,
 status: draft|pending|approved|rejected, rejectionReason, reviewedBy,
 reviewedAt, isActive, createdAt, updatedAt.

Indexes:
 Product: { status:1, isActive:1, ancestors:1, price:1 }, { status:1,
 brand:1 }, { seller:1, status:1 }, unique slug, and a weighted text index on
 title(10), brand(6), categoryPath(3), tags(2).
 Category: unique path, { parent:1, sortOrder:1 }.

=====================================================================
PHASE 5 - CATEGORY TREE (seed these; every node in the DB)
=====================================================================
Top-level departments (navbar order): Men, Women, Kids, Electronics,
Home & Living, Beauty & Personal Care, Health & Wellness,
Grocery & Daily Needs, Sports & Fitness, Books & Stationery,
Toys & Games, Automotive, More.

MEN
 Clothing: T-shirts, Shirts, Jeans, Trousers, Shorts, Jackets & Coats,
  Hoodies & Sweatshirts, Suits & Blazers, Ethnic wear, Innerwear & Socks,
  Sleepwear, Thermals, Tracksuits
 Footwear: Sneakers, Formal shoes, Casual shoes, Sandals & Slippers, Boots,
  Sports shoes
 Accessories: Watches, Belts, Wallets, Caps & Hats, Sunglasses, Ties,
  Scarves & Gloves, Bags & Backpacks
 Grooming: Beard care, Shaving, Fragrance, Hair care
WOMEN
 Clothing: Kurtas & Kurtis, Sarees, Tops, Dresses, Jeans, Trousers &
  Leggings, Skirts, Jackets & Sweaters, Ethnic sets, Lehenga, Innerwear,
  Nightwear, Sportswear, Maternity
 Footwear: Heels, Flats, Sneakers, Sandals, Boots, Sports shoes
 Bags & Accessories: Handbags, Backpacks, Wallets, Belts, Scarves,
  Sunglasses, Watches
 Jewellery: Necklaces, Earrings, Rings, Bangles, Sets, Artificial jewellery
KIDS
 Boys: Clothing, Footwear, Accessories, School uniforms
 Girls: Clothing, Footwear, Accessories, School uniforms
 Baby (0-2): Clothing, Diapers & wipes, Feeding, Bath & skincare,
  Strollers & car seats, Nursery
ELECTRONICS
 Mobiles & Tablets: Smartphones, Tablets, Cases & covers, Chargers &
  cables, Power banks
 Laptops & Computers: Laptops, Desktops, Monitors, Keyboards & mice,
  Storage, Printers, Networking
 Audio: Earbuds, Headphones, Bluetooth speakers, Home theatre, Microphones
 Wearables: Smartwatches, Fitness bands
 TV & Entertainment: TVs, Set-top boxes, Projectors, Streaming devices
 Cameras: Cameras, Lenses, Tripods, CCTV
 Gaming: Consoles, Controllers, Gaming accessories
 Home Appliances: Refrigerators, Washing machines, Air conditioners, Fans,
  Water heaters, Microwaves, Vacuum cleaners
 Kitchen Appliances: Mixers, Rice cookers, Induction, Air fryers, Kettles,
  Toasters
 Power & Solar: Inverters, Batteries, UPS, Solar panels
HOME & LIVING
 Home Decor: Wall art, Clocks, Mirrors, Vases, Showpieces, Candles,
  Artificial plants, Curtains, Rugs & carpets
 Furniture: Beds, Sofas, Tables, Chairs, Wardrobes, Shelves, Office furniture
 Bedding: Bedsheets, Pillows, Blankets & quilts, Mattresses
 Kitchen & Dining: Cookware, Dinner sets, Storage containers, Cutlery,
  Water bottles
 Bath: Towels, Bath accessories
 Lighting: Ceiling lights, Lamps, LED strips, Bulbs
 Cleaning & Laundry, Garden & Outdoor, Tools & Hardware
BEAUTY & PERSONAL CARE
 Makeup (Face, Eyes, Lips, Nails, Tools), Skincare (Cleansers,
 Moisturisers, Sunscreen, Serums, Face masks), Hair care, Bath & Body,
 Fragrance, Men's Grooming, Beauty appliances, Oral care, Feminine hygiene
HEALTH & WELLNESS
 Vitamins & Supplements, Protein & Sports nutrition, Ayurveda & Herbal,
 Medical devices (BP monitors, Glucometers, Thermometers, Oximeters,
 Nebulisers), First aid, Masks & sanitisers, Mobility aids, Adult care,
 Medicines/Pharmacy (restricted=true, isActive=false until a licensed
 pharmacy workflow exists)
GROCERY & DAILY NEEDS
 Staples, Snacks & Beverages, Dairy & Eggs, Fruits & Vegetables, Dry fruits &
 nuts, Packaged food, Baby food, Pet food, Household
SPORTS & FITNESS
 Gym equipment, Yoga, Cricket, Football, Badminton, Cycling, Trekking &
 camping, Running gear, Sports shoes, Sportswear, Swimming
BOOKS & STATIONERY
 Books (Academic, Fiction, Self-help, Children, Exam prep, Nepali
 literature), Stationery (Notebooks, Pens, Art supplies, Office supplies,
 School bags, Calculators)
TOYS & GAMES
 Action figures, Dolls, Puzzles, Board games, Educational toys,
 Remote-control toys, Soft toys, Outdoor play, Baby toys
AUTOMOTIVE
 Bike & scooter accessories, Car accessories, Spare parts (Tyres,
 Batteries, Engine oil)
MORE
 Pets, Gifts (incl. Dashain/Tihar), Luggage & Travel, Musical instruments,
 Office & Industrial supplies

Rules:
- Create the whole tree in the DB, but set isActive=true only for categories
  that have at least a few approved products. Start with Men, Women, Kids,
  Electronics, Home Decor, Beauty, Sports.
- Shared items (shoes, watches, bags, sunglasses) have ONE category and a
  gender attribute (men|women|unisex|boys|girls). Men/Women/Kids pages are
  filtered views, never duplicate products.
- Give each category a filterSchema:
  Clothing/Footwear: brand, size, color, price, discount, material, fit,
  occasion, rating. Electronics: brand, price, RAM, storage, screen size,
  battery, warranty, rating. Home: brand, material, color, price, dimensions,
  room. Beauty: brand, skin/hair type, concern, price. Health: brand, type,
  pack size, price. Grocery: brand, pack size, veg/non-veg, price.
  Books: language, author, publisher, format, price. Toys: age group, brand,
  type, price.
- The frontend builds the filter sidebar from the API's facets/filterSchema,
  never from hardcoded per-category code.

=====================================================================
PHASE 6 - BACKEND API
=====================================================================
Public:
 GET /api/categories/tree            (nested, cached ~10 min, active only)
 GET /api/categories/:path           (category info, breadcrumbs, filterSchema)
 GET /api/products                   listing (below)
 GET /api/products/:slug             detail + related products
 GET /api/search?q=                  same filters/facets as listing
 GET /api/search/suggest?q=          ~8 suggestions: products, brands,
                                     categories; also trending/recent when
                                     q is empty
Seller (auth role seller):
 POST /api/seller/products           creates with status "pending"
 PUT  /api/seller/products/:id       editing title/images/price/category
                                     of an approved product sets it back
                                     to "pending"
 GET  /api/seller/products?status=
 PATCH /api/seller/products/:id/toggle   (pause/activate)
Admin (auth role admin):
 GET   /api/admin/products?status=pending
 PATCH /api/admin/products/:id/approve
 PATCH /api/admin/products/:id/reject   { reason }
 GET/PATCH /api/admin/sellers (approve/suspend sellers)
 POST/PUT/DELETE /api/admin/categories

Listing query params:
 category (path), brand (comma list), size, color, minPrice, maxPrice,
 rating, discount, gender, sort (recommended|newest|price_asc|price_desc|
 rating|discount), page, limit (default 24).
Behaviour:
 1. Resolve category by path; match products via ancestors.
 2. Always filter { status:"approved", isActive:true } AND seller status
    approved. Never return pending/rejected products publicly.
 3. Return products, facets (value + count for each filter in the category's
    filterSchema plus price min/max, using $facet), pagination, and
    category with breadcrumbs.
 Response shape:
 { products:[{id,slug,title,brand,price,mrp,discountPercent,image,
   ratingAvg,ratingCount}], facets:{brand:[{value,count}],size:[...],
   color:[...],price:{min,max}}, pagination:{page,limit,total,pages},
   category:{name,path,breadcrumbs:[...]} }

Security & quality: validate all input (zod/joi), sanitize search strings,
auth middleware by role, rate limits on login/search, centralized error
handling, generic auth errors.

=====================================================================
PHASE 7 - COLLECTION / LISTING PAGE (frontend)
=====================================================================
- Routes: /c/:path* (category listing), /search?q=
- Left filter sidebar (collapsible on mobile as a drawer) built from facets,
  with counts, price range slider, clear-all, and applied-filter chips.
- Sort dropdown, result count, breadcrumbs, pagination or "Load more".
- ALL state stored in the URL query string so refresh, back button and
  sharing work.
- Reuse the ProductCard, skeleton loaders, empty state ("No results" with
  suggestions) and error state.
- Quick filter pills (e.g. Deal of the Day, New, Rating 4+) belong here, not
  on the home page.

=====================================================================
PHASE 8 - SELLER AND ADMIN SCREENS
=====================================================================
Seller dashboard: product list with status tabs (draft/pending/approved/
rejected + rejection reason), add/edit product form with a cascading category
picker (dept → category → type) that loads the category's filterSchema to
render the right attribute fields, multi-image upload (Cloudinary or local),
variants/stock, price & MRP validation (price <= mrp).
Admin dashboard: pending products queue with image preview, approve/reject
(reason required), seller approval, category manager.

=====================================================================
PHASE 9 - SEED DATA (fixes mismatched names and images)
=====================================================================
Delete the old random seed. Rebuild it:
1. seed/users: 1 admin, 4-5 sellers (each selling a specific domain: e.g.
   footwear, electronics, home decor, beauty, kids) all with approved
   status; 2 buyers. Print the credentials in the console only for dev; do
   not hardcode them anywhere in the frontend.
2. seed/categories.json (the tree above) → script creates parents first and
   fills path, ancestors and level.
3. seed/products.json: each product defines title, brand, category (path),
   sellerKey, price, mrp, images[], attributes, variants together so the
   name, image and category always match. About 8-12 products per active
   category. Use only images that actually match the product (curated, or
   uploaded and named like nike-air-max-white-1.jpg). Include a few
   products with status pending and rejected to test the admin flow;
   everything else approved.
4. seed/validate script: fail loudly if any product has no image, no
   category, an unknown seller, price > mrp, or a duplicate slug. Also log
   a table of title → category → image file for a quick visual check.
5. The seed must be idempotent (safe to run again) and use the seller _id
   and category _id looked up by key/path.

=====================================================================
DEFINITION OF DONE
=====================================================================
- No hardcoded categories, filters or products in the frontend.
- Only approved + active products from approved sellers are shown publicly.
- Every product's name, image and category match.
- Navbar mega menu, listing filters/facets, sorting, pagination and search
  all work from the database, with URL-based state.
- Pages are responsive (mobile first), accessible and use one accent colour.
- Show me a short summary of files created/changed, new env vars, and how to
  run the seed and the app after each phase.