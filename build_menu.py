import json
import html
import re
import urllib.request
from pathlib import Path

ROOT = Path(r"f:\Moon's Coffee")
MENU_DIR = ROOT / "menu"
API_URL = "https://www.starbucks.com/apiproxy/v1/ordering/menu"

NAV_SVG = """<svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">
        <circle cx="31" cy="31" r="31" fill="#4F4D46"/>
        <circle cx="31" cy="31" r="27" fill="none" stroke="#fff" stroke-width="1.2"/>
        <path d="M20 18 L22.5 13 L25 17 L31 10 L37 17 L39.5 13 L42 18" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <ellipse cx="31" cy="28" rx="10" ry="11" fill="#4F4D46" stroke="#fff" stroke-width="1"/>
        <circle cx="27" cy="27" r="1.2" fill="#fff"/>
        <circle cx="35" cy="27" r="1.2" fill="#fff"/>
        <path d="M27 31 Q31 34 35 31" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/>
        <path d="M19 38 Q15 44 17 48 Q22 44 23 40" fill="#fff" opacity="0.9"/>
        <path d="M43 38 Q47 44 45 48 Q40 44 39 40" fill="#fff" opacity="0.9"/>
      </svg>"""

FOOTER = """
<footer>
  <div class="footer-inner">
    <div class="footer-cols">
      <div class="footer-col"><h4>About Us</h4><a href="#">Our Company</a><a href="#">Our Coffee</a><a href="#">About Moon's Coffee</a><a href="#">Moon's Coffee Archive</a><a href="#">Investor Relations</a><a href="#">Customer Service</a><a href="#">Contact Us</a></div>
      <div class="footer-col"><h4>Careers</h4><a href="#">Culture and Values</a><a href="#">Belonging at Moon's Coffee</a><a href="#">College Achievement Plan</a><a href="#">Alumni Community</a><a href="#">U.S. Careers</a><a href="#">International Careers</a></div>
      <div class="footer-col"><h4>Social Impact</h4><a href="#">Communities</a><a href="#">Moon's Coffee Foundation</a><a href="#">Sustainability</a><a href="#">Environmental and Social Impact Reporting</a></div>
      <div class="footer-col"><h4>For Business Partners</h4><a href="#">Landlord Support Center</a><a href="#">Suppliers</a><a href="#">Corporate Gift Card Sales</a><a href="#">Office and Foodservice Coffee</a></div>
      <div class="footer-col"><h4>Order and Pick Up</h4><a href="#">Order on the App</a><a href="#">Order on the Web</a><a href="#">Delivery</a><a href="#">Order and Pick Up Options</a><a href="#">Explore and Find Coffee for Home</a></div>
    </div>
    <hr class="footer-divider">
    <div class="footer-social">
      <a href="#" class="social-icon" title="Spotify" aria-label="Spotify"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></a>
      <a href="#" class="social-icon" title="Facebook" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
      <a href="#" class="social-icon" title="Pinterest" aria-label="Pinterest"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></a>
      <a href="#" class="social-icon" title="Instagram" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
      <a href="#" class="social-icon" title="YouTube" aria-label="YouTube"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg></a>
      <a href="#" class="social-icon" title="X" aria-label="X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
    </div>
    <div class="footer-legal">
      <a href="#">Privacy Notice</a><a href="#">Consumer Health Privacy Notice</a><a href="#">Terms of Use</a>
      <a href="#">Do Not Sell or Share My Personal Information</a><a href="#">Moon's Coffee Transparency Statement</a>
      <a href="#">Accessibility</a><a href="#">Cookie Preferences</a>
    </div>
    <p class="footer-copy">&copy; 2024 Moon's Coffee. All rights reserved.</p>
  </div>
</footer>"""

SCRIPT = """
<script>
  const nav = document.getElementById('main-nav');
  const toggle = nav.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
</script>"""


def slug(name: str) -> str:
    s = name.lower()
    s = s.replace("\u00ae", "").replace("&", "and").replace(",", "")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def img_url(url: str | None, wid: int) -> str:
    if not url:
        return ""
    sep = "&" if "?" in url else "?"
    return f"{html.escape(url)}{sep}wid={wid}"


