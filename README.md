# IADocs — Neo (novo template de interface)

Nova interface da plataforma IADocs em **HTML + Tailwind CSS v4**, sem bundler.
Por enquanto é apenas front-end (template estático) para depois ser integrado às views Blade do `app-mvp`.

## Comandos

```bash
npm install
npm run dev     # recompila o CSS ao salvar
npm run build   # CSS final minificado
```

Para navegar, abra **`public/index.html`**: é o mapa de todas as telas. O login de demonstração leva à tela inicial do aluno.

## Estrutura

```
neo-2/
├── src/css/app.css              # Fonte do CSS: tema, paleta white-label e componentes (@utility)
├── public/                      # Tudo que é servido
│   ├── index.html               # Mapa das telas
│   ├── login.html
│   ├── forgot-password.html     # Recuperar senha / primeiro acesso
│   ├── reset-password.html      # Criar nova senha (link do e-mail)
│   ├── force-password.html      # Troca obrigatória da senha provisória
│   ├── student-home.html        # Início (+ diálogos de tutoriais e avisos)
│   ├── student-area.html        # Meu Espaço (abas: temas, redações, da turma)
│   ├── student-subject.html     # Tema (proposta + iniciar/continuar/visualizar)
│   ├── student-editor.html      # Editor de redação (modo foco)
│   ├── student-transcription.html  # Transcrição de redação manuscrita
│   ├── student-history.html     # Histórico de versões
│   ├── student-project.html     # Redação entregue (correção, análise ENEM, comentários)
│   ├── student-class-project.html  # Redação de um colega (contribuições)
│   ├── student-profile.html     # Meu perfil (foto, dados, senha)
│   ├── 404.html · 403.html · 500.html · maintenance.html
│   └── assets/
│       ├── css/app.css          # CSS compilado (gerado — não editar)
│       ├── js/app.js            # Global: senha, dropdown, abas, toast, diálogos, imagem, avisos, regras de senha
│       ├── js/login.js · auth.js
│       ├── js/project-delete.js # Exclusão de redação (início e Meu Espaço)
│       ├── js/student-*.js      # Comportamento de cada tela (simulado)
│       └── img/                 # Logo, favicon e imagem de exemplo de redação manuscrita
└── package.json                 # Só o CLI do Tailwind + ícones
```

## Visual

Inspirado no projeto Lommer: base limpa (fundo branco), com a cor da instituição aplicada com intenção.

- **Tipografia:** Instrument Sans nos títulos (`font-heading`) e Inter no texto.
- **Formas:** botões em pílula, cartões arredondados (`card`) com sombra suave, abas segmentadas (`tablist`/`tab`).
- **Cor:** botões, links e item ativo na cor primária; ícones em círculo (`icon-chip`) e selos de área na cor de
  destaque; selos de status (`badge-success | warning | danger | neutral | accent | info`); destaque em bloco
  sólido para o que pede ação agora.
- **Celular:** navegação inferior fixa com ícones. Telas de foco (editor, transcrição) não têm menu.
- O tema padrão é sempre o claro. O escuro só é ativado adicionando a classe `dark` no `<html>`.

## Cores por instituição (white-label)

Duas variáveis, as mesmas do `color_palettes` do app-mvp:

```blade
<style>
  :root {
    --brand: {{ $institution->colorPalette->primary_color }};
    --brand-secondary: {{ $institution->colorPalette->secondary_color }};
  }
</style>
```

- `--primary` (derivada de `--brand`): botões, links, item ativo.
- `--accent` / `--accent-strong` (derivadas de `--brand-secondary`): ícones, selos de área, brilhos.

A luminosidade é corrigida automaticamente se a cor do tenant sair de uma faixa segura, então qualquer
cor escolhida mantém contraste (texto branco sobre o botão, texto escuro sobre o destaque).

## Ícones

