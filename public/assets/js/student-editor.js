/**
 * Editor de redação (demonstração).
 *
 * INTEGRAÇÃO: no app, o Quill assume o #project-text com toolbar '#toolbar-container'
 * (os botões já têm as classes ql-*). O salvamento automático e o envio passam a usar
 * route('project.text.save') e route('project.publish'). Este arquivo simula esses fluxos.
 */
(() => {
  const editor = document.getElementById('project-text');
  const title = document.getElementById('title');
  if (!editor) return;

  // ---------------------------------------------------------------
  // Barra de formatação (demo com execCommand; o Quill substitui)
  // ---------------------------------------------------------------
  const toolbar = document.getElementById('toolbar-container');
  const stateful = [...toolbar.querySelectorAll('[aria-pressed]')];

  toolbar.addEventListener('mousedown', (event) => {
    // Mantém a seleção do texto ao clicar nos botões
    if (event.target.closest('[data-command]')) event.preventDefault();
  });

  toolbar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-command]');
    if (!button) return;
    editor.focus();
    document.execCommand(button.dataset.command);
    refreshToolbar();
    onChange();
  });

  const refreshToolbar = () => {
    stateful.forEach((button) => {
      let active = false;
      try {
        active = document.queryCommandState(button.dataset.command);
      } catch (_) {}
      button.setAttribute('aria-pressed', String(active));
    });
  };

  document.addEventListener('selectionchange', () => {
    if (editor.contains(document.getSelection()?.anchorNode)) refreshToolbar();
  });

  // ---------------------------------------------------------------
  // Contador de palavras
  // ---------------------------------------------------------------
  const counter = document.querySelector('[data-counter]');
  const updateCounter = () => {
    const text = editor.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.replace(/\s/g, '').length;
    counter.textContent = `${words} ${words === 1 ? 'palavra' : 'palavras'} · ${chars} caracteres`;
  };

  // ---------------------------------------------------------------
  // Status de salvamento automático
  // ---------------------------------------------------------------
  const STATUS = {
    saving: { icon: 'icon-[lucide--loader-circle] size-3.5 animate-spin text-slate-400', label: 'Salvando…' },
    saved: { icon: 'icon-[lucide--circle-check] size-3.5 text-success', label: 'Salvo' },
    error: { icon: 'icon-[lucide--circle-alert] size-3.5 text-danger', label: 'Erro ao salvar' },
  };

  const setStatus = (state) => {
    document.querySelectorAll('[data-save-status]').forEach((el) => {
      el.querySelector('[data-save-icon]').className = STATUS[state].icon;
      el.querySelector('[data-save-label]').textContent = STATUS[state].label;
    });
  };

  let saveTimer;
  const onChange = () => {
    updateCounter();
    setStatus('saving');
    clearTimeout(saveTimer);
    // INTEGRAÇÃO: POST route('project.text.save') { title, text } → 'saved' | 'error'
    saveTimer = setTimeout(() => setStatus('saved'), 900);
  };

  editor.addEventListener('input', onChange);

  // Título em uma linha lógica: Enter leva para o texto
  title.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      editor.focus();
    }
  });
  title.addEventListener('input', onChange);
  updateCounter();

  // ---------------------------------------------------------------
  // Proposta (painel lateral)
  // ---------------------------------------------------------------
  const proposal = document.getElementById('proposal-sheet');
  document.querySelector('[data-open-proposal]')?.addEventListener('click', () => proposal.showModal());
  proposal.addEventListener('click', (event) => {
    if (event.target === proposal) proposal.close(); // clique fora fecha
  });

  // ---------------------------------------------------------------
  // Finalizar
  // ---------------------------------------------------------------
  const finish = document.getElementById('finish-dialog');
  document.querySelector('[data-finish]')?.addEventListener('click', () => {
    if (!editor.innerText.trim()) {
      window.toast('Escreva sua redação antes de finalizar.', 'error');
      editor.focus();
      return;
    }
    finish.showModal();
  });

  finish.addEventListener('close', () => {
    if (finish.returnValue === 'confirm') {
      // INTEGRAÇÃO: POST route('project.publish') → redirecionar para a visualização
      window.toast('Redação enviada! Ela já está com o professor para correção.', 'success');
    }
    finish.returnValue = '';
  });

  // ---------------------------------------------------------------
  // Ações ainda sem tela no template
  // ---------------------------------------------------------------
  document.querySelector('[data-transcribe]')?.addEventListener('click', () => {
    // INTEGRAÇÃO: route('project.extract-text-file.form', projectId)
    window.location.href = 'student-transcription.html';
  });
  // ---------------------------------------------------------------
  // Imagem anexada
  // ---------------------------------------------------------------
  const attach = document.querySelector('[data-attach-image]');
  const imageInput = document.querySelector('[data-image-input]');
  const chip = document.querySelector('[data-image-chip]');
  const thumb = document.querySelector('[data-image-thumb]');

  const setAttached = (src) => {
    thumb.src = src || '';
    attach.classList.toggle('hidden', Boolean(src));
    chip.classList.toggle('hidden', !src);
    chip.classList.toggle('flex', Boolean(src));
  };

  imageInput?.addEventListener('change', () => {
    const file = imageInput.files[0];
    imageInput.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.toast('Escolha um arquivo de imagem.', 'error');
      return;
    }
    // INTEGRAÇÃO: POST route('project.uploadImage')
    setAttached(URL.createObjectURL(file));
    window.toast('Imagem anexada.', 'success');
  });

  document.querySelector('[data-image-view]')?.addEventListener('click', () => {
    window.openImage(thumb.src, 'Imagem anexada');
  });

  document.querySelector('[data-image-remove]')?.addEventListener('click', () => {
    // INTEGRAÇÃO: POST route('project.removeImage')
    setAttached('');
    window.toast('Imagem removida.', 'info');
  });

  // ---------------------------------------------------------------
  // Conflito de rascunho (demonstração: ?conflict=1)
  // ---------------------------------------------------------------
  const conflict = document.getElementById('draft-conflict');
  if (conflict && new URLSearchParams(window.location.search).get('conflict') === '1') {
    conflict.addEventListener('cancel', (event) => event.preventDefault()); // exige uma escolha
    conflict.addEventListener('close', () => {
      window.toast(conflict.returnValue === 'draft' ? 'Rascunho restaurado.' : 'Versão salva mantida.', 'success');
    });
    conflict.showModal();
  }

  // ---------------------------------------------------------------
  // Assistente: nova análise com intervalo de espera
  // ---------------------------------------------------------------
  const runAssistant = document.querySelector('[data-run-assistant]');
  const timer = document.querySelector('[data-assistant-timer]');

  runAssistant?.addEventListener('click', () => {
    const icon = runAssistant.querySelector('[data-icon]');
    const label = runAssistant.querySelector('[data-label]');
    const original = { icon: icon.className, label: label.textContent };

    runAssistant.disabled = true;
    icon.className = 'icon-[lucide--loader-circle] size-4 animate-spin';
    label.textContent = 'Analisando sua redação…';

    // INTEGRAÇÃO: GET route('writing-assistant.project.generate')
    setTimeout(() => {
      icon.className = original.icon;
      label.textContent = original.label;
      window.toast('Análise concluída. Confira as dicas do Assistente.', 'success');

      let seconds = 60;
      const countdown = timer.querySelector('[data-countdown]');
      countdown.textContent = seconds;
      timer.classList.replace('hidden', 'flex');

      const tick = setInterval(() => {
        seconds -= 1;
        countdown.textContent = seconds;
        if (seconds <= 0) {
          clearInterval(tick);
          timer.classList.replace('flex', 'hidden');
          runAssistant.disabled = false;
        }
      }, 1000);
    }, 1500);
  });
})();
