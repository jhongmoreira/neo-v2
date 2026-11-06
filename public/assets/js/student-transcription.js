/**
 * Transcrição de redação manuscrita: foto → processamento → revisão.
 *
 * INTEGRAÇÃO:
 *   1. POST route('project.extract-text-file.extract') com a imagem → texto extraído
 *   2. Avançar: POST route('project.extract-text-file.save-image') e abrir o editor com o texto
 * Atalho de demonstração: ?step=review abre direto a revisão com a imagem de exemplo.
 */
(() => {
  const steps = document.querySelectorAll('[data-step]');
  const preview = document.querySelector('[data-preview]');
  const confirm = document.querySelector('[data-confirm]');
  const advance = document.querySelector('[data-advance]');
  const dropzone = document.querySelector('[data-dropzone]');

  const show = (name) => {
    steps.forEach((step) => step.classList.toggle('hidden', step.dataset.step !== name));

    const onReview = name === 'review';
    const upload = document.querySelector('[data-step-indicator="upload"]');
    const review = document.querySelector('[data-step-indicator="review"]');
    review.classList.toggle('text-primary', onReview);
    review.classList.toggle('font-medium', onReview);
    review.classList.toggle('text-slate-400', !onReview);
    review.firstElementChild.className = onReview
      ? 'flex size-6 items-center justify-center rounded-full bg-primary text-xs text-white'
      : 'flex size-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500';
    upload.firstElementChild.innerHTML = onReview
      ? '<span class="icon-[lucide--check] size-3.5" aria-hidden="true"></span>'
      : '1';
    window.scrollTo({ top: 0 });
  };

  const process = (file) => {
    if (!file.type.startsWith('image/')) {
      window.toast('Escolha um arquivo de imagem (JPG ou PNG).', 'error');
      return;
    }

    preview.src = URL.createObjectURL(file);
    show('processing');

    const title = document.querySelector('[data-processing-title]');
    const text = document.querySelector('[data-processing-text]');
    const icon = document.querySelector('[data-processing-icon]');

    title.textContent = 'Analisando a imagem…';
    text.textContent = 'Isso costuma levar alguns segundos.';
    icon.className = 'icon-[lucide--scan-text] size-7';

    setTimeout(() => {
      title.textContent = 'Finalizado!';
      text.textContent = 'Abrindo a revisão…';
      icon.className = 'icon-[lucide--check] size-7';
      setTimeout(() => show('review'), 700);
    }, 1800);
  };

  document.querySelectorAll('[data-file-input]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.files[0]) process(input.files[0]);
      input.value = '';
    });
  });

  // Arrastar e soltar
  ['dragenter', 'dragover'].forEach((type) =>
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.dataset.dragging = 'true';
    }),
  );
  ['dragleave', 'drop'].forEach((type) =>
    dropzone.addEventListener(type, () => {
      dropzone.dataset.dragging = 'false';
    }),
  );
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) process(file);
  });

  // Revisão
  confirm.addEventListener('change', () => {
    advance.disabled = !confirm.checked;
  });

  document.querySelector('[data-reprocess]').addEventListener('click', () => {
    confirm.checked = false;
    advance.disabled = true;
    show('upload');
  });

  advance.addEventListener('click', () => {
    advance.disabled = true;
    window.toast('Transcrição enviada para o editor.', 'success');
    setTimeout(() => {
      window.location.href = 'student-editor.html';
    }, 900);
  });

  if (new URLSearchParams(window.location.search).get('step') === 'review') show('review');
})();