Biblioteca [Lucide](https://lucide.dev/icons) via plugin `@iconify/tailwind4`. Os ícones são classes CSS
(sem JavaScript) e só os usados entram no CSS final. Herdam a cor do texto (`text-*`) e o tamanho vem de `size-*`:

```html
<span class="icon-[lucide--arrow-right] size-4" aria-hidden="true"></span>
```

Use ícones só onde ajudam a entender a ação; o visual deve continuar limpo.
Exceção: logos de marca coloridos (ex.: Google) continuam como SVG inline.

## Componentes JavaScript (app.js)

| Uso | Como |
| --- | --- |
| Aviso flutuante | `window.toast('Mensagem', 'success' \| 'error' \| 'info')` (substitui `notification()`) |
| Abrir diálogo | `<button data-open-dialog="id">`; `<dialog data-dismissible>` fecha ao clicar fora |
| Ver imagem | `<button data-image-viewer="url" data-caption="…">` ou `window.openImage(url, legenda)` |
| Abas | `[data-tabs]` + `[role=tab][data-tab]`; a aba ativa fica em `?tab=` |
| Menu suspenso | `[data-dropdown]` > `[data-dropdown-trigger]` + `[data-dropdown-menu]` |
| Mostrar senha | `<button data-password-toggle="id-do-input">` |
| Regras de senha | `data-password-rules="id-da-lista"` e `data-password-confirm="id-da-senha"` (mín. 6, letras e números, como o backend) |
| Avisos da instituição | `<dialog data-announcements>` com um `<template data-announcement>` por aviso; uma vez por sessão |

## Integração com o Laravel

Os pontos a trocar estão marcados nos HTMLs com comentários `INTEGRAÇÃO:`. Em geral:

- Formulários com `data-demo` simulam o envio; na integração, adicionar `action` + `@csrf` e remover `data-demo`.
- Campos usam os mesmos `name` do backend atual.
- O cabeçalho é repetido em cada página por enquanto; na integração vira o layout Blade do aluno.
- Nomes como "Tema"/"Redação" vêm de `$institution->getNamings()`.
- Logo: hoje usa o logo branco com `brightness-0`; trocar pela logo do tenant.

### Mapa de equivalência

| Tela | View atual no app-mvp |
| --- | --- |
| `login.html` | `authentications/auth-login-basic` |
| `forgot-password.html` | `authentications/auth-forgot-password-basic` |
| `reset-password.html` | `authentications/auth-reset-password-token` |
| `force-password.html` | `authentications/auth-reset-password` (rota `force-password`) |
| `student-home.html` | `student/index` + `statistics` + `open-projects` + modal de tutoriais + avisos |
| `student-area.html` | `student/student-area` + `subject-list` + `project-list` + `class-project-list` |
| `student-subject.html` | `subject/subject-details` (visão do aluno) |
| `student-editor.html` | `project/project-index` + `project-form` + painéis `writing-assistant`, `writing-analisys`, `support-material` (inclui imagem anexada e conflito de rascunho, demo em `?conflict=1`) |
| `student-transcription.html` | `project-extract-text-file/project-extract-text-file-form` (demo da revisão em `?step=review`) |
| `student-history.html` | `project-history/project-history-index` |
| `student-project.html` | `project-contribution/project-contribution-index` (dono) + `project-view` + `project-contribution-form` + `writing-analisys-enem-project` |
| `student-class-project.html` | `project-contribution/project-contribution-index` (não dono) + lista da turma |
| `student-profile.html` | `users/profile` + `users/password` |
| `404/403/500/maintenance.html` | `pages/*` |

### Observações por tela

- **Editor:** `#project-text` e `#toolbar-container` (botões com classes `ql-*`) estão prontos para receber o **Quill**.
  As abas Assistente, Revisão e Leituras só devem aparecer se o recurso estiver habilitado no tema.
- **Redação entregue:** há um bloco alternativo comentado para "Correção em andamento". Cores das competências:
  >= 80% verde, >= 50% amarelo, abaixo vermelho. No celular a ordem é texto → análise → comentários.
- **Perfil:** nome, nome social, usuário e e-mail são somente leitura (o backend ignora esses campos); só a foto é editável (até 2 MB).
- **Texto rico:** a classe `rich-text` estiliza o HTML gerado pelo Quill (`p`, `h2`, `h3`, `strong`, `ul`, `ol`, `blockquote`, `img`).
