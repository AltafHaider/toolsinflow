<?php
declare(strict_types=1);
require dirname(__DIR__) . '/includes/site.php';

$tools = $config['tools'];
$categories = $config['categories'];
$byCat = [];
foreach ($tools as $id => $tool) {
    $byCat[$tool['cat']][$id] = $tool;
}

$featured = ['study-ppt', 'pdf-form-creator', 'pdf-to-word', 'word-to-pdf', 'bg-remove', 'compress-image'];
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <?php cz_render_head(
      'ToolsInFlow | Free Online Tools for Images, PDFs & More',
      'ToolsInFlow is a free all-in-one online toolkit at toolsinflow.com: images, PDFs, compress, convert, remove backgrounds, fillable forms, PDF to Word, and more. Private browser tools. No signup.',
      '/',
      [
          'json_ld' => [
              '@context' => 'https://schema.org',
              '@type' => 'FAQPage',
              'mainEntity' => [
                  [
                      '@type' => 'Question',
                      'name' => 'Is ToolsInFlow free?',
                      'acceptedAnswer' => [
                          '@type' => 'Answer',
                          'text' => 'Yes. All listed tools on toolsinflow.com are free to use in your browser with no signup required.',
                      ],
                  ],
                  [
                      '@type' => 'Question',
                      'name' => 'Do you store my files?',
                      'acceptedAnswer' => [
                          '@type' => 'Answer',
                          'text' => 'Most tools process files locally in your browser. We do not keep a permanent copy of those uploads on our servers.',
                      ],
                  ],
                  [
                      '@type' => 'Question',
                      'name' => 'What can I do on ToolsInFlow?',
                      'acceptedAnswer' => [
                          '@type' => 'Answer',
                          'text' => 'Compress and convert images, remove backgrounds, blur faces, edit photos, create fillable PDF forms, convert PDF to Word, combine images into PDF, and more.',
                      ],
                  ],
                  [
                      '@type' => 'Question',
                      'name' => 'Can I remove image backgrounds online?',
                      'acceptedAnswer' => [
                          '@type' => 'Answer',
                          'text' => 'Yes. The Background Remover tool can cut out subjects in your browser and optionally apply a solid background color.',
                      ],
                  ],
              ],
          ],
      ]
  ); ?>
