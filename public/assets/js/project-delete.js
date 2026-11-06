/**
 * Exclusão de redação em andamento (usado na tela inicial e no Meu Espaço).
 *
 * Marcação esperada:
 *   [data-project-list] > [data-project-id] > button[data-delete-project]
 *   [data-project-empty] logo após a lista (exibido quando ela fica vazia)
 *   <dialog id="delete-dialog"> com botões value="confirm" / value="cancel"
 *
 * Demo: remove o card localmente. Na integração, fazer POST /student/deleteProject { id }.
 */
(() => {
  const dialog = document.getElementById('delete-dialog');
  if (!dialog) return;

  let pendingCard = null;

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-project]');
    if (!button) return;

    pendingCard = button.closest('[data-project-id]');
    dialog.showModal();
  });

  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'confirm' && pendingCard) {
      const list = pendingCard.closest('[data-project-list]');
      pendingCard.remove();

      if (list && !list.children.length) {
        list.classList.add('hidden');
        const empty = list.nextElementSibling;
        if (empty?.matches('[data-project-empty]')) empty.classList.remove('hidden');
      }
    }
    pendingCard = null;
    dialog.returnValue = '';
  });
})();
