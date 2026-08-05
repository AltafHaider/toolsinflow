<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

$appName = htmlspecialchars((string) $config['app_name'], ENT_QUOTES, 'UTF-8');
$tagline = htmlspecialchars((string) $config['app_tagline'], ENT_QUOTES, 'UTF-8');
$domain  = htmlspecialchars((string) ($config['domain'] ?? 'toolsinflow.com'), ENT_QUOTES, 'UTF-8');
$contactEmail = htmlspecialchars((string) ($config['contact_email'] ?? 'contact@toolsinflow.com'), ENT_QUOTES, 'UTF-8');

$scriptName = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/index.php'));
$scriptDir  = rtrim(dirname($scriptName), '/');
if ($scriptDir === '/' || $scriptDir === '\\' || $scriptDir === '.') {
    $scriptDir = '';
}

$requestHost = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
$productionHost = strtolower((string) ($config['domain'] ?? 'toolsinflow.com'));
$isProduction = $requestHost === $productionHost || $requestHost === 'www.' . $productionHost;

if ($isProduction) {
    // Apache may internally execute /public/index.php, but public URLs stay at /.
    $assetBase = '/assets';
    $pageBase = '';
} elseif (str_ends_with($scriptDir, '/public')) {
    $assetBase = $scriptDir . '/assets';
    $pageBase  = $scriptDir;
} elseif (str_contains($scriptDir, '/tools')) {
    $pageBase = preg_replace('#/tools$#', '', $scriptDir) ?? '';
    $assetBase = ($pageBase === '' ? '' : $pageBase) . '/assets';
} else {
    $assetBase = ($scriptDir === '' ? '' : $scriptDir) . '/assets';
    $pageBase  = $scriptDir === '' ? '' : $scriptDir;
}

$assetBase = htmlspecialchars($assetBase, ENT_QUOTES, 'UTF-8');
$pageBase  = htmlspecialchars((string) $pageBase, ENT_QUOTES, 'UTF-8');
$year = date('Y');

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = (string) ($_SERVER['HTTP_HOST'] ?? $domain);
$canonicalBase = $scheme . '://' . $host . ($pageBase === '' ? '' : rtrim($pageBase, '/'));

function cz_h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function cz_clean_path(string $path): string
{
    $path = trim($path);
    if ($path === '' || $path === '/') {
        return '';
    }

    $path = ltrim($path, '/');
    $static = [
        'about.php' => 'about',
        'contact.php' => 'contact',
        'privacy.php' => 'privacy',
        'terms.php' => 'terms',
        'about' => 'about',
        'contact' => 'contact',
        'privacy' => 'privacy',
        'terms' => 'terms',
    ];
    if (isset($static[$path])) {
        return $static[$path];
    }

    if (preg_match('/^tool\.php\?t=([a-z0-9\-]+)$/i', $path, $m)) {
        return strtolower($m[1]);
    }

    return $path;
}

function cz_tool_url(string $id): string
{
    return cz_url(preg_replace('/[^a-z0-9\-]/', '', strtolower($id)) ?? '');
}

function cz_url(string $path = ''): string
{
    global $pageBase;
    $base = $pageBase === '' ? '' : rtrim($pageBase, '/');
    $clean = cz_clean_path($path);
    if ($clean === '') {
        return $base === '' ? './' : $base . '/';
    }
    return ($base === '' ? '' : $base) . '/' . $clean;
}

