<main class="container pdf-form-shell" id="pdfFormApp">
  <section class="pdf-form-start" id="pdfFormStart">
    <div class="dropzone pdf-dropzone" id="pdfFormDrop" tabindex="0">
      <strong>Drop a PDF here or click to choose</strong>
      <span>Your document stays in your browser</span>
      <input type="file" id="pdfFormInput" accept="application/pdf,.pdf" hidden />
    </div>
    <span class="pdf-start-or">or</span>
    <button type="button" class="ghost" id="pdfBlankBtn">Start with a blank document</button>
  </section>

  <section class="pdf-form-editor" id="pdfFormEditor" hidden>
    <div class="pdf-form-toolbar" id="pdfFormToolbar" role="toolbar" aria-label="PDF form tools">
      <button type="button" data-tool="label"><span aria-hidden="true">T</span> Label</button>
      <button type="button" data-tool="whiteout"><span aria-hidden="true">◇</span> Whiteout</button>
      <button type="button" id="pdfReorderBtn"><span aria-hidden="true">⇅</span> Reorder</button>
      <span class="pdf-toolbar-separator"></span>
      <button type="button" data-tool="text"><span aria-hidden="true">▣</span> Text Field</button>
      <button type="button" data-tool="textarea"><span aria-hidden="true">▤</span> Textarea</button>
      <button type="button" data-tool="radio"><span aria-hidden="true">⊙</span> Radio</button>
      <button type="button" data-tool="checkbox"><span aria-hidden="true">☑</span> Checkbox</button>
      <button type="button" data-tool="dropdown"><span aria-hidden="true">▾</span> Dropdown</button>
      <button type="button" data-tool="signature"><span aria-hidden="true">✎</span> Signature</button>
      <span class="pdf-toolbar-spacer"></span>
      <button type="button" class="pdf-publish" id="pdfPublishBtn"><span aria-hidden="true">♧</span> Publish</button>
    </div>

    <div class="pdf-editor-workspace">
      <p class="pdf-editor-hint" id="pdfEditorHint">Choose a field above, then click and drag on a page to place it.</p>
      <div class="pdf-pages-scroll">
        <div class="pdf-pages" id="pdfPages"></div>
      </div>
    </div>

    <div class="pdf-field-float-bar" id="pdfFieldFloatBar" hidden>
      <div class="pdf-float-bar-inner" id="pdfFieldFloatBarInner"></div>
      <div class="pdf-float-more" id="pdfFieldFloatMore" hidden></div>
    </div>

    <div class="pdf-apply-footer">
      <button type="button" class="pdf-apply-main" id="pdfApplyBtn">Apply changes <span aria-hidden="true">→</span></button>
    </div>

    <p class="status" id="pdfFormStatus" role="status"></p>

    <button type="button" id="pdfUndoBtn" hidden aria-hidden="true" tabindex="-1">Undo</button>
    <button type="button" id="pdfRedoBtn" hidden aria-hidden="true" tabindex="-1">Redo</button>
  </section>

  <dialog class="pdf-order-dialog" id="pdfOrderDialog">
    <div class="pdf-order-dialog-head">
      <h2>Tab order</h2>
      <button type="button" class="pdf-dialog-close" id="pdfOrderClose" aria-label="Close">×</button>
    </div>
    <p>Use the arrows to choose how users move through fields.</p>
    <ol class="pdf-order-list" id="pdfOrderList"></ol>
  </dialog>

  <dialog class="pdf-rename-dialog" id="pdfRenameDialog">
    <form method="dialog" id="pdfRenameForm">
      <div class="pdf-rename-icon" aria-hidden="true">PDF</div>
      <h2>Save your fillable PDF</h2>
      <p>Keep the original filename or enter a new one.</p>
      <label for="pdfDownloadName">File name</label>
      <div class="pdf-filename-input">
        <input type="text" id="pdfDownloadName" autocomplete="off" required />
        <span>.pdf</span>
      </div>
      <p class="pdf-rename-error" id="pdfRenameError" role="alert"></p>
      <div class="pdf-dialog-actions">
        <button type="button" class="ghost" id="pdfRenameCancel">Cancel</button>
        <button type="submit" class="primary">Download PDF</button>
      </div>
    </form>
  </dialog>

  <dialog class="pdf-signature-dialog" id="pdfSignatureDialog">
    <div class="pdf-signature-modal">
      <div class="pdf-signature-head">
        <div>
          <h2>Create signature</h2>
          <p>Type your name and choose a style, or upload a signature image.</p>
        </div>
        <button type="button" class="pdf-dialog-close" id="pdfSignatureClose" aria-label="Close">×</button>
      </div>

      <div class="pdf-signature-tabs" role="tablist">
        <button type="button" class="is-active" data-sign-tab="type">Type name</button>
        <button type="button" data-sign-tab="upload">Upload image</button>
      </div>

      <section class="pdf-sign-pane" data-sign-pane="type">
        <label for="pdfSignatureName">Your name</label>
        <input type="text" id="pdfSignatureName" maxlength="80" placeholder="Enter your full name" autocomplete="name" />
        <p class="pdf-sign-help">Choose one of 15 signature styles.</p>
        <div class="pdf-signature-styles" id="pdfSignatureStyles"></div>
      </section>

      <section class="pdf-sign-pane" data-sign-pane="upload" hidden>
        <label class="pdf-sign-upload" for="pdfSignatureImage">
          <strong>Upload signature image</strong>
          <span>PNG, JPG or WebP. A photo or scan on white paper works fine, the paper is removed for you.</span>
          <input type="file" id="pdfSignatureImage" accept="image/png,image/jpeg,image/webp" hidden />
        </label>
        <div class="pdf-uploaded-signature" id="pdfUploadedSignature" hidden>
          <img alt="Uploaded signature preview" />
          <button type="button" class="ghost" id="pdfRemoveSignatureImage">Remove image</button>
        </div>
      </section>

      <p class="pdf-rename-error" id="pdfSignatureError" role="alert"></p>
      <div class="pdf-dialog-actions">
        <button type="button" class="ghost" id="pdfSignatureCancel">Cancel</button>
        <button type="button" class="primary" id="pdfUseSignature" disabled>Use signature</button>
      </div>
    </div>
  </dialog>
</main>