</head>
<body>
  <?php cz_render_header(); ?>

  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="brand-kicker"><span class="kicker-dot" aria-hidden="true"></span> Free online toolkit</p>
        <h1>Every tool you need,<br /><em>in one flow</em></h1>
        <p>
          Images, PDFs, convert, compress, remove backgrounds, fillable forms, and more. All free in your browser.
          Fast, private, and ready at <strong>toolsinflow.com</strong>.
        </p>
        <div class="hero-actions">
          <a class="primary" href="#tools">Explore all tools</a>
          <a
            class="ghost hero-rotate-cta"
            id="heroRotateCta"
            href="<?= cz_tool_url('bg-remove') ?>"
            data-rotate-tools='<?= cz_h(json_encode([
                ['label' => 'Remove background', 'href' => cz_tool_url('bg-remove')],
                ['label' => 'Blur faces', 'href' => cz_tool_url('blur-faces')],
                ['label' => 'PDF Form Creator', 'href' => cz_tool_url('pdf-form-creator')],
                ['label' => 'PDF to Word', 'href' => cz_tool_url('pdf-to-word')],
                ['label' => 'Word to PDF', 'href' => cz_tool_url('word-to-pdf')],
                ['label' => 'Compress image', 'href' => cz_tool_url('compress-image')],
                ['label' => 'Image to SVG', 'href' => cz_tool_url('image-to-svg')],
            ], JSON_UNESCAPED_SLASHES)) ?>'
          >Remove background</a>
        </div>
        <ul class="hero-stats" aria-label="Highlights">
          <li><strong>20+</strong><span>free tools</span></li>
          <li><strong>0</strong><span>signups</span></li>
          <li><strong>100%</strong><span>in-browser</span></li>
        </ul>
      </div>

      <div class="hero-visual" id="heroVisual" aria-hidden="true">
        <div class="mouse-glow" id="mouseGlow"></div>
        <div class="hero-stage" id="heroStage">
          <div class="toolkit">
            <div class="toolkit-frame">
              <div class="toolkit-chrome">
                <span></span><span></span><span></span>
                <em>Live preview</em>
              </div>
              <div class="toolkit-modes">
                <div class="mode mode--photo is-active" data-mode="0">
                  <div class="scene scene-photo">
                    <div class="scene-media scene-media--after" style="background-image:url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&amp;fit=crop&amp;w=720&amp;q=80')"></div>
                    <div class="scene-media scene-media--before" style="background-image:url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&amp;fit=crop&amp;w=720&amp;q=80')"></div>
                    <span class="scene-chip scene-chip--left">Before</span>
                    <span class="scene-chip scene-chip--right">After</span>
                    <span class="scene-tag">BG remove</span>
                  </div>
                  <span class="mode-badge">Transparent PNG</span>
                </div>

                <div class="mode mode--compress" data-mode="1">
                  <div class="scene scene-compress">
                    <div class="scene-shot scene-shot--fat">
                      <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&amp;fit=crop&amp;w=480&amp;q=80" alt="" loading="lazy" />
                      <strong>4.8 MB</strong>
                    </div>
                    <div class="scene-flow-arrows" aria-hidden="true">→</div>
                    <div class="scene-shot scene-shot--slim">
                      <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&amp;fit=crop&amp;w=480&amp;q=70" alt="" loading="lazy" />
                      <strong>1.5 MB</strong>
                    </div>
                    <div class="scene-meter"><i></i></div>
                  </div>
                  <span class="mode-badge">-68% size</span>
                </div>

                <div class="mode mode--convert" data-mode="2">
                  <div class="scene scene-convert">
                    <div class="scene-shot scene-shot--fmt">
                      <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&amp;fit=crop&amp;w=480&amp;q=80" alt="" loading="lazy" />
                      <em>JPG</em>
                    </div>
                    <div class="scene-cvt-spin" aria-hidden="true"></div>
                    <div class="scene-shot scene-shot--fmt is-out">
                      <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&amp;fit=crop&amp;w=480&amp;q=80" alt="" loading="lazy" />
                      <em>WebP</em>
                    </div>
                  </div>
                  <span class="mode-badge">Convert ready</span>
                </div>

                <div class="mode mode--edit" data-mode="3">
                  <div class="scene scene-edit">
                    <div class="scene-media scene-media--edit" style="background-image:url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&amp;fit=crop&amp;w=720&amp;q=80')">
                      <div class="scene-crop-ui">
                        <i></i><i></i><i></i><i></i>
                      </div>
                    </div>
                    <div class="scene-tools">
                      <span>Crop</span><span>Rotate</span><span>Flip</span>
                    </div>
                  </div>
                  <span class="mode-badge">Edit tools</span>
                </div>

                <div class="mode mode--effects" data-mode="4">
                  <div class="scene scene-blur">
                    <div class="scene-media scene-media--blur" style="background-image:url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&amp;fit=crop&amp;w=720&amp;q=80')"></div>
                    <span class="scene-face-box scene-face-box--a"></span>
                    <span class="scene-face-box scene-face-box--b is-blurred"></span>
                    <span class="scene-face-box scene-face-box--c is-blurred"></span>
                    <span class="scene-scanline"></span>
                  </div>
                  <span class="mode-badge">Blur faces</span>
                </div>

                <div class="mode mode--pdf" data-mode="5">
                  <div class="scene scene-pdf">
                    <div class="scene-doc scene-doc--back"></div>
                    <div class="scene-doc scene-doc--mid">
                      <b>FORM</b>
                      <span></span><span></span>
                      <i class="scene-field"></i>
                    </div>
                    <div class="scene-doc scene-doc--front">
                      <b>WORD</b>
                      <span></span><span></span><span></span>
                      <em class="scene-signature"></em>
                    </div>
                    <div class="scene-pen" aria-hidden="true"></div>
                  </div>
                  <span class="mode-badge">PDF toolkit</span>
                </div>
              </div>
              <div class="toolkit-caption" id="toolkitCaption">Remove backgrounds in your browser</div>
            </div>
            <span class="orbit-chip" data-tilt style="--i:0">BG Remove</span>
            <span class="orbit-chip" data-tilt style="--i:1">Compress</span>
            <span class="orbit-chip" data-tilt style="--i:2">Convert</span>
            <span class="orbit-chip" data-tilt style="--i:3">Edit</span>
            <span class="orbit-chip" data-tilt style="--i:4">Blur faces</span>
            <span class="orbit-chip" data-tilt style="--i:5">PDF tools</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section container" id="popular">
    <h2>Popular tools</h2>
    <p class="section-lede">Start with the tools people use most. Open one and drop in your files.</p>
    <div class="tools-grid">
      <?php foreach ($featured as $id): ?>
        <?php if (empty($tools[$id])) continue; ?>
        <?php $tool = $tools[$id]; ?>
        <a class="tool-card" href="<?= cz_tool_url($id) ?>">
          <?= cz_tool_icon($id) ?>
          <strong><?= cz_h($tool['name']) ?></strong>
          <span><?= cz_h($tool['desc']) ?></span>
        </a>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="section section-alt" id="howSection">
    <div class="mouse-glow" id="howGlow"></div>
    <div class="container how-grid">
      <div>
        <h2>How it works</h2>
        <p class="section-lede">Three simple steps. No account, and no upload to our servers for most tools.</p>
        <ol class="steps">
          <li>
            <strong>Pick a tool</strong>
            <span>Choose compress, convert, edit, effects, PDF utilities, or background remover.</span>
          </li>
          <li>
            <strong>Add your files</strong>
            <span>Drop images or PDFs. Processing happens in your browser.</span>
          </li>
          <li>
            <strong>Preview &amp; download</strong>
            <span>Check the result, then download. Keep the originals on your device.</span>
          </li>
        </ol>
      </div>
      <div class="flow-visual" id="flowVisual" aria-hidden="true">
        <div class="flow-card flow-card--in" data-tilt>
          <span class="flow-label">Any file</span>
          <div class="flow-pic flow-pic--multi"></div>
          <span class="flow-sub">JPG, PNG, WebP, PDF</span>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-card flow-card--process" data-tilt>
          <span class="flow-pulse"></span>
          <span class="flow-label">In flow</span>
          <span class="flow-sub">Compress, Convert, Edit</span>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-card flow-card--out" data-tilt>
          <span class="flow-label">Your result</span>
          <div class="flow-pic flow-pic--result"></div>
          <span class="flow-sub">JPG, PNG, WebP, PDF</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section container" id="tools">
    <h2>All tools</h2>
    <p class="section-lede">Every utility in one place, organized by what you need to do.</p>

    <div class="tools-search-bar" data-tools-page-search>
      <label class="tools-search-field">
        <span class="sr-only">Filter tools</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input type="search" id="toolsPageSearch" placeholder="Search tools by name or job..." autocomplete="off" spellcheck="false" />
      </label>
      <p class="tools-search-empty" id="toolsSearchEmpty" hidden>No tools match that search. Try compress, PDF, blur, or PPT.</p>
    </div>

    <?php
      $imageCats = ['optimize', 'convert', 'edit', 'effects'];
      $pdfCats = ['pdf'];
      $studyCats = ['study'];
    ?>

    <div class="tools-group" id="pdf">
      <h3 class="group-title">PDF tools</h3>
      <?php foreach ($pdfCats as $catId): ?>
        <?php if (empty($byCat[$catId])) continue; ?>
        <div class="tools-grid">
          <?php foreach ($byCat[$catId] as $id => $tool): ?>
            <a class="tool-card" href="<?= cz_tool_url($id) ?>">
              <?= cz_tool_icon($id) ?>
              <strong><?= cz_h($tool['name']) ?></strong>
              <span><?= cz_h($tool['desc']) ?></span>
            </a>
          <?php endforeach; ?>
        </div>
      <?php endforeach; ?>
    </div>

    <div class="tools-group" id="study">
      <h3 class="group-title">Study tools</h3>
      <?php foreach ($studyCats as $catId): ?>
        <?php if (empty($byCat[$catId])) continue; ?>
        <div class="tools-grid">
          <?php foreach ($byCat[$catId] as $id => $tool): ?>
            <a class="tool-card" href="<?= cz_tool_url($id) ?>">
              <?= cz_tool_icon($id) ?>
              <strong><?= cz_h($tool['name']) ?></strong>
              <span><?= cz_h($tool['desc']) ?></span>
            </a>
          <?php endforeach; ?>
        </div>
      <?php endforeach; ?>
    </div>

    <div class="tools-group" id="image-tools">
      <h3 class="group-title">Image tools</h3>
      <?php foreach ($imageCats as $catId): ?>
        <?php if (empty($byCat[$catId])) continue; ?>
        <h4 class="cat-title" id="<?= cz_h($catId) ?>"><?= cz_h($categories[$catId] ?? $catId) ?></h4>
        <div class="tools-grid">
          <?php foreach ($byCat[$catId] as $id => $tool): ?>
            <a class="tool-card" href="<?= cz_tool_url($id) ?>">
              <?= cz_tool_icon($id) ?>
              <strong><?= cz_h($tool['name']) ?></strong>
              <span><?= cz_h($tool['desc']) ?></span>
            </a>
          <?php endforeach; ?>
        </div>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <h2>Why ToolsInFlow?</h2>
      <p class="section-lede">One place for the everyday jobs that used to need five different websites.</p>
      <div class="tools-grid">
        <div class="tool-card">
          <strong>All tools, one home</strong>
          <span>Images, PDFs, convert, compress, privacy blur, forms. Pick what you need and go.</span>
        </div>
        <div class="tool-card">
          <strong>Browser-private</strong>
          <span>Most tools run on your device. Files are not uploaded to our server.</span>
        </div>
        <div class="tool-card">
          <strong>AI-powered extras</strong>
          <span>Background remover and smart helpers when a plain edit is not enough.</span>
        </div>
        <div class="tool-card">
          <strong>No friction</strong>
          <span>Works on phone and desktop. No signup. Preview before you download.</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section container" id="faq">
    <h2>Quick answers</h2>
    <p class="section-lede">Common questions about using ToolsInFlow.</p>
    <div class="faq-list">
      <details class="faq-item" open>
        <summary>Is ToolsInFlow free?</summary>
        <p>Yes. All listed tools on toolsinflow.com are free to use in your browser with no signup required.</p>
      </details>
      <details class="faq-item">
        <summary>Do you store my files?</summary>
        <p>Most tools process files locally on your device. We do not keep a permanent copy of those uploads on our servers. See our Privacy Policy for cookies and advertising details.</p>
      </details>
      <details class="faq-item">
        <summary>What can I do here?</summary>
        <p>Compress and convert images, remove backgrounds, blur faces, create fillable PDF forms, convert PDF to Word, combine images into PDF, and more, all in one toolkit.</p>
      </details>
      <details class="faq-item">
        <summary>Can I remove backgrounds online?</summary>
        <p>Yes. Use Background Remover to cut out subjects in your browser, keep transparency, or optionally add a solid background color.</p>
      </details>
      <details class="faq-item">
        <summary>How do I blur faces for privacy?</summary>
        <p>Open Blur Faces, choose Auto faces or Manual brush, set blur amount from 10% to 100%, then download the result.</p>
      </details>
      <details class="faq-item">
        <summary>What is ToolsInFlow?</summary>
        <p>ToolsInFlow is a free online toolkit at toolsinflow.com for images, PDFs, and everyday file jobs. Every tool you need, in one flow.</p>
      </details>
    </div>
  </section>

  <?php cz_render_footer(); ?>
  <script src="<?= $assetBase ?>/js/app.js?v=41"></script>
</body>
</html>
