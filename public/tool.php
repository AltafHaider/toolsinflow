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

$needsPdfLib = $id === 'images-to-pdf' || $id === 'merge-pdf';
$needsPdfToWord = $id === 'pdf-to-word';
$needsWordToPdf = $id === 'word-to-pdf';
$needsMergePdf = $id === 'merge-pdf';
$needsPdfForms = $id === 'pdf-form-creator';
$needsStudyPpt = $id === 'study-ppt';
$isDocExchange = $needsPdfToWord || $needsWordToPdf;
$isPdfUpload = $needsPdfToWord || $needsMergePdf;
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
  <?php if ($tool && $needsWordToPdf): ?>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <?php endif; ?>
  <?php if ($tool && $needsPdfForms): ?>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alex+Brush&amp;family=Allura&amp;family=Caveat:wght@500&amp;family=Dancing+Script:wght@600&amp;family=Great+Vibes&amp;family=Homemade+Apple&amp;family=Italianno&amp;family=Marck+Script&amp;family=Pacifico&amp;family=Parisienne&amp;family=Pinyon+Script&amp;family=Sacramento&amp;family=Satisfy&amp;family=Tangerine:wght@700&amp;family=Yellowtail&amp;display=swap" />
  <?php endif; ?>
  <?php if ($tool && $needsStudyPpt): ?>
  <script src="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js"></script>
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
    <?php elseif ($needsStudyPpt): ?>
      <?php require dirname(__DIR__) . '/includes/study-ppt-view.php'; ?>
    <?php else: ?>
    <main class="container">
      <div class="workspace" id="workspace" data-tool="<?= cz_h($id) ?>">
        <div class="dropzone" id="dropzone" tabindex="0">
          <strong><?php
            if ($needsMergePdf) {
                echo 'Drop PDF files here or click to choose';
            } elseif ($needsPdfToWord) {
                echo 'Drop a PDF here or click to choose';
            } elseif ($needsWordToPdf) {
                echo 'Drop a Word file here or click to choose';
            } else {
                echo 'Drop images here or click to choose';
            }
          ?></strong>
          <span id="dropHint"><?php
            if ($needsMergePdf) {
                echo 'Select two or more PDF files';
            } elseif ($needsPdfToWord) {
                echo 'Normal or scanned PDF files';
            } elseif ($needsWordToPdf) {
                echo 'Word .docx files';
            } else {
                echo 'JPG, PNG or WebP';
            }
          ?></span>
          <input type="file" id="fileInput" hidden accept="<?php
            if ($isPdfUpload) {
                echo 'application/pdf,.pdf';
            } elseif ($needsWordToPdf) {
                echo '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else {
                echo 'image/*';
            }
          ?>"<?= $isDocExchange ? '' : ' multiple' ?> />
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
  <script src="<?= $assetBase ?>/js/app.js?v=42"></script>
  <?php if ($tool && $needsPdfForms): ?>
  <script src="<?= $assetBase ?>/js/pdf-form-editor.js?v=13"></script>
  <?php elseif ($tool && $needsStudyPpt): ?>
  <script src="<?= $assetBase ?>/js/study-ppt.js?v=1"></script>
  <?php elseif ($tool): ?>
  <script src="<?= $assetBase ?>/js/image-core.js?v=21"></script>
  <script src="<?= $assetBase ?>/js/tools.js?v=42"></script>
  <?php endif; ?>
</body>
</html>
