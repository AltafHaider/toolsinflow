<?php
declare(strict_types=1);
?>
<main class="container">
  <div class="study-ppt-shell" id="studyPptShell">
    <div class="study-ppt-grid">
      <section class="study-ppt-panel">
        <label class="study-field">
          <span>Topic name</span>
          <input type="text" id="studyTopic" maxlength="120" placeholder="Example: Photosynthesis, AI, Digital Marketing (typos are auto-corrected)" autocomplete="off" />
        </label>

        <label class="study-field">
          <span>Or paste your study material</span>
          <textarea id="studyMaterial" rows="10" placeholder="Paste notes, textbook text, or class material here. Tip: use clear headings from your topic (for example Process, Types, Applications, Challenges)."></textarea>
        </label>

        <div class="study-options">
          <label class="study-field study-field--inline">
            <span>Slide count</span>
            <select id="studySlideCount">
              <option value="8">8 slides</option>
              <option value="10">10 slides</option>
              <option value="12" selected>12 slides</option>
              <option value="16">16 slides</option>
              <option value="20">20 slides</option>
            </select>
          </label>
          <label class="study-check">
            <input type="checkbox" id="studySimpleWords" checked />
            <span>Use simple, easy words</span>
          </label>
        </div>

        <div class="study-templates" id="studyTemplates" aria-label="Presentation templates">
          <p class="study-templates-label">Choose a design <span class="study-templates-hint">Top 8 shown — open more below</span></p>
          <div id="studyTemplateGrid"></div>
        </div>

        <div class="study-actions">
          <button type="button" class="primary" id="studyGenerateBtn">Create presentation</button>
        </div>
        <p class="status" id="studyStatus" role="status">Enter a topic or paste notes, pick a template, then create your PPT.</p>
      </section>

      <aside class="study-ppt-preview" aria-live="polite">
        <div class="study-preview-head">
          <h2>Slide preview</h2>
          <span id="studyPreviewMeta">No slides yet</span>
        </div>
        <div class="study-preview-stage" id="studyPreviewStage">
          <p class="study-preview-empty">Your slides will appear here before you download.</p>
        </div>
        <div class="study-preview-actions">
          <button type="button" class="primary" id="studyDownloadBtn" disabled>Download PowerPoint</button>
        </div>
      </aside>
    </div>
  </div>
</main>