function cz_tool_icon(string $id): string
{
    // Simple stroke icons (viewBox 0 0 24 24)
    $icons = [
        'pdf-form-creator' => '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M8 11h7M8 15h3"/><rect x="13" y="13" width="3" height="3" rx=".4"/>',
        'pdf-to-word' => '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M8.5 11l1.5 6 2-4 2 4 1.5-6"/>',
        'word-to-pdf' => '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 15h5"/><path d="M8.5 11l1.5 5 1.5-3 1.5 3 1.5-5"/>',
        'merge-pdf' => '<path d="M4 4h8l3 3v6H4z"/><path d="M9 10h8l3 3v6H9z"/><path d="M12 7v3M13.5 14h3M13.5 17h2"/>',
        'split-pdf' => '<path d="M6 3h7l3 3v7H6z"/><path d="M13 3v3h3M4 14h7l3 3v4H4z"/><path d="M11 14v3h3M14.5 10.5l4 0M16.5 8.5v4"/>',
        'compress-pdf' => '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M9 12h6M9 15h4"/><path d="M10 18h4l-2 2-2-2zM10 10h4L12 8l-2 2z"/>',
        'compress-image' => '<path d="M8 3h8v6H8zM8 15h8v6H8zM5 10h14v4H5z"/>',
        'resize-image' => '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
        'bg-remove' => '<path d="M4 19l5-6.5a2.2 2.2 0 013.4 0L18 19"/><circle cx="9" cy="8" r="2.2"/><path d="M16.5 6.5l4 4M20.5 6.5l-4 4"/>',
        'crop-image' => '<path d="M6 3v12a2 2 0 002 2h12M18 21V9a2 2 0 00-2-2H3"/>',
        'rotate-image' => '<path d="M21 12a9 9 0 10-2.6 6.3"/><path d="M21 7v5h-5"/>',
        'flip-image' => '<path d="M12 3v18"/><path d="M5 8l5 4-5 4V8z"/><path d="M19 8l-5 4 5 4V8z"/>',
        'jpg-to-png' => '<rect x="3" y="5" width="9" height="12" rx="1.5"/><path d="M10 9h10v10H12v-4"/><path d="M14 13h4M14 16h3"/>',
        'png-to-jpg' => '<rect x="12" y="5" width="9" height="12" rx="1.5"/><path d="M3 9h10v10H3z"/><path d="M6 13h4M6 16h3"/>',
        'to-webp' => '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 15l2.5-3.2 1.8 2.3L14 10l4 5"/>',
        'image-to-svg' => '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 15l3-4 2 2.5L15 10l4 5"/><path d="M8 4l1.5 1.5M16 4l-1.5 1.5"/>',
        'webp-to-jpg' => '<rect x="3" y="7" width="8" height="10" rx="1.5"/><rect x="13" y="7" width="8" height="10" rx="1.5"/><path d="M9 12h6"/>',
        'webp-to-png' => '<rect x="3" y="7" width="8" height="10" rx="1.5"/><rect x="13" y="7" width="8" height="10" rx="1.5"/><path d="M9 12h6"/>',
        'png-to-webp' => '<rect x="3" y="7" width="8" height="10" rx="1.5"/><rect x="13" y="7" width="8" height="10" rx="1.5"/><path d="M9 12h6"/>',
        'jpg-to-webp' => '<rect x="3" y="7" width="8" height="10" rx="1.5"/><rect x="13" y="7" width="8" height="10" rx="1.5"/><path d="M9 12h6"/>',
        'grayscale-image' => '<circle cx="12" cy="12" r="8"/><path d="M12 4v16a8 8 0 000-16z"/>',
        'blur-faces' => '<circle cx="12" cy="9.5" r="3.2"/><path d="M6 19a6 6 0 0112 0"/><path d="M5 8.5h2.2M16.8 8.5H19M8.2 5.8l1.3 1.3M15.8 5.8l-1.3 1.3"/>',
        'images-to-pdf' => '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M9 12h6M9 15h6M9 18h4"/>',
        'typing-test' => '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M7 20h10M12 17v3"/><path d="M7 9h2M11 9h2M15 9h2M8 12h8"/>',
        'data-entry-test' => '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/><circle cx="16.5" cy="16" r="1.2"/>',
        'mixed-test' => '<circle cx="8" cy="8" r="3"/><rect x="13" y="5" width="7" height="6" rx="1"/><path d="M4 16h7M4 19h5M14 15l3 3 4-5"/>',
    ];

    $path = $icons[$id] ?? '<rect x="6" y="6" width="12" height="12" rx="2"/>';
    return '<span class="tool-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">' . $path . '</svg></span>';
}

