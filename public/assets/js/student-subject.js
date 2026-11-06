/**
 * Página do tema: iniciar/continuar redação.
 *
 * INTEGRAÇÃO: trocar a simulação por
 *   POST route('project.create') { subject_id, keyword_id }
 *   → sucesso: window.location.href = '/projects/' + data.project_id
 *   → erro >= 500: toast('Ocorreu um erro interno. Tente novamente.', 'error')
 *   → outro erro: toast(data.message, 'error')
 */
(() => {
  document.querySelectorAll('[data-create-project]').forEach((button) => {
    const icon = button.querySelector('[data-icon]');
    const label = button.querySelector('[data-label]');
    const original = { icon: icon.className, label: label.textContent };

    const setLoading = (loading) => {
      button.disabled = loading;
      icon.className = loading ? 'icon-[lucide--loader-circle] size-4 animate-spin' : original.icon;
      label.textContent = loading ? 'Abrindo…' : original.label;
    };

    button.addEventListener('click', () => {
      setLoading(true);

      // Demonstração: abre o editor
      setTimeout(() => {
        window.location.href = 'student-editor.html';
      }, 600);
    });
  });
})();
