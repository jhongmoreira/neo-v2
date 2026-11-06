/**
 * Formulários de autenticação (recuperar senha, redefinir senha, troca obrigatória).
 *
 * Validação client-side: campos obrigatórios, e-mail, regras de senha e confirmação.
 * Com [data-demo] o envio é simulado; na integração, remover o atributo para o POST seguir.
 */
(() => {
  document.querySelectorAll('[data-auth-form]').forEach((form) => {
    const error = form.querySelector('[data-form-error]');
    const submit = form.querySelector('[data-submit]');
    const submitLabel = submit.textContent;

    const fail = (message, field) => {
      error.textContent = message;
      error.classList.remove('hidden');
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    };

    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        error.classList.add('hidden');
        if (!input.matches('[data-password-confirm]')) input.removeAttribute('aria-invalid');
      });
    });

    form.addEventListener('submit', (event) => {
      error.classList.add('hidden');

      const empty = [...form.querySelectorAll('input[required]')].find((input) => !input.value.trim());
      if (empty) {
        event.preventDefault();
        return fail('Preencha todos os campos.', empty);
      }

      const email = form.querySelector('input[type="email"]');
      if (email && !email.checkValidity()) {
        event.preventDefault();
        return fail('Informe um e-mail válido.', email);
      }

      const password = form.querySelector('[data-password-rules]');
      if (password && !window.passwordIsValid(password.value)) {
        event.preventDefault();
        return fail('A nova senha não atende aos requisitos.', password);
      }

      const confirm = form.querySelector('[data-password-confirm]');
      if (confirm && confirm.value !== password?.value) {
        event.preventDefault();
        return fail('As senhas não coincidem.', confirm);
      }

      submit.disabled = true;
      submit.textContent = 'Enviando…';

      if (!form.hasAttribute('data-demo')) return;
      event.preventDefault();

      setTimeout(() => {
        submit.disabled = false;
        submit.textContent = submitLabel;

        if (form.dataset.authForm === 'forgot') {
          document.querySelector('[data-sent-email]').textContent = email.value;
          document.querySelector('[data-step="form"]').classList.add('hidden');
          document.querySelector('[data-step="sent"]').classList.remove('hidden');
          return;
        }

        window.toast(form.dataset.successMessage, 'success');

        if (!form.dataset.successUrl) {
          form.reset();
          form.querySelectorAll('input').forEach((input) => input.dispatchEvent(new Event('input')));
          return;
        }
        setTimeout(() => {
          window.location.href = form.dataset.successUrl;
        }, 1200);
      }, 800);
    });
  });

  // Reenviar (recuperar senha)
  const resend = document.querySelector('[data-resend]');
  resend?.addEventListener('click', () => {
    // INTEGRAÇÃO: repetir o POST route('forgot-password') (há throttle no backend)
    resend.disabled = true;
    window.toast('E-mail reenviado.', 'success');
    let seconds = 60;
    const tick = setInterval(() => {
      seconds -= 1;
      resend.textContent = `Reenviar em ${seconds}s`;
      if (seconds <= 0) {
        clearInterval(tick);
        resend.disabled = false;
        resend.textContent = 'Reenviar e-mail';
      }
    }, 1000);
  });
})();
