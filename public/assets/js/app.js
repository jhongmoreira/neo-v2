/**
 * Scripts globais do template.
 */

// Mostrar/ocultar senha: <button data-password-toggle="id-do-input">
document.querySelectorAll('[data-password-toggle]').forEach((button) => {
  const input = document.getElementById(button.dataset.passwordToggle);
  if (!input) return;

  button.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
    button.querySelector('[data-icon="show"]')?.classList.toggle('hidden', show);
    button.querySelector('[data-icon="hide"]')?.classList.toggle('hidden', !show);
    input.focus();
  });
});

// Dropdown: [data-dropdown] > [data-dropdown-trigger] + [data-dropdown-menu]
document.querySelectorAll('[data-dropdown]').forEach((dropdown) => {
  const trigger = dropdown.querySelector('[data-dropdown-trigger]');
  const menu = dropdown.querySelector('[data-dropdown-menu]');

  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open);
    trigger.setAttribute('aria-expanded', String(open));
  };

  trigger.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
});

// Abas: [data-tabs] com botões [role=tab][data-tab] ligados a painéis via aria-controls.
// A aba ativa é refletida em ?tab=<nome> para permitir links diretos.
document.querySelectorAll('[data-tabs]').forEach((tablist) => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  const select = (tab, { focus = false, updateUrl = true } = {}) => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls'))?.classList.toggle('hidden', !active);
    });
    if (focus) tab.focus();
    // Em telas estreitas a faixa rola na horizontal: mantém a aba ativa visível
    tablist.scrollTo({ left: tab.offsetLeft - tablist.offsetLeft - 24, behavior: 'smooth' });
    if (updateUrl && tab.dataset.tab) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab.dataset.tab);
      history.replaceState(null, '', url);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      const offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!offset) return;
      event.preventDefault();
      select(tabs[(index + offset + tabs.length) % tabs.length], { focus: true });
    });
  });

  const initial = new URLSearchParams(window.location.search).get('tab');
  const initialTab = tabs.find((t) => t.dataset.tab === initial);
  if (initialTab) select(initialTab, { updateUrl: false });
});

// Toast: window.toast('Mensagem', 'success' | 'error' | 'info')
// Equivale ao notification()/notificationError() do app atual.
window.toast = (message, type = 'info') => {
  let region = document.getElementById('toast-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    region.className = 'pointer-events-none fixed inset-x-4 bottom-20 z-50 flex flex-col items-end gap-2 md:inset-x-auto md:right-6 md:bottom-6';
    document.body.append(region);
  }

  const icons = {
    success: 'icon-[lucide--circle-check] text-success',
    error: 'icon-[lucide--circle-alert] text-danger',
    info: 'icon-[lucide--info] text-primary',
  };

  const item = document.createElement('div');
  item.className = 'toast';
  item.innerHTML = `<span class="${icons[type] ?? icons.info} mt-0.5 size-4 shrink-0" aria-hidden="true"></span><p></p>`;
  item.querySelector('p').textContent = message;
  region.append(item);

  setTimeout(() => {
    item.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => item.remove(), 300);
  }, 4000);
};

// Regras de senha (mesmas do backend: Password::min(6)->letters()->numbers())
//   <input data-password-rules="id-da-lista">  +  <ul id="id-da-lista"> <li data-rule="length|letter|number">
//   <input data-password-confirm="id-do-input-da-senha">  +  [data-confirm-message] logo depois
const PASSWORD_RULES = {
  length: (value) => value.length >= 6,
  letter: (value) => /\p{L}/u.test(value),
  number: (value) => /\d/.test(value),
};

window.passwordIsValid = (value) => Object.values(PASSWORD_RULES).every((rule) => rule(value));

document.querySelectorAll('[data-password-rules]').forEach((input) => {
  const list = document.getElementById(input.dataset.passwordRules);
  if (!list) return;

  const update = () => {
    list.querySelectorAll('[data-rule]').forEach((item) => {
      item.dataset.valid = String(PASSWORD_RULES[item.dataset.rule]?.(input.value) ?? false);
    });
  };
  input.addEventListener('input', update);
  update();
});