def fetch_menu():
    req = urllib.request.Request(API_URL, headers={"User-Agent": "Mozilla/5.0"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())


def collect_groups(data):
    groups = []
    categories = {}
    for menu in data["menus"]:
        group_name = menu["name"]
        items = []
        for cat in menu.get("children", []):
            categories[cat["name"]] = cat
            items.append(cat)
        groups.append((group_name, items))
    return groups, categories


def page_shell(title, description, asset_prefix, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{html.escape(description)}">
  <title>{html.escape(title)}</title>
  <link rel="stylesheet" href="{asset_prefix}style.css">
  <link rel="stylesheet" href="{asset_prefix}menu.css">
</head>
<body>

<nav id="main-nav">
  <div class="nav-left">
    <a href="{asset_prefix}starbucks_homepage.html" class="nav-logo" aria-label="Moon's Coffee">
      {NAV_SVG}
    </a>
    <ul class="nav-links">
      <li><a href="{asset_prefix}starbucks_menu.html" class="active">Menu</a></li>
      <li><a href="{asset_prefix}starbucks_rewards.html">Rewards</a></li>
      <li><a href="{asset_prefix}starbucks_giftcards.html">Gift Cards</a></li>
    </ul>
  </div>
  <div class="nav-right">
    <a href="#" class="find-store">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      Find a store
    </a>
    <a href="#" class="btn-signin">Sign in</a>
    <a href="#" class="btn-join">Join now</a>
    <a href="{asset_prefix}cart.html" class="nav-cart" aria-label="View cart">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>
      <span class="cart-badge" style="display:none"></span>
    </a>
  </div>
  <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>
  </button>
</nav>

<nav class="menu-subnav" aria-label="Menu sections">
  <div class="menu-subnav-inner">
    <a href="{asset_prefix}starbucks_menu.html" class="active">Menu</a>
    <a href="#">Featured</a>
    <a href="#">Previous</a>
    <a href="#">Favorites</a>
  </div>
</nav>

{body}

{FOOTER}
<script src="{asset_prefix}js/cart.js"></script>
{SCRIPT}
</body>
</html>"""


def sidebar_html(groups, link_prefix, overview_href, active_slug=None):
    blocks = []
    for group_name, items in groups:
        lines = [
            '        <div class="sidebar-group">',
            f'          <a href="{overview_href}#{slug(group_name)}" class="sidebar-heading">{html.escape(group_name)}</a>',
            "          <ul>",
        ]
        for cat in items:
            name = cat["name"]
            s = slug(name)
            href = f"{link_prefix}{s}.html"
            cls = ' class="active"' if active_slug == s else ""
            lines.append(f'            <li><a href="{href}"{cls}>{html.escape(name)}</a></li>')
        lines.append("          </ul>")
        lines.append("        </div>")
        blocks.append("\n".join(lines))
    return "\n".join(blocks)


def product_href(p, prefix="../"):
    pid = p["productNumber"]
    form = p["formCode"].lower()
    return f"{prefix}product.html?id={pid}&form={form}"


def collect_products(data):
    catalog = {}

    def add(p, path, category_slug):
        key = f"{p['productNumber']}-{p['formCode'].lower()}"
        sizes = [s.get("sizeCode") for s in (p.get("sizes") or []) if s.get("sizeCode")]
        default_size = (p.get("defaultSize") or {}).get("displayName") or (sizes[2] if len(sizes) > 2 else sizes[0] if sizes else "Grande")
        catalog[key] = {
            "id": p["productNumber"],
            "form": p["formCode"].lower(),
            "name": p["name"],
            "imageURL": p.get("imageURL"),
            "productType": p.get("productType", "Beverage"),
            "sizes": sizes,
            "defaultSize": default_size,
            "categoryPath": path,
            "categorySlug": category_slug,
        }

    for menu in data["menus"]:
        group = menu["name"]
        for cat in menu.get("children", []):
            cat_slug = slug(cat["name"])
            base_path = [group, cat["name"]]
            for p in cat.get("products") or []:
                add(p, base_path, cat_slug)
            for child in cat.get("children") or []:
                child_path = base_path + [child["name"]]
                for p in child.get("products") or []:
                    add(p, child_path, cat_slug)

    return catalog


def export_products_js(catalog):
    js_dir = ROOT / "js"
    js_dir.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(catalog, ensure_ascii=False, indent=2)
    (js_dir / "products-data.js").write_text(
        f"window.MOON_PRODUCTS = {payload};\n",
        encoding="utf-8",
    )
    print(f"Wrote js/products-data.js ({len(catalog)} products)")


def product_grid(products):
    cards = []
    for p in products:
        img = p.get("imageURL")
        if not img:
            continue
        href = product_href(p)
        cards.append(
            f"""          <a href="{href}" class="product-card">
            <div class="product-circle">
              <img src="{img_url(img, 200)}" alt="" loading="lazy">
            </div>
            <span class="product-name">{html.escape(p["name"])}</span>
          </a>"""
        )
    if not cards:
        return '        <p class="catalog-empty">No items available.</p>'
    return "        <div class=\"product-grid\">\n" + "\n".join(cards) + "\n        </div>"


def catalog_sections(cat):
    children = cat.get("children") or []
    direct = cat.get("products") or []
    sections = []

    if children:
        for child in children:
            products = child.get("products") or []
            if products:
                sections.append((child["name"], products))
    elif direct:
        sections.append((None, direct))

    return sections


def render_catalog_main(cat):
    name = cat["name"]
    parts = [
        '  <main class="menu-main">',
        '    <nav class="menu-breadcrumb" aria-label="Breadcrumb">',
        f'      <a href="../starbucks_menu.html">Menu</a>',
        '      <span class="menu-breadcrumb-sep" aria-hidden="true">/</span>',
        f'      <span>{html.escape(name)}</span>',
        "    </nav>",
        f'    <h1 class="menu-page-title">{html.escape(name)}</h1>',
        '    <hr class="menu-section-rule menu-title-rule">',
    ]

    sections = catalog_sections(cat)
    for section_name, products in sections:
        parts.append('    <section class="catalog-section">')
        if section_name:
            parts.append(f'      <h2 class="catalog-section-title">{html.escape(section_name)}</h2>')
            parts.append('      <hr class="menu-section-rule">')
        parts.append(product_grid(products))
        parts.append("    </section>")

    parts.append("  </main>")
    return "\n".join(parts)


def render_overview_main(groups):
    parts = ['  <main class="menu-main">', '    <h1 class="menu-page-title">Menu</h1>']

    for group_name, items in groups:
        parts.append(f'    <section class="menu-section" id="{slug(group_name)}">')
        parts.append(f'      <h2 class="menu-section-title">{html.escape(group_name)}</h2>')
        parts.append('      <hr class="menu-section-rule">')

        if group_name == "The Latest":
            parts.append('      <div class="menu-feature-grid">')
            for cat in items:
                hero = cat.get("heroCategoryImageURL") or cat.get("categoryImageURL")
                s = slug(cat["name"])
                parts.append(f"""        <a href="menu/{s}.html" class="menu-feature-card">
          <div class="menu-feature-img">
            <img src="{img_url(hero, 800)}" alt="{html.escape(cat['name'])}" loading="lazy">
          </div>
          <span class="menu-feature-label">{html.escape(cat['name'])}</span>
        </a>""")
            parts.append("      </div>")
        else:
            parts.append('      <div class="menu-category-grid">')
            for cat in items:
                img = cat.get("categoryImageURL")
                if not img:
                    continue
                s = slug(cat["name"])
                parts.append(f"""        <a href="menu/{s}.html" class="menu-category-row">
          <div class="menu-category-circle">
            <img src="{img_url(img, 200)}" alt="" loading="lazy">
          </div>
          <span class="menu-category-name">{html.escape(cat['name'])}</span>
        </a>""")
            parts.append("      </div>")

        parts.append("    </section>")

    parts.append("  </main>")
    return "\n".join(parts)


def main():
    data = fetch_menu()
    groups, categories = collect_groups(data)
    catalog = collect_products(data)
    export_products_js(catalog)
    MENU_DIR.mkdir(parents=True, exist_ok=True)

    sidebar_overview = sidebar_html(groups, "menu/", "starbucks_menu.html")
    overview_body = f"""<div class="menu-page">
  <aside class="menu-sidebar" aria-label="Menu categories">
    <nav>
{sidebar_overview}
    </nav>
  </aside>
{render_overview_main(groups)}
</div>"""

    overview = page_shell(
        "Menu: Moon's Coffee",
        "Explore the full Moon's Coffee menu. Drinks, food, and at-home coffee.",
        "",
        overview_body,
    )
    (ROOT / "starbucks_menu.html").write_text(overview, encoding="utf-8")
    print("Wrote starbucks_menu.html")

    count = 0
    for name, cat in categories.items():
        s = slug(name)
        sidebar = sidebar_html(groups, "", "../starbucks_menu.html", active_slug=s)
        body = f"""<div class="menu-page">
  <aside class="menu-sidebar" aria-label="Menu categories">
    <nav>
{sidebar}
    </nav>
  </aside>
{render_catalog_main(cat)}
</div>"""
        page = page_shell(
            f"{name}: Moon's Coffee",
            f"Browse {name} on the Moon's Coffee menu.",
            "../",
            body,
        )
        (MENU_DIR / f"{s}.html").write_text(page, encoding="utf-8")
        count += 1
        print(f"  menu/{s}.html ({name})")

    print(f"Done — {count} category pages.")


if __name__ == "__main__":
    main()
