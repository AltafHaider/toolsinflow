<?php
declare(strict_types=1);

/**
 * ToolsInFlow: free online toolkit for images, PDFs, and more (toolsinflow.com)
 */
return [
    'app_name'      => 'ToolsInFlow',
    'app_tagline'   => 'Every tool you need, in one flow',
    'domain'        => 'toolsinflow.com',
    'contact_email' => 'contact@toolsinflow.com',
    'base_url'      => '',

    'adsense_client' => '',
    'ads_enabled'    => false,

    'tools' => [
        'pdf-form-creator' => [
            'name' => 'PDF Form Creator',
            'desc' => 'Add fillable fields, labels and signatures to any PDF.',
            'cat'  => 'pdf',
        ],
        'pdf-to-word' => [
            'name' => 'PDF to Word',
            'desc' => 'Convert a text-based PDF into an editable Word document.',
            'cat'  => 'pdf',
        ],
        'word-to-pdf' => [
            'name' => 'Word to PDF',
            'desc' => 'Convert a Word (.docx) document into a PDF. Preview first, then download.',
            'cat'  => 'pdf',
        ],
        'merge-pdf' => [
            'name' => 'Merge PDF',
            'desc' => 'Combine multiple PDF files into one PDF. Preview pages, then download.',
            'cat'  => 'pdf',
        ],
        'split-pdf' => [
            'name' => 'Split PDF',
            'desc' => 'Split a PDF into separate pages or extract a page range. Preview pages first.',
            'cat'  => 'pdf',
        ],
        'compress-pdf' => [
            'name' => 'Compress PDF',
            'desc' => 'Reduce PDF file size by recompressing pages. Preview first, then download.',
            'cat'  => 'pdf',
        ],
        'compress-image' => [
            'name' => 'Compress Image',
            'desc' => 'Reduce image file size by quality or a target KB/MB size. Keeps the full image. No objects are removed.',
            'cat'  => 'optimize',
        ],
        'resize-image' => [
            'name' => 'Resize Image',
            'desc' => 'Change image width and height.',
            'cat'  => 'optimize',
        ],
        'bg-remove' => [
            'name' => 'Background Remover',
            'desc' => 'Remove image background. Optionally add a solid color, or keep transparent.',
            'cat'  => 'edit',
        ],
        'crop-image' => [
            'name' => 'Crop Image',
            'desc' => 'Crop an image to a custom area.',
            'cat'  => 'edit',
        ],
        'rotate-image' => [
            'name' => 'Rotate Image',
            'desc' => 'Rotate images 90°, 180° or 270°.',
            'cat'  => 'edit',
        ],
        'flip-image' => [
            'name' => 'Flip Image',
            'desc' => 'Flip images horizontally or vertically.',
            'cat'  => 'edit',
        ],
        'jpg-to-png' => [
            'name' => 'JPG to PNG',
            'desc' => 'Convert JPG images to PNG.',
            'cat'  => 'convert',
        ],
        'png-to-jpg' => [
            'name' => 'PNG to JPG',
            'desc' => 'Convert PNG images to JPG.',
            'cat'  => 'convert',
        ],
        'to-webp' => [
            'name' => 'Image to WebP',
            'desc' => 'Convert JPG/PNG to WebP.',
            'cat'  => 'convert',
        ],
        'image-to-svg' => [
            'name' => 'Image to SVG',
            'desc' => 'Convert JPG, PNG or WebP images into SVG vector graphics.',
            'cat'  => 'convert',
        ],
        'webp-to-jpg' => [
            'name' => 'WebP to JPG',
            'desc' => 'Convert WebP images to JPG.',
            'cat'  => 'convert',
        ],
        'webp-to-png' => [
            'name' => 'WebP to PNG',
            'desc' => 'Convert WebP images to PNG.',
            'cat'  => 'convert',
        ],
        'png-to-webp' => [
            'name' => 'PNG to WebP',
            'desc' => 'Convert PNG images to WebP.',
            'cat'  => 'convert',
        ],
        'jpg-to-webp' => [
            'name' => 'JPG to WebP',
            'desc' => 'Convert JPG images to WebP.',
            'cat'  => 'convert',
        ],
        'grayscale-image' => [
            'name' => 'Grayscale',
            'desc' => 'Convert images to black and white.',
            'cat'  => 'effects',
        ],
        'blur-faces' => [
            'name' => 'Blur Faces',
            'desc' => 'Auto-blur faces or paint areas to blur. Control blur amount from 10% to 100%.',
            'cat'  => 'edit',
        ],
        'images-to-pdf' => [
            'name' => 'Images to PDF',
            'desc' => 'Combine JPG/PNG/WebP images into one PDF.',
            'cat'  => 'convert',
        ],
        'typing-test' => [
            'name' => 'Typing Test',
            'desc' => 'Typing speed test with random common words or 20 custom paragraphs. Shows CPM, WPM, and accuracy.',
            'cat'  => 'test',
        ],
        'data-entry-test' => [
            'name' => 'Data Entry Test',
            'desc' => '60 or 120 second data entry with street names, sentences, mixed words, codes — plus CPM, WPM, and accuracy.',
            'cat'  => 'test',
        ],
        'mixed-test' => [
            'name' => 'Critical Thinking Test',
            'desc' => 'Critical thinking MCQs with English, Mathematics, and image/pattern questions.',
            'cat'  => 'test',
        ],
    ],

    'categories' => [
        'pdf'      => 'PDF Tools',
        'optimize' => 'Optimize',
        'convert'  => 'Convert',
        'edit'     => 'Edit',
        'effects'  => 'Effects',
        'test'     => 'Typing & Tests',
    ],
];
