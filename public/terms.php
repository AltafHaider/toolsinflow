<?php
declare(strict_types=1);
require dirname(__DIR__) . '/includes/site.php';
$updated = 'July 31, 2026';
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <?php cz_render_head(
      'Terms of Service | ToolsInFlow',
      'Terms of Service for ToolsInFlow free online tools for images, PDFs, and everyday file jobs, including acceptable use, advertising, disclaimers, and liability limits.',
      '/terms'
  ); ?>
</head>
<body>
  <?php cz_render_header(); ?>
  <main class="container legal-page">
    <h1>Terms of Service</h1>
    <p><strong>Website:</strong> <a href="https://<?= $domain ?>">https://<?= $domain ?></a><br />
    <strong>Last updated:</strong> <?= cz_h($updated) ?></p>

    <p>Welcome to ToolsInFlow. These Terms of Service (“Terms”) govern your access to and use of <?= $domain ?> and related pages (the “Service”). By using the Service, you agree to these Terms. If you do not agree, do not use the Service.</p>

    <h2>1. The Service</h2>
    <p>ToolsInFlow provides free online tools for images, PDFs, and everyday file jobs. These may include compressing, converting, resizing, cropping, rotating, flipping, background removal, face blur, Image to SVG, Images to PDF, PDF form creation, PDF to Word, and similar utilities. Features may change, be added, or be removed at any time without notice.</p>

    <h2>2. Eligibility</h2>
    <p>You must be able to form a binding contract under applicable law to use the Service. If you use the Service on behalf of an organization, you represent that you have authority to bind that organization.</p>

    <h2>3. Acceptable use</h2>
    <p>You agree to use the Service only for lawful purposes. You must not:</p>
    <ul>
      <li>Upload or process images you do not have rights to use</li>
      <li>Use the Service to create, distribute, or promote illegal, harmful, abusive, hateful, or infringing content</li>
      <li>Attempt to disrupt, overload, reverse engineer, or compromise the Service or related infrastructure</li>
      <li>Use automated scraping in a way that harms site availability or violates these Terms</li>
      <li>Misrepresent your identity when contacting support</li>
      <li>Use the Service in violation of export, privacy, or intellectual property laws</li>
    </ul>
    <p>We may suspend or block access if we reasonably believe these Terms have been violated.</p>

    <h2>4. Your content and responsibility</h2>
    <p>You retain ownership of images and files you process. You are solely responsible for the content you process and for ensuring you have all necessary rights and permissions. Most tools process files in your browser; you remain responsible for outputs you download and how you use them.</p>

    <h2>5. Intellectual property</h2>
    <p>The Service, including branding, logos, layout, text, and software we provide, is owned by ToolsInFlow or its licensors and is protected by intellectual property laws. You may not copy, modify, or redistribute our branding or site materials except as allowed by law or with written permission.</p>

    <h2>6. Advertising</h2>
    <p>The Service may display third-party advertisements, including Google AdSense. Ads may be personalized or non-personalized depending on consent settings and regional requirements. Advertising partners may use cookies and similar technologies as described in our <a href="<?= cz_url('privacy') ?>">Privacy Policy</a>. We are not responsible for advertiser websites, offers, or products.</p>

    <h2>7. No warranties</h2>
    <p>The Service is provided “as is” and “as available” without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, title, and non-infringement. We do not warrant that tools will be uninterrupted, error-free, or that outputs will meet your requirements or be suitable for professional, medical, legal, or safety-critical use.</p>
    <p>Image processing quality depends on your device, browser, file quality, and third-party libraries/models loaded in the browser.</p>

    <h2>8. Limitation of liability</h2>
    <p>To the maximum extent permitted by law, ToolsInFlow and its operators will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or any loss of profits, data, goodwill, or business opportunities, arising from your use of the Service.</p>
    <p>To the maximum extent permitted by law, our total liability for any claim related to the Service will not exceed the greater of (a) the amount you paid us for the Service in the 12 months before the claim (if any), or (b) USD $50.</p>

    <h2>9. Indemnity</h2>
    <p>You agree to defend, indemnify, and hold harmless ToolsInFlow and its operators from claims, damages, losses, and expenses (including reasonable legal fees) arising out of your use of the Service, your content, or your violation of these Terms or applicable law.</p>

    <h2>10. Third-party services</h2>
    <p>The Service may depend on third-party CDNs, fonts, libraries, AI models, or advertising platforms. We do not control those services and are not responsible for their availability, accuracy, or policies.</p>

    <h2>11. Privacy</h2>
    <p>Your use of the Service is also governed by our <a href="<?= cz_url('privacy') ?>">Privacy Policy</a>, which explains cookies, advertising data practices, and local processing.</p>

    <h2>12. Termination</h2>
    <p>We may stop providing the Service or restrict access at any time. Provisions that by nature should survive (including ownership, disclaimers, limitations of liability, and indemnity) will survive termination.</p>

    <h2>13. Changes to the Terms</h2>
    <p>We may update these Terms from time to time. The “Last updated” date will change when we do. Continued use after changes means you accept the updated Terms.</p>

    <h2>14. Governing law</h2>
    <p>These Terms are governed by the laws applicable in the jurisdiction where the Service operator is established, without regard to conflict-of-law principles, except where mandatory consumer protections in your country apply.</p>

    <h2>15. Contact</h2>
    <p>Questions about these Terms:<br />
    Email: <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a><br />
    Website: <a href="https://<?= $domain ?>">https://<?= $domain ?></a></p>
  </main>
  <?php cz_render_footer(); ?>
  <script src="<?= $assetBase ?>/js/app.js?v=41"></script>
</body>
</html>
