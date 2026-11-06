/**
 * Histórico de versões: visualizar e restaurar.
 * INTEGRAÇÃO: texto via GET route('project-history.get-text', id);
 * restaurar via PUT route('project-history.restore-text', [projectId, historyId]) e voltar ao editor.
 */
(() => {
  const sheet = document.getElementById('version-sheet');
  if (!sheet) return;

  const title = sheet.querySelector('[data-version-title]');
  const date = sheet.querySelector('[data-version-date]');
  const text = sheet.querySelector('[data-version-text]');
  const restore = sheet.querySelector('[data-restore-version]');

  document.querySelectorAll('[data-view-version]').forEach((button) => {
    button.addEventListener('click', () => {
      const template = document.getElementById(`version-${button.dataset.viewVersion}`);
      title.textContent = button.dataset.title;
      date.textContent = `Salvo em ${button.dataset.date}`;
      text.replaceChildren(template.content.cloneNode(true));
      // A versão mais recente já é o texto atual
      restore.hidden = button.dataset.viewVersion === '0';
      sheet.showModal();
    });
  });

  sheet.addEventListener('click', (event) => {
    if (event.target === sheet) sheet.close();
  });

  restore.addEventListener('click', () => {
    restore.disabled = true;
    setTimeout(() => {
      window.toast('Versão restaurada. Abrindo o editor…', 'success');
      setTimeout(() => {
        window.location.href = 'student-editor.html';
      }, 1000);
    }, 500);
  });
})();
