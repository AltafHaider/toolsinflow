<?php
declare(strict_types=1);
require dirname(__DIR__) . '/includes/site.php';
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <?php cz_render_head(
      'About ToolsInFlow | Free Online Toolkit',
      'Meet Altaf Haider and the story behind ToolsInFlow, a free online toolkit for images, PDFs, and everyday file jobs at toolsinflow.com.',
      '/about'
  ); ?>
</head>
<body>
  <?php cz_render_header('about'); ?>
  <main class="container legal-page">
    <h1>About ToolsInFlow</h1>
    <p><strong>ToolsInFlow</strong> is a free online toolkit at <strong>toolsinflow.com</strong>. It brings image tools, PDF tools, and everyday file utilities into one place, fast, private, and without creating an account.</p>

    <h2>About the founder</h2>
    <p>My name is <strong>Altaf Haider</strong>. I am an <strong>AI Software Engineer</strong> and <strong>web developer</strong> focused on building practical products that solve everyday problems with clean design and reliable technology.</p>
    <p>I work at the intersection of artificial intelligence and the web, turning complex ideas into simple tools people can open in a browser and use immediately. With ToolsInFlow, my goal is to make a professional toolkit available to everyone, not only people with expensive software or technical experience.</p>

    <h2>Why I built these tools</h2>
    <p>I created ToolsInFlow because I kept seeing the same frustration: people needed to compress a photo, remove a background, convert a file, or make a PDF fillable, and the options were either slow, full of pop-ups, forced signups, or required uploading private files to unknown servers.</p>
    <p>I wanted something better. Something fast. Something respectful of privacy. Something that feels professional without getting in the way.</p>
    <p>That is why most tools here run directly in your browser. Your files stay on your device while you work, and you can download the result when you are ready. No unnecessary friction. No complicated setup.</p>

    <h2>My passion</h2>
    <p>I am passionate about building software that feels invisible when it works well, with tools that save time, protect user data, and still look polished. AI and modern web technology make that possible: smarter processing on the user’s side, cleaner interfaces, and utilities that scale from students and freelancers to teams and businesses.</p>
    <p>ToolsInFlow is part of that vision: a growing collection of free online tools for images, PDFs, and more, designed with care, privacy, and real-world usefulness in mind.</p>

    <h2>What you can do here</h2>
    <p>Compress and resize images, convert between JPG, PNG and WebP, crop, rotate and flip photos, remove backgrounds, blur faces for privacy, convert images to SVG, create fillable PDF forms, convert PDF to Word, combine images into PDF, and more. New tools continue to be added based on what people actually need.</p>

    <h2>Privacy-first design</h2>
    <p>Most tools process files locally in your browser. That helps keep your files private while you work. Read more in our <a href="<?= cz_url('privacy') ?>">Privacy Policy</a>.</p>

    <h2>Who it is for</h2>
    <p>Creators, students, sellers, marketers, professionals, and anyone who needs quick file fixes on desktop or mobile, without installing software or creating an account.</p>

    <h2>Advertising</h2>
    <p>To keep the tools free, we may show ads (including Google AdSense). Ads help support hosting and ongoing development. Details are in the Privacy Policy and Terms of Service.</p>

    <h2>Contact</h2>
    <p>Questions, feedback, or partnership ideas are welcome. Visit <a href="<?= cz_url('contact') ?>">Contact</a> or email <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a>.</p>
    <p><a href="<?= cz_url() ?>">Browse all free tools</a></p>
  </main>
  <?php cz_render_footer(); ?>
  <script src="<?= $assetBase ?>/js/app.js?v=41"></script>
</body>
</html>
