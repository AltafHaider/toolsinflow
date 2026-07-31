<?php
declare(strict_types=1);
require dirname(__DIR__) . '/includes/site.php';

$sent = false;
$error = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $name = trim((string) ($_POST['name'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $message = trim((string) ($_POST['message'] ?? ''));
    if ($name === '' || $email === '' || $message === '') {
        $error = 'Please fill in all fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email.';
    } else {
        @mail($contactEmail, 'ToolsInFlow contact', "Name: {$name}\nEmail: {$email}\n\n{$message}\n", 'Reply-To: ' . $email);
        $sent = true;
    }
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <?php cz_render_head(
      'Contact ToolsInFlow | Support',
      'Contact ToolsInFlow support for feedback, privacy questions, partnership requests, or help with free online tools for images, PDFs, and everyday file jobs.',
      '/contact'
  ); ?>
</head>
<body>
  <?php cz_render_header('contact'); ?>
  <main class="container legal-page">
    <h1>Contact ToolsInFlow</h1>
    <p>Have a question about our free online tools for images, PDFs, and everyday file jobs, privacy practices, or advertising on <strong>toolsinflow.com</strong>? Send a message and we will get back to you when possible.</p>
    <p>Email us directly: <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a></p>

    <?php if ($sent): ?>
      <p style="color:var(--accent);font-weight:700">Thanks, your message was received.</p>
    <?php else: ?>
      <?php if ($error): ?><p style="color:var(--danger);font-weight:700"><?= cz_h($error) ?></p><?php endif; ?>
      <form class="contact-form" method="post">
        <label>Name <input name="name" required maxlength="120" autocomplete="name" /></label>
        <label>Email <input type="email" name="email" required maxlength="180" autocomplete="email" /></label>
        <label>Message <textarea name="message" rows="6" required maxlength="4000" placeholder="How can we help?"></textarea></label>
        <button class="primary" type="submit">Send message</button>
      </form>
    <?php endif; ?>

    <h2>Helpful links</h2>
    <ul>
      <li><a href="<?= cz_url('privacy') ?>">Privacy Policy</a></li>
      <li><a href="<?= cz_url('terms') ?>">Terms of Service</a></li>
      <li><a href="<?= cz_url() ?>#tools">All tools</a></li>
    </ul>
  </main>
  <?php cz_render_footer(); ?>
  <script src="<?= $assetBase ?>/js/app.js?v=41"></script>
</body>
</html>
