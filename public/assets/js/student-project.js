/**
 * Visualização da redação: curtidas, comentários e comentário da análise.
 *
 * INTEGRAÇÃO:
 *   curtir     → POST route('project-contribution.reaction', projectId)
 *   comentar   → POST route('project-contribution.save', projectId) { text }
 *   apagar     → DELETE route('project-contribution.delete', id)
 */
(() => {
  // Comentário completo da análise
  const sheet = document.getElementById('analysis-sheet');
  document.querySelector('[data-open-analysis]')?.addEventListener('click', () => sheet.showModal());
  sheet?.addEventListener('click', (event) => {
    if (event.target === sheet) sheet.close();
  });

  // Curtir
  const like = document.querySelector('[data-like]');
  like?.addEventListener('click', () => {
    const liked = like.getAttribute('aria-pressed') !== 'true';
    const count = like.querySelector('[data-like-count]');
    like.setAttribute('aria-pressed', String(liked));
    like.setAttribute('aria-label', liked ? 'Descurtir' : 'Curtir');
    count.textContent = Number(count.textContent) + (liked ? 1 : -1);
  });

  // Comentar
  const form = document.querySelector('[data-comment-form]');
  const list = document.querySelector('[data-comment-list]');
  const counter = document.querySelector('[data-comment-count]');

  const updateCount = () => {
    counter.textContent = list.children.length;
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const textarea = form.querySelector('textarea');
    const text = textarea.value.trim();
    if (!text) return;

    const now = new Date();
    const date = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const item = document.createElement('li');
    item.className = 'flex gap-3';
    item.innerHTML = `
      <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">MS</span>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm"><span class="font-medium">Você</span> <span class="text-slate-400">· ${date}</span></p>
          <button type="button" class="btn-icon -mt-2 -mr-2 size-8 hover:bg-danger/10 hover:text-danger" data-delete-comment aria-label="Apagar comentário">
            <span class="icon-[lucide--trash-2] size-3.5" aria-hidden="true"></span>
          </button>
        </div>
        <p class="mt-1 text-sm leading-6 text-slate-600" data-text></p>
      </div>`;
    item.querySelector('[data-text]').textContent = text;
    list.append(item);
    textarea.value = '';
    updateCount();
    window.toast('Comentário publicado.', 'success');
  });

  // Enter envia, Shift+Enter quebra linha
  form?.querySelector('textarea').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  list?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-comment]');
    if (!button) return;
    button.closest('li').remove();
    updateCount();
  });

})();
