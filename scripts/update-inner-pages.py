#!/usr/bin/env python3
"""Update inner HTML pages to use shared header/footer from about.html design."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FONT_OLD = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">'
FONT_NEW = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">'

FOOTER = '''  <footer class="site-footer">
    <div class="footer-top">
      <div class="footer-leaf" aria-hidden="true">
        <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 12C60 12 18 58 24 112C28 132 42 138 60 140" stroke="#8aaa57" stroke-width="1.2" stroke-opacity="0.22"/>
          <path d="M60 12C60 12 98 52 92 104C88 124 74 132 60 136" stroke="#8aaa57" stroke-width="1.2" stroke-opacity="0.16"/>
        </svg>
      </div>
      <div class="footer-container">
        <div class="footer-col footer-about">
          <div class="footer-logo-wrap">
            <img src="assets/images/logo1 (1).png" alt="Maharshi Group" class="footer-logo" />
          </div>
          <p class="footer-about-text">
            Maharshi Group, established in 1987, is a diversified enterprise in Ayurvedic healthcare, research, trade,
            manufacturing, and e-commerce-committed to quality, innovation, and enhancing lives with trusted products.
          </p>
        </div>

        <div class="footer-col">
          <h3 class="footer-title">Quick Links</h3>
          <span class="footer-title-line" aria-hidden="true"></span>
          <ul class="footer-links footer-links-nav">
            <li><a href="index.html">Home <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a></li>
            <li><a href="about.html">About Us <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a></li>
            <li><a href="companies.html">Companies <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a></li>
            <li><a href="contact.html">Contact Us <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3 class="footer-title">Our Companies</h3>
          <span class="footer-title-line" aria-hidden="true"></span>
          <ul class="footer-links footer-companies-list">
            <li><a href="maharshi-ayur-lab-kerala.html">Maharshi Ayur Lab Kerala Pvt Ltd</a></li>
            <li><a href="vitae-up-research-remedies.html">Vitae Up Research &amp; Remedies</a></li>
            <li><a href="oxion-angel-luxe.html">Oxion Angel Luxe</a></li>
            <li><a href="oxyma-health-care.html">Oxyma Health Care</a></li>
            <li><a href="d21-doors-and-windows.html">D2I Doors And Windows</a></li>
            <li><a href="oxikart.html">Oxikart</a></li>
            <li><a href="maxwell-link.html">Maxwell Link</a></li>
            <li><a href="max-and-mark.html">Max And Mark</a></li>
            <li><a href="oxion-fruit-extraction.html">Oxion Fruit Extraction</a></li>
            <li><a href="we-six.html">We Six</a></li>
          </ul>
        </div>

        <div class="footer-col footer-contact-col">
          <div class="footer-card">
            <h3 class="footer-title">Contact Us</h3>
            <span class="footer-title-line" aria-hidden="true"></span>
            <ul class="footer-contact-list">
              <li>
                <span class="footer-icon"><i class="fa-regular fa-envelope"></i></span>
                <span>maharshiayurlabkerala@gmail.com</span>
              </li>
              <li>
                <span class="footer-icon"><i class="fa-solid fa-phone"></i></span>
                <span>9961096701</span>
              </li>
              <li>
                <span class="footer-icon"><i class="fa-solid fa-phone"></i></span>
                <span>04852001228</span>
              </li>
            </ul>
          </div>

          <div class="footer-card">
            <h3 class="footer-title">Our Address</h3>
            <span class="footer-title-line" aria-hidden="true"></span>
            <div class="footer-address">
              <span class="footer-icon"><i class="fa-solid fa-location-dot"></i></span>
              <span>Maharshi Ayurlab Kerala Pvt. Ltd., Kottappady P. O., Ernakulam District, Kerala - 686692</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <p class="footer-copyright">All rights reserved © 2025 @ Maharshi Ayurlab Kerala</p>
        <div class="footer-social">
          <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
          <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
        </div>
        <button class="scroll-top footer-scroll-top" aria-label="Scroll to top">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      </div>
    </div>
  </footer>

  <script src="js/script.js"></script>
</body>
</html>'''


def header(title: str, active: str) -> str:
    nav_items = [
        ('index.html', 'Home', 'home'),
        ('about.html', 'About Us', 'about'),
        ('companies.html', 'Companies', 'companies'),
        ('contact.html', 'Contact', 'contact'),
    ]
    links = []
    for href, label, key in nav_items:
        cls = ' class="active"' if key == active else ''
        links.append(f'            <li><a href="{href}"{cls}>{label}</a></li>')

    return f'''<body class="about-page">
  <header class="inner-hero">
    <div class="inner-hero-bg" aria-hidden="true"></div>
    <div class="inner-hero-overlay" aria-hidden="true"></div>

    <div class="inner-hero-inner">
      <div class="navbar-container">
        <nav class="navbar">
          <a href="index.html" class="logo-container" aria-label="Maharshi Home">
            <img src="assets/images/logo1.png" alt="Maharshi Ayur Lab" class="logo-img">
          </a>

          <ul class="nav-links">
{chr(10).join(links)}
          </ul>

          <div class="nav-right">
            <div class="contact-info">
              <div class="phone-icon">
                <i class="fa-solid fa-phone"></i>
              </div>
              <div class="contact-text">
                <span class="label">Have Any Questions?</span>
                <span class="number">+91 996 109 6701</span>
              </div>
            </div>

            <div class="divider"></div>

            <a href="contact.html" class="btn btn-primary">
              Get in Touch
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          </div>
        </nav>
      </div>

      <div class="inner-hero-content">
        <div class="inner-hero-label">
          <svg class="inner-hero-label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2C12 2 6 8 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 8 12 2 12 2Z" stroke="#7CC242" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M12 20V12" stroke="#7CC242" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>MAHARSHI GROUP</span>
        </div>
        <h1 class="inner-hero-title">{title}</h1>
        <span class="inner-hero-line" aria-hidden="true"></span>
      </div>
    </div>
  </header>
'''


ACTIVE_MAP = {
    'companies.html': 'companies',
    'contact.html': 'contact',
}

COMPANY_PAGES = [
    'maharshi-ayur-lab-kerala.html',
    'vitae-up-research-remedies.html',
    'd21-doors-and-windows.html',
    'oxion-angel-luxe.html',
    'we-six.html',
    'oxyma-health-care.html',
    'maxwell-link.html',
    'max-and-mark.html',
    'oxikart.html',
    'oxion-fruit-extraction.html',
]

SKIP = {'index.html', 'about.html'}


def extract_title(html: str) -> str:
    m = re.search(r'<div class="about-hero-content"[^>]*>\s*<h1>(.*?)</h1>', html, re.S)
    if m:
        return m.group(1).strip()
    m = re.search(r'<div class="inner-hero-content"[^>]*>.*?<h1 class="inner-hero-title">(.*?)</h1>', html, re.S)
    if m:
        return m.group(1).strip()
    m = re.search(r'<title>(.*?)\s*-\s*Maharshi Group</title>', html)
    if m:
        return m.group(1).strip()
    return 'Maharshi Group'


def extract_body_content(html: str) -> str:
    """Content between old hero and footer."""
    m = re.search(
        r'</section>\s*(.*?)\s*(?:<!-- Footer Section -->|<footer class="site-footer")',
        html,
        re.S,
    )
    if not m:
        raise ValueError('Could not find main content block')
    return m.group(1).strip()


def update_file(path: Path, active: str) -> None:
    html = path.read_text(encoding='utf-8')
    title = extract_title(html)
    content = extract_body_content(html)

    head_end = re.search(r'</head>\s*', html)
    if not head_end:
        raise ValueError('Missing </head>')

    head = html[: head_end.end()]
    head = head.replace(FONT_OLD, FONT_NEW)

    new_html = head + header(title, active) + '\n' + content + '\n\n' + FOOTER
    path.write_text(new_html, encoding='utf-8')
    print(f'Updated {path.name} ({title})')


def main() -> None:
    for name in ['companies.html', 'contact.html']:
        update_file(ROOT / name, ACTIVE_MAP[name])

    for name in COMPANY_PAGES:
        update_file(ROOT / name, 'companies')

    print('Done.')


if __name__ == '__main__':
    main()
