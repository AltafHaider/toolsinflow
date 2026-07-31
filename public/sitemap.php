<?php
declare(strict_types=1);
header('Content-Type: application/xml; charset=utf-8');
$config = require dirname(__DIR__) . '/includes/config.php';
$base = 'https://' . ($config['domain'] ?? 'toolsinflow.com');
$today = date('Y-m-d');

$static = [
    ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
    ['loc' => '/about', 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => '/contact', 'priority' => '0.6', 'changefreq' => 'monthly'],
    ['loc' => '/privacy', 'priority' => '0.5', 'changefreq' => 'monthly'],
    ['loc' => '/terms', 'priority' => '0.5', 'changefreq' => 'monthly'],
];

$pages = $static;
foreach (array_keys($config['tools'] ?? []) as $id) {
    $pages[] = [
        'loc' => '/' . rawurlencode((string) $id),
        'priority' => '0.9',
        'changefreq' => 'weekly',
    ];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($pages as $p): ?>
  <url>
    <loc><?= htmlspecialchars($base . $p['loc'], ENT_XML1) ?></loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq><?= htmlspecialchars($p['changefreq'], ENT_XML1) ?></changefreq>
    <priority><?= htmlspecialchars($p['priority'], ENT_XML1) ?></priority>
  </url>
<?php endforeach; ?>
</urlset>
