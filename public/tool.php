<?php
declare(strict_types=1);
require dirname(__DIR__) . '/includes/site.php';

$tools = $config['tools'];
$id = preg_replace('/[^a-z0-9\-]/', '', strtolower((string) ($_GET['t'] ?? ''))) ?? '';
if ($id === 'blur-image' || $id === 'hide-faces') {
    $id = 'blur-faces';
}
if ($id === '' || !isset($tools[$id])) {
    http_response_code(404);
    $title = 'Tool not found';
    $desc = 'That tool does not exist.';
    $tool = null;
} else {
    $tool = $tools[$id];
    $title = $tool['name'] . ' Free Online | ToolsInFlow';
    $desc = $tool['desc'] . ' Free private browser tool at toolsinflow.com. No signup required.';
}

$needsPdfLib = $id === 'images-to-pdf';
$needsPdfToWord = $id === 'pdf-to-word';
$needsPdfForms = $id === 'pdf-form-creator';
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <?php cz_render_head($title, $desc, $tool ? '/' . rawurlencode($id) : '/'); ?>
  <?php if ($tool && $needsPdfLib): ?>
  <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
  <?php endif; ?>
  <?php if ($tool && $needsPdfToWord): ?>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="https://unpkg.com/docx@8.5.0/build/index.umd.js"></script>
  <?php endif; ?>
  <?php if ($tool && $needsPdfForms): ?>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alex+Brush&amp;family=Allura&amp;family=Caveat:wght@500&amp;family=Dancing+Script:wght@600&amp;family=Great+Vibes&amp;family=Homemade+Apple&amp;family=Italianno&amp;family=Marck+Script&amp;family=Pacifico&amp;family=Parisienne&amp;family=Pinyon+Script&amp;family=Sacramento&amp;family=Satisfy&amp;family=Tangerine:wght@700&amp;family=Yellowtail&amp;display=swap" />
  <?php endif; ?>
</head>
<body>
  <?php cz_render_header(); ?>

  <?php if (!$tool): ?>
    <main class="section container legal-page">
      <h1>Tool not found</h1>
      <p><a href="<?= cz_url() ?>">Back to all tools</a></p>
    </main>
  <?php else: ?>
    <section class="tool-hero container">
      <p class="brand-kicker"><a href="<?= cz_url() ?>#tools">All tools</a></p>
      <h1><?= cz_h($tool['name']) ?></h1>
      <p><?= cz_h($tool['desc']) ?></p>
    </section>

    <?php if ($needsPdfForms): ?>
      <?php require dirname(__DIR__) . '/includes/pdf-form-editor-view.php'; ?>
    <?php else: ?>
    <main class="container">
      <div class="workspace" id="workspace" data-tool="<?= cz_h($id) ?>">
        <div class="dropzone" id="dropzone" tabindex="0">
          <strong><?= $needsPdfToWord ? 'Drop a PDF here or click to choose' : 'Drop images here or click to choose' ?></strong>
          <span id="dropHint"><?= $needsPdfToWord ? 'Normal or scanned PDF files' : 'JPG, PNG or WebP' ?></span>
          <input type="file" id="fileInput" hidden accept="<?= $needsPdfToWord ? 'application/pdf,.pdf' : 'image/*' ?>"<?= $needsPdfToWord ? '' : ' multiple' ?> />
        </div>
        <ul class="file-list" id="fileList"></ul>
        <div class="controls" id="controls"></div>
        <div class="preview-panel" id="resultPreview" hidden>
          <div class="preview-head">
            <h3>Preview</h3>
          </div>
          <div class="preview-stage" id="previewStage"></div>
        </div>
        <div class="actions-bar" id="actionsBar">
          <button type="button" class="primary" id="dlBtnTop" disabled>Download</button>
        </div>
        <p class="status" id="status" role="status"></p>
      </div>
    </main>
    <?php endif; ?>
  <?php endif; ?>

  <?php cz_render_footer(); ?>
  <script src="<?= $assetBase ?>/js/app.js?v=41"></script>
  <?php if ($tool && $needsPdfForms): ?>
  <script src="<?= $assetBase ?>/js/pdf-form-editor.js?v=13"></script>
  <?php elseif ($tool): ?>
  <script src="<?= $assetBase ?>/js/image-core.js?v=20"></script>
  <script src="<?= $assetBase ?>/js/tools.js?v=39"></script>
  <?php endif; ?>
</body>
</html>
