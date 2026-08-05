<?php
declare(strict_types=1);
/** @var string $id */
$modeLabel = match ($id) {
    'data-entry-test' => 'Data entry',
    'mixed-test' => 'Aptitude MCQs',
    default => 'Typing speed',
};
$isTyping = $id === 'typing-test';
$isMixed = $id === 'mixed-test';
?>
<main class="container typing-shell" id="typingApp" data-tool="<?= cz_h($id) ?>">
  <section class="typing-panel" id="typingSetup">
    <div class="typing-setup-head">
      <p class="typing-mode-tag"><?= cz_h($modeLabel) ?></p>
      <h2 class="typing-setup-title" id="typingSetupTitle">Ready when you are</h2>
      <p class="typing-setup-copy" id="typingSetupCopy">Pick a duration, then start typing.</p>
    </div>

    <?php if ($isTyping): ?>
    <div class="typing-mode-wrap" id="typingModeWrap">
      <span class="typing-label">Text source</span>
      <div class="typing-modes" id="typingModes" role="group" aria-label="Text source">
        <button type="button" class="typing-mode-btn is-active" data-mode="random">Random text</button>
        <button type="button" class="typing-mode-btn" data-mode="custom">Custom paragraph</button>
      </div>
    </div>

    <div class="typing-paragraph-wrap" id="typingParagraphWrap" hidden>
      <div class="typing-paragraph-head">
        <span class="typing-label">Choose a paragraph</span>
        <span class="typing-paragraph-count">20 options</span>
      </div>
      <div class="typing-paragraph-list" id="typingParagraphList" role="listbox" aria-label="Paragraphs"></div>
      <div class="typing-paragraph-preview" id="typingParagraphPreview" hidden>
        <span class="typing-label">Preview</span>
        <p id="typingParagraphPreviewText"></p>
      </div>
    </div>
    <?php else: ?>
    <div class="typing-paragraph-wrap" id="typingParagraphWrap" hidden>
      <div class="typing-paragraph-list" id="typingParagraphList"></div>
      <div class="typing-paragraph-preview" id="typingParagraphPreview" hidden>
        <p id="typingParagraphPreviewText"></p>
      </div>
    </div>
    <?php endif; ?>

    <div class="typing-duration-wrap" id="typingDurationWrap">
      <span class="typing-label" id="typingDurationLabel">Duration</span>
      <div class="typing-durations" id="typingDurations" role="group" aria-label="Test duration"></div>
    </div>

    <button type="button" class="primary typing-start-btn" id="typingStartBtn">Start test</button>
  </section>

  <section class="typing-panel typing-run" id="typingRun" hidden>
    <div class="typing-stats" aria-live="polite">
      <div class="typing-stat">
        <strong id="statTimer">00:00</strong>
        <span>Time left</span>
      </div>
      <div class="typing-stat">
        <strong id="statWpm">0</strong>
        <span id="statWpmLabel">WPM</span>
      </div>
      <div class="typing-stat">
        <strong id="statAccuracy">100%</strong>
        <span id="statAccuracyLabel">Accuracy</span>
      </div>
      <div class="typing-stat">
        <strong id="statProgress">0</strong>
        <span id="statProgressLabel">Chars</span>
      </div>
    </div>

    <div class="typing-prompt-card" id="typingPromptCard" hidden>
      <span class="typing-prompt-label" id="typingPromptLabel">Enter this value</span>
      <p class="typing-prompt-value" id="typingPromptValue"></p>
    </div>

    <div class="typing-text-wrap" id="typingTextWrap"<?= $isMixed ? ' hidden' : '' ?>>
      <div class="typing-text" id="typingText" aria-hidden="true"></div>
      <textarea
        class="typing-input"
        id="typingInput"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        aria-label="Typing area"
      ></textarea>
    </div>

    <div class="typing-entry-wrap" id="typingEntryWrap" hidden>
      <label class="sr-only" for="typingEntryInput">Type the value shown above</label>
      <input
        type="text"
        class="typing-entry-input"
        id="typingEntryInput"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Type here, then press Enter"
      />
      <button type="button" class="ghost" id="typingSkipBtn">Skip</button>
    </div>

    <div class="mcq-wrap" id="mcqWrap"<?= $isMixed ? '' : ' hidden' ?>>
      <div class="mcq-meta">
        <span class="mcq-cat" id="mcqCat">English</span>
        <span class="mcq-count" id="mcqCount">Question 1 / 20</span>
      </div>
      <div class="mcq-image" id="mcqImage" hidden></div>
      <h3 class="mcq-question" id="mcqQuestion"></h3>
      <div class="mcq-options" id="mcqOptions" role="group" aria-label="Answer options"></div>
      <div class="mcq-nav">
        <button type="button" class="ghost" id="mcqSkipBtn">Skip</button>
        <button type="button" class="primary" id="mcqNextBtn" disabled>Next</button>
      </div>
    </div>

    <div class="typing-run-actions">
      <button type="button" class="ghost" id="typingRestartBtn">Restart</button>
    </div>
  </section>

  <section class="typing-panel typing-results" id="typingResults" hidden>
    <p class="typing-mode-tag">Results</p>
    <h2 class="typing-setup-title" id="resultsTitle">Nice work</h2>
    <div class="typing-result-grid" id="typingResultGrid"></div>
    <div class="typing-run-actions">
      <button type="button" class="primary" id="typingAgainBtn">Try again</button>
      <a class="ghost" href="<?= cz_url() ?>#test-tools">All tests</a>
    </div>
  </section>
</main>