function cz_render_head(string $title, string $description, string $path = '/', array $extra = []): void
{
    global $appName, $assetBase, $canonicalBase, $config, $domain, $tagline;

    $canonical = rtrim($canonicalBase, '/') . ($path === '/' ? '/' : $path);
    $ogType = (string) ($extra['og_type'] ?? 'website');
    $robots = (string) ($extra['robots'] ?? 'index, follow, max-image-preview:large');
    $jsonLd = $extra['json_ld'] ?? null;

    $prodHost = (string) ($config['domain'] ?? 'toolsinflow.com');
    $isLocal = str_contains((string) ($_SERVER['HTTP_HOST'] ?? ''), 'localhost')
        || str_contains((string) ($_SERVER['HTTP_HOST'] ?? ''), '127.0.0.1');
    if (!$isLocal) {
        $canonical = 'https://' . $prodHost . ($path === '/' ? '/' : $path);
    }
    ?>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#f4f7f5" />
  <title><?= cz_h($title) ?></title>
  <meta name="description" content="<?= cz_h($description) ?>" />
  <meta name="keywords" content="toolsinflow, free online tools, all-in-one toolkit, image tools, pdf tools, compress image, convert files, remove background, resize image, blur faces, pdf form creator, pdf to word, word to pdf, typing test, data entry test, wpm" />
  <meta name="author" content="<?= $appName ?>" />
  <meta name="robots" content="<?= cz_h($robots) ?>" />
  <meta name="googlebot" content="index, follow" />
  <link rel="canonical" href="<?= cz_h($canonical) ?>" />

  <meta property="og:type" content="<?= cz_h($ogType) ?>" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content="<?= $appName ?>" />
  <meta property="og:title" content="<?= cz_h($title) ?>" />
  <meta property="og:description" content="<?= cz_h($description) ?>" />
  <meta property="og:url" content="<?= cz_h($canonical) ?>" />
  <meta property="og:image" content="<?= cz_h(rtrim($canonicalBase, '/') . $assetBase . '/img/logo.svg') ?>" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="<?= cz_h($title) ?>" />
  <meta name="twitter:description" content="<?= cz_h($description) ?>" />

  <link rel="icon" href="<?= $assetBase ?>/img/logo.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="<?= $assetBase ?>/css/style.css?v=81" />
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin />
  <script type="application/ld+json">
  <?= json_encode([
      '@context' => 'https://schema.org',
      '@graph' => [
          [
              '@type' => 'WebSite',
              'name' => 'ToolsInFlow',
              'alternateName' => ['Tools In Flow', 'toolsinflow', 'toolsinflow.com'],
              'url' => 'https://' . $prodHost . '/',
              'description' => 'Free online toolkit for images, PDFs, and everyday file jobs. Private browser tools, no signup.',
              'publisher' => ['@type' => 'Organization', 'name' => 'ToolsInFlow', 'url' => 'https://' . $prodHost . '/'],
          ],
          [
              '@type' => 'Organization',
              'name' => 'ToolsInFlow',
              'url' => 'https://' . $prodHost . '/',
              'email' => (string) ($config['contact_email'] ?? 'contact@toolsinflow.com'),
              'logo' => 'https://' . $prodHost . '/assets/img/logo.svg',
          ],
      ],
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>
  </script>
  <?php if (is_array($jsonLd)): ?>
  <script type="application/ld+json">
  <?= json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>
  </script>
  <?php endif; ?>
  <script>
    (() => {
      try {
        const saved = localStorage.getItem("toolsinflow-theme");
        const theme = saved === "light" || saved === "dark" ? saved : "light";
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {}
    })();
  </script>
  <?php if (!empty($config['adsense_client']) && !empty($config['ads_enabled'])): ?>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?= cz_h((string) $config['adsense_client']) ?>" crossorigin="anonymous"></script>
  <?php endif; ?>
    <?php
}

function cz_nav_tools_by_group(): array
{
    global $config;

    $tools = $config['tools'] ?? [];
    $categories = $config['categories'] ?? [];
    $groups = [
        'image' => [
            'label' => 'Image tools',
            'href' => cz_url() . '#image-tools',
            'cats' => ['optimize', 'convert', 'edit', 'effects'],
        ],
        'pdf' => [
            'label' => 'PDF tools',
            'href' => cz_url() . '#pdf',
            'cats' => ['pdf'],
        ],
        'test' => [
            'label' => 'Typing & tests',
            'href' => cz_url() . '#test-tools',
            'cats' => ['test'],
        ],
    ];

    $out = [];
    foreach ($groups as $groupId => $group) {
        $sections = [];
        foreach ($group['cats'] as $catId) {
            $items = [];
            foreach ($tools as $id => $tool) {
                if (($tool['cat'] ?? '') !== $catId) {
                    continue;
                }
                $items[] = [
                    'id' => $id,
                    'name' => (string) ($tool['name'] ?? $id),
                    'href' => cz_tool_url($id),
                ];
            }
            if ($items === []) {
                continue;
            }
            $sections[] = [
                'id' => $catId,
                'label' => (string) ($categories[$catId] ?? ucfirst($catId)),
                'href' => cz_url() . '#' . $catId,
                'items' => $items,
            ];
        }
        if ($sections === []) {
            continue;
        }
        $out[$groupId] = [
            'label' => $group['label'],
            'href' => $group['href'],
            'sections' => $sections,
        ];
    }

    return $out;
}

function cz_tools_index(): array
{
    global $config;

    $tools = $config['tools'] ?? [];
    $categories = $config['categories'] ?? [];
    $index = [];

    foreach ($tools as $id => $tool) {
        $cat = (string) ($tool['cat'] ?? '');
        $name = (string) ($tool['name'] ?? $id);
        $desc = (string) ($tool['desc'] ?? '');
        $index[] = [
            'id' => (string) $id,
            'name' => $name,
            'desc' => $desc,
            'cat' => $cat,
            'catLabel' => (string) ($categories[$cat] ?? ucfirst($cat)),
            'url' => cz_tool_url((string) $id),
            'keywords' => trim($name . ' ' . $desc . ' ' . $cat . ' ' . str_replace('-', ' ', (string) $id)),
        ];
    }

    return $index;
}

function cz_render_header(string $active = ''): void
{
    global $appName, $assetBase;
    $navGroups = cz_nav_tools_by_group();
    ?>
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="<?= cz_url() ?>">
        <img src="<?= $assetBase ?>/img/logo.svg?v=2" alt="<?= $appName ?>" width="42" height="42" />
        <span class="logo-text">Tools<span>In</span>Flow</span>
      </a>
      <div class="header-search" data-tool-search>
        <label class="header-search-field">
          <span class="sr-only">Search tools</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <input type="search" id="toolSearch" placeholder="Search any tool..." autocomplete="off" spellcheck="false" />
        </label>
        <div class="header-search-results" id="toolSearchResults" hidden role="listbox" aria-label="Tool search results"></div>
      </div>
      <div class="header-actions">
        <button type="button" class="theme-toggle" id="themeToggle" aria-label="Toggle theme">☀</button>
        <button type="button" class="menu-toggle" id="menuToggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
        <nav class="nav" id="siteNav">
          <?php foreach ($navGroups as $groupId => $group): ?>
            <div class="nav-dropdown" data-nav-dropdown>
              <button type="button" class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
                <?= cz_h($group['label']) ?>
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <div class="nav-dropdown-panel<?= count($group['sections']) === 1 ? ' is-single' : '' ?>" role="menu">
                <a class="nav-dropdown-all" href="<?= cz_h($group['href']) ?>">View all <?= cz_h($group['label']) ?></a>
                <?php foreach ($group['sections'] as $section): ?>
                  <div class="nav-dropdown-section">
                    <?php if (count($group['sections']) > 1): ?>
                      <a class="nav-dropdown-heading" href="<?= cz_h($section['href']) ?>"><?= cz_h($section['label']) ?></a>
                    <?php endif; ?>
                    <?php foreach ($section['items'] as $item): ?>
                      <a role="menuitem" href="<?= cz_h($item['href']) ?>"><?= cz_h($item['name']) ?></a>
                    <?php endforeach; ?>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>
          <?php endforeach; ?>
          <a href="<?= cz_url() ?>#tools">All tools</a>
          <a href="<?= cz_url('about') ?>"<?= $active === 'about' ? ' class="is-active"' : '' ?>>About</a>
          <a href="<?= cz_url('contact') ?>"<?= $active === 'contact' ? ' class="is-active"' : '' ?>>Contact</a>
        </nav>
      </div>
    </div>
  </header>
    <?php
}

function cz_render_footer(): void
{
    global $appName, $assetBase, $year, $domain;
    ?>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <a class="logo" href="<?= cz_url() ?>">
          <img src="<?= $assetBase ?>/img/logo.svg?v=2" alt="<?= $appName ?>" width="42" height="42" />
          <span class="logo-text">Tools<span>In</span>Flow</span>
        </a>
        <p>Free online tools for images, PDFs, and more at <?= $domain ?>. Open a tool, drop a file, download the result.</p>
      </div>
      <div class="footer-links">
        <a href="<?= cz_url() ?>#image-tools">Image tools</a>
        <a href="<?= cz_url() ?>#pdf">PDF tools</a>
        <a href="<?= cz_url() ?>#tools">All tools</a>
        <a href="<?= cz_url('about') ?>">About</a>
        <a href="<?= cz_url('contact') ?>">Contact</a>
        <a href="<?= cz_url('privacy') ?>">Privacy</a>
        <a href="<?= cz_url('terms') ?>">Terms</a>
      </div>
      <p class="copyright">© <?= $year ?> <?= $appName ?>. All rights reserved.</p>
    </div>
  </footer>
  <div class="cookie-bar" id="cookieBar" hidden>
    <p>We use cookies for preferences and future ads. <a href="<?= cz_url('privacy') ?>">Privacy Policy</a>.</p>
    <button type="button" class="primary" id="cookieAccept">OK</button>
  </div>
  <div class="cursor-dot" id="cursorDot" aria-hidden="true"></div>
  <div class="cursor-ring" id="cursorRing" aria-hidden="true"></div>
  <script>
    window.TOOLS_INDEX = <?= json_encode(cz_tools_index(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;
  </script>
  <script src="<?= $assetBase ?>/js/tool-search.js?v=2"></script>
    <?php
}
