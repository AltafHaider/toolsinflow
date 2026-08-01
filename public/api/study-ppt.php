<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required.']);
    exit;
}

require dirname(__DIR__, 2) . '/includes/env.php';
cz_load_env(dirname(__DIR__, 2) . '/.env');

$apiKey = cz_env('OPENAI_API_KEY');
$model = cz_env('OPENAI_MODEL', 'gpt-4o-mini') ?: 'gpt-4o-mini';

if ($apiKey === null || $apiKey === '' || str_contains($apiKey, 'your-key-here')) {
    http_response_code(503);
    echo json_encode([
        'ok' => false,
        'error' => 'not_configured',
        'message' => 'Add your OpenAI API key to the .env file as OPENAI_API_KEY.',
    ]);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '{}', true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_json', 'message' => 'Invalid request body.']);
    exit;
}

$topic = trim((string) ($input['topic'] ?? ''));
$material = trim((string) ($input['material'] ?? ''));
$slideCount = (int) ($input['slideCount'] ?? 12);
$simpleWords = !empty($input['simpleWords']);

if ($topic === '' && $material === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'missing_topic', 'message' => 'Enter a topic or paste study material.']);
    exit;
}

$slideCount = max(8, min(20, $slideCount));
$contentSlides = max(6, $slideCount - 2); // title + conclusion reserved on client

$topicLabel = $topic !== '' ? $topic : 'Study Topic';
$wordsNote = $simpleWords
    ? 'Use simple words suitable for school students.'
    : 'Use clear academic language suitable for students.';

$materialBlock = $material !== ''
    ? "Study material from the student:\n\"\"\"\n" . mb_substr($material, 0, 6000) . "\n\"\"\"\n"
    : '';

$system = <<<SYS
You are an expert teacher creating accurate, helpful study PowerPoint content.
Return ONLY valid JSON (no markdown fences) with this shape:
{
  "title": "Corrected Topic Title",
  "subtitle": "One professional subtitle",
  "slides": [
    {"title": "Section heading", "bullets": ["fact 1", "fact 2", "fact 3"]}
  ]
}
Rules:
- Correct spelling/grammar of the topic in "title".
- Create a topic-specific outline (not a generic template).
- First content slide must be "Introduction" or "What is <Topic>?".
- Last content slide must be "Conclusion".
- Include {$contentSlides} content slides (not counting a separate title slide).
- Each slide: 3 to 5 short bullet points with real, useful facts.
- Never write filler like "helps students understand" or repeat the heading as the bullet.
- Keep every bullet relevant to its heading and the topic.
- {$wordsNote}
SYS;

$user = <<<USR
Topic: {$topicLabel}
Requested content slides: {$contentSlides}
{$materialBlock}
Build a complete student study presentation for this topic.
USR;

$payload = [
    'model' => $model,
    'temperature' => 0.4,
    'response_format' => ['type' => 'json_object'],
    'messages' => [
        ['role' => 'system', 'content' => $system],
        ['role' => 'user', 'content' => $user],
    ],
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_CONNECTTIMEOUT => 20,
    CURLOPT_TIMEOUT => 90,
]);

$responseBody = curl_exec($ch);
$curlError = curl_error($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($responseBody === false) {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'network',
        'message' => 'Could not reach ChatGPT: ' . ($curlError ?: 'network error'),
    ]);
    exit;
}

$data = json_decode($responseBody, true);
if ($status < 200 || $status >= 300) {
    $apiMessage = is_array($data) ? (string) ($data['error']['message'] ?? 'OpenAI request failed.') : 'OpenAI request failed.';
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'openai_error',
        'message' => $apiMessage,
    ]);
    exit;
}

$content = (string) ($data['choices'][0]['message']['content'] ?? '');
$deck = json_decode($content, true);
if (!is_array($deck) || empty($deck['slides']) || !is_array($deck['slides'])) {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'bad_response',
        'message' => 'ChatGPT returned an unusable presentation. Please try again.',
    ]);
    exit;
}

$title = trim((string) ($deck['title'] ?? $topicLabel));
$subtitle = trim((string) ($deck['subtitle'] ?? ('A clear study presentation on ' . $title)));
$slides = [];

foreach ($deck['slides'] as $slide) {
    if (!is_array($slide)) {
        continue;
    }
    $slideTitle = trim((string) ($slide['title'] ?? ''));
    $bullets = $slide['bullets'] ?? [];
    if (!is_array($bullets)) {
        continue;
    }
    $cleanBullets = [];
    foreach ($bullets as $bullet) {
        $text = trim((string) $bullet);
        if ($text !== '') {
            $cleanBullets[] = $text;
        }
    }
    if ($slideTitle === '' || !$cleanBullets) {
        continue;
    }
    $slides[] = [
        'title' => $slideTitle,
        'bullets' => array_slice($cleanBullets, 0, 5),
    ];
}

if ($title === '' || count($slides) < 3) {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'thin_response',
        'message' => 'ChatGPT returned too little content. Please try again.',
    ]);
    exit;
}

echo json_encode([
    'ok' => true,
    'title' => $title,
    'subtitle' => $subtitle,
    'slides' => $slides,
    'model' => $model,
], JSON_UNESCAPED_UNICODE);