document.querySelectorAll('[data-password-confirm]').forEach((input) => {
  const original = document.getElementById(input.dataset.passwordConfirm);
  const message = input.closest('div')?.parentElement.querySelector('[data-confirm-message]');
  if (!original) return;

  const update = () => {
    const mismatch = input.value.length > 0 && input.value !== original.value;
    if (mismatch) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    message?.classList.toggle('hidden', !mismatch);
  };
  input.addEventListener('input', update);
  original.addEventListener('input', update);
});

// Visualizador de imagem: window.openImage(src, legenda) ou <button data-image-viewer="url" data-caption="…">
window.openImage = (src, caption = '') => {
  let viewer = document.getElementById('image-viewer');
  if (!viewer) {
    viewer = document.createElement('dialog');
    viewer.id = 'image-viewer';
    viewer.className = 'm-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-xs open:flex open:flex-col';
    viewer.innerHTML = `
      <div class="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
        <p class="min-w-0 flex-1 truncate text-sm font-medium" data-caption></p>
        <a class="btn-icon size-9" target="_blank" rel="noopener" aria-label="Abrir em nova aba" data-open-original>
          <span class="icon-[lucide--external-link] size-4" aria-hidden="true"></span>
        </a>
        <form method="dialog"><button class="btn-icon size-9" aria-label="Fechar"><span class="icon-[lucide--x] size-5" aria-hidden="true"></span></button></form>
      </div>
      <div class="flex-1 overflow-auto bg-slate-100 p-4"><img class="mx-auto rounded-xl" alt="" data-image></div>`;
    viewer.addEventListener('click', (event) => {
      if (event.target === viewer) viewer.close();
    });
    document.body.append(viewer);
  }
  viewer.querySelector('[data-image]').src = src;
  viewer.querySelector('[data-image]').alt = caption;
  viewer.querySelector('[data-caption]').textContent = caption;
  viewer.querySelector('[data-open-original]').href = src;
  viewer.showModal();
};

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-image-viewer]');
  if (trigger) window.openImage(trigger.dataset.imageViewer, trigger.dataset.caption);
});

// Avisos da instituição: <dialog data-announcements> com <template data-announcement data-title="…">
// Exibidos em sequência, uma vez por sessão (equivale a announcements.pending / announcements.viewed).
document.querySelectorAll('dialog[data-announcements]').forEach((dialog) => {
  const items = [...dialog.querySelectorAll('template[data-announcement]')];
  const title = dialog.querySelector('[data-announcement-title]');
  const body = dialog.querySelector('[data-announcement-body]');
  const counter = dialog.querySelector('[data-announcement-counter]');
  let index = 0;

  try {
    if (sessionStorage.getItem('announcements-checked')) return;
  } catch (_) {}
  if (!items.length) return;

  const render = () => {
    title.textContent = items[index].dataset.title;
    body.replaceChildren(items[index].content.cloneNode(true));
    counter.textContent = items.length > 1 ? `${index + 1} de ${items.length}` : '';
  };

  dialog.addEventListener('close', () => {
    // INTEGRAÇÃO: POST route('announcements.viewed', id) para o aviso exibido
    index += 1;
    if (index < items.length) {
      render();
      setTimeout(() => dialog.showModal(), 150);
    }
  });

  try {
    sessionStorage.setItem('announcements-checked', '1');
  } catch (_) {}
  render();
  setTimeout(() => dialog.showModal(), 600);
});

// Abrir diálogos: <button data-open-dialog="id-do-dialog">. Clique fora fecha.
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open-dialog]');
  if (trigger) document.getElementById(trigger.dataset.openDialog)?.showModal();

  if (event.target instanceof HTMLDialogElement && event.target.hasAttribute('data-dismissible')) {
    event.target.close();
  }
});
