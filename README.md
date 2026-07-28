# OR Creatives

Site estático de portfólio para serviços de web design na Irlanda e na Flórida.

## Executar localmente

Inicie um servidor HTTP local:

```powershell
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Estrutura

- `index.html`: experiência principal em uma única página, inspirada no OR Creatives Flow.
- `flow-styles.css`: identidade visual e responsividade da página principal.
- `flow.js`: menu móvel, comparadores, câmbio e animações com GSAP e Anime.js.
- `services.html`: detalhamento dos serviços e do processo de trabalho.
- `portfolio.html`: estudos de caso e resultados dos projetos.
- `pricing.html`: pacotes, comparação e perguntas frequentes.
- `contact.html`: briefing detalhado, contatos e próximos passos.
- `page-styles.css`: estilos compartilhados pelas páginas internas.
- `page-transitions.css`: transição entre páginas com cabeçalho estável.
- `page-effects.js`: efeitos de rolagem e interações compartilhadas.
- `motion-effects.js`: animações das páginas internas com GSAP e Anime.js.
- `nav-indicator.js`: animação deslizante da página ativa no menu interno.
- `favicon.png`: ícone da marca OR Creatives.
- `vercel.json`: configuração de URLs limpas no Vercel.
- `assets/`: imagens locais da página principal e do portfólio.
- `.gitignore`: arquivos locais que não devem ser versionados.

## Publicação

O repositório está conectado ao Vercel. Cada push para a branch `main` inicia uma nova publicação.
