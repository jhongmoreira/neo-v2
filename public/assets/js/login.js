/**
 * Página de login: validação simples e estado de carregamento.
 * Com [data-demo] no formulário o envio é simulado e leva para a tela do aluno.
 * Na integração, remover o atributo.
 */
(() => {
  const form = document.getElementById('login-form');
  if (!form) return;

  const alert = document.getElementById('login-alert');
  const submit = form.querySelector('[data-submit]');

  const showAlert = (message, type = 'error') => {
    alert.textContent = message;
    alert.classList.remove('hidden', 'text-red-600', 'text-emerald-600');
    alert.classList.add(type === 'error' ? 'text-red-600' : 'text-emerald-600');
  };

  form.querySelectorAll('input[required]').forEach((input) => {
    input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
  });

  form.addEventListener('submit', (event) => {
    alert.classList.add('hidden');

    const empty = [...form.querySelectorAll('input[required]')].filter((input) => !input.value.trim());
    empty.forEach((input) => input.setAttribute('aria-invalid', 'true'));

    if (empty.length) {
      event.preventDefault();
      showAlert('Preencha usuário e senha.');
      empty[0].focus();
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Entrando…';

    if (form.hasAttribute('data-demo')) {
      event.preventDefault();
      setTimeout(() => {
        window.location.href = 'student-home.html';
      }, 600);
    }
  });
})();
