<?php
declare(strict_types=1);
require dirname(__DIR__) . '/includes/site.php';
$updated = 'July 31, 2026';
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <?php cz_render_head(
      'Privacy Policy | ToolsInFlow',
      'Read the ToolsInFlow Privacy Policy: how we handle cookies, Google AdSense advertising, local browser processing, and your data rights.',
      '/privacy'
  ); ?>
</head>
<body>
  <?php cz_render_header(); ?>
  <main class="container legal-page">
    <h1>Privacy Policy</h1>
    <p><strong>Website:</strong> <a href="https://<?= $domain ?>">https://<?= $domain ?></a><br />
    <strong>Last updated:</strong> <?= cz_h($updated) ?></p>

    <p>ToolsInFlow (“we”, “us”, or “our”) operates <?= $domain ?> and related pages (the “Service”). This Privacy Policy explains what information we collect, how we use it, and your choices. It is written to support transparency requirements commonly expected for websites that use Google AdSense and similar advertising partners.</p>

    <h2>1. Who we are</h2>
    <p>ToolsInFlow provides a free online toolkit for images, PDFs, and everyday file jobs. Compress, convert, resize, crop, background removal, blur faces, Image to SVG, PDF form creation, PDF to Word, and related utilities. For questions about this policy, contact us at <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a>.</p>

    <h2>2. Summary</h2>
    <ul>
      <li>Most tools process files in your browser on your device.</li>
      <li>We do not ask you to create an account to use the tools.</li>
      <li>We may use cookies and similar technologies for preferences, analytics, and advertising (including Google AdSense when enabled).</li>
      <li>Advertising partners may collect data to show personalized or non-personalized ads, subject to your consent and local law.</li>
    </ul>

    <h2>3. Information we collect</h2>
    <h3>3.1 Information you provide</h3>
    <p>If you contact us (for example through the contact form or email), we receive the details you submit, such as your name, email address, and message content. We use this only to respond to your inquiry and improve the Service.</p>

    <h3>3.2 Images and files you process</h3>
    <p>For most tools, image processing happens locally in your browser. In those cases, your image files are not uploaded to our servers for storage. Some features may temporarily download AI models or libraries from third-party CDNs to your browser so processing can run on your device. We do not operate a permanent gallery of user uploads.</p>
    <p>You are responsible for only processing images you own or have permission to edit.</p>

    <h3>3.3 Automatically collected technical data</h3>
    <p>Like most websites, our servers or hosting provider may automatically log standard technical information such as IP address, browser type, device type, referring URL, pages visited, date/time, and approximate location derived from IP. This helps with security, abuse prevention, debugging, and performance.</p>

    <h3>3.4 Local storage and preferences</h3>
    <p>We may store small preference values in your browser (for example theme preference or cookie consent acknowledgment) using cookies or local storage. These help the site remember your settings.</p>

    <h2>4. Cookies and similar technologies</h2>
    <p>Cookies are small text files stored on your device. We and our partners may use:</p>
    <ul>
      <li><strong>Essential / functional cookies:</strong> needed for basic site operation and remembering preferences.</li>
      <li><strong>Analytics cookies:</strong> to understand how visitors use the site (if analytics is enabled).</li>
      <li><strong>Advertising cookies:</strong> used by Google and other ad partners to deliver, measure, and improve ads, including frequency capping and interest-based advertising where permitted.</li>
    </ul>
    <p>You can control cookies through your browser settings and, where shown, through our cookie notice. Blocking some cookies may affect site features or ad personalization.</p>

    <h2>5. Google AdSense and advertising</h2>
    <p>We may display advertisements on <?= $domain ?> using Google AdSense and/or other advertising networks.</p>
    <p>Google, as a third-party vendor, uses cookies to serve ads based on a user’s prior visits to this website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the Internet.</p>
    <p>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>. Alternatively, you can opt out of some third-party vendors’ use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">www.aboutads.info</a>.</p>
    <p>We may also use non-personalized ads in certain regions or when consent for personalized ads is not granted. Non-personalized ads still use cookies for frequency capping, aggregated reporting, and fraud prevention.</p>
    <p>For more information about how Google uses data, see <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">How Google uses information from sites or apps that use our services</a>.</p>

    <h2>6. How we use information</h2>
    <p>We use information to:</p>
    <ul>
      <li>Operate, maintain, and improve the Service</li>
      <li>Respond to support requests</li>
      <li>Measure traffic and performance</li>
      <li>Detect fraud, abuse, and security issues</li>
      <li>Display advertising and measure ad performance (when ads are enabled)</li>
      <li>Comply with legal obligations</li>
    </ul>

    <h2>7. Legal bases (EEA/UK users)</h2>
    <p>Where applicable law requires a legal basis, we rely on one or more of the following: performance of a service you request, our legitimate interests in operating a secure website, compliance with legal obligations, and consent (for example for non-essential cookies or personalized advertising where required).</p>

    <h2>8. Sharing of information</h2>
    <p>We do not sell your personal information. We may share information with:</p>
    <ul>
      <li><strong>Service providers / hosting:</strong> companies that host the website or help us operate it</li>
      <li><strong>Advertising partners:</strong> such as Google AdSense, which may collect data via cookies and similar technologies as described above</li>
      <li><strong>Legal authorities:</strong> when required by law or to protect rights, safety, and security</li>
    </ul>

    <h2>9. Data retention</h2>
    <p>Contact messages are kept only as long as needed to respond and for reasonable business records. Server logs are retained for a limited period for security and operations. Browser-side preference data remains until you clear it.</p>

    <h2>10. Children’s privacy</h2>
    <p>The Service is not directed to children under 13 (or the minimum age required in your country). We do not knowingly collect personal information from children. If you believe a child has provided personal information, contact us and we will take appropriate steps.</p>

    <h2>11. International transfers</h2>
    <p>Our hosting and partners may process data in countries other than your own. Where required, we take steps designed to ensure appropriate safeguards for such transfers.</p>

    <h2>12. Your rights and choices</h2>
    <p>Depending on your location, you may have rights to access, correct, delete, or restrict certain personal data, and to object to or withdraw consent for certain processing. To exercise a request, email <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a>. You may also control cookies in your browser and ad personalization settings as linked above.</p>

    <h2>13. Security</h2>
    <p>We use reasonable technical and organizational measures to protect the Service. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

    <h2>14. Third-party links and libraries</h2>
    <p>The Service may load scripts, fonts, models, or libraries from third-party CDNs to power tools in your browser. Those providers have their own privacy practices. The Service may also contain links to other websites. We are not responsible for third-party privacy practices.</p>

    <h2>15. Changes to this policy</h2>
    <p>We may update this Privacy Policy from time to time. The “Last updated” date at the top will change when we do. Continued use of the Service after changes means you acknowledge the updated policy.</p>

    <h2>16. Contact</h2>
    <p>ToolsInFlow<br />
    Website: <a href="https://<?= $domain ?>">https://<?= $domain ?></a><br />
    Email: <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a></p>
  </main>
  <?php cz_render_footer(); ?>
  <script src="<?= $assetBase ?>/js/app.js?v=41"></script>
</body>
</html>
