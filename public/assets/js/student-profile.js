/**
 * Meu perfil: troca e remoção da foto.
 * INTEGRAÇÃO: o formulário envia avatar (arquivo) ou reset-avatar (checkbox) para route('profile').
 */
(() => {
  const form = document.querySelector('[data-avatar-form]');
  if (!form) return;

  const input = form.querySelector('[data-avatar-input]');
  const img = form.querySelector('[data-avatar-img]');
  const initials = form.querySelector('[data-avatar-initials]');
  const remove = form.querySelector('[data-avatar-remove]');
  const pending = form.querySelector('[data-avatar-pending]');
  const reset = form.querySelector('[data-avatar-reset]');

  // Estado salvo (na integração, vem do servidor)
  let saved = { src: img.getAttribute('src') || '' };

  const show = (src) => {
    img.src = src || '';
    img.classList.toggle('hidden', !src);
    initials.classList.toggle('hidden', Boolean(src));
    remove.hidden = !src;
  };

  const setPending = (isPending) => {
    pending.classList.toggle('hidden', !isPending);
    pending.classList.toggle('flex', isPending);
  };

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.toast('Escolha um arquivo de imagem (JPG ou PNG).', 'error');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      window.toast('A imagem deve ter no máximo 2 MB.', 'error');
      input.value = '';
      return;
    }

    reset.checked = false;
    show(URL.createObjectURL(file));
    setPending(true);
  });

  remove.addEventListener('click', () => {
    input.value = '';
    reset.checked = true;
    show('');
    setPending(true);
  });

  form.querySelector('[data-avatar-cancel]').addEventListener('click', () => {
    input.value = '';
    reset.checked = false;
    show(saved.src);
    setPending(false);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // demo
    saved = { src: img.classList.contains('hidden') ? '' : img.src };
    setPending(false);
    window.toast('Foto atualizada.', 'success');
  });

  show(saved.src);
})();
