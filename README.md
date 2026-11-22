# Expedições de Miguel Pereira · protótipo

Jogo de celular em realidade aumentada com o **surucuá-variado**, ave real da Mata Atlântica. Ele é o guia e o pet: o jogador visita lugares da cidade, ganha acessórios de Natal para vestir o surucuá, cuida dele e posta. Roda no navegador, sem instalar, e pode virar app na tela inicial.

## Rodar agora (modo demonstração)

Sem Firebase, tudo fica salvo só no aparelho. É o jeito mais rápido de testar.

Mesmo com Firebase configurado, o progresso pessoal (XP, pets e itens) fica neste navegador e não sincroniza automaticamente com outro celular. As publicações do feed são salvas no servidor e podem ser apagadas pelo navegador em que foram feitas; trocar de aparelho ou limpar os dados locais pode impedir essa remoção.

1. Suba a pasta inteira no GitHub Pages ou na Hostinger. A câmera só funciona em **https**.
2. Para testar no computador: `python3 -m http.server 8000` dentro da pasta e abra `http://localhost:8000`.
3. Edite `config.js` para trocar missões, lojas, espécies, dicas e prêmios.

## Publicar no GitHub Pages

O repositório `inaluzcria-lab/inaluzcria-lab.github.io` publica esta pasta na raiz: **https://inaluzcria-lab.github.io/**.

1. Envie as mudanças: `git add -A`, `git commit -m "GitHub Pages"`, `git push`.
2. No GitHub: **Settings › Pages › Build and deployment** › Source **Deploy from a branch** › Branch **main** e pasta **/ (root)** › Save.
3. Marque **Enforce HTTPS** (câmera, GPS e microfone só funcionam em https).
4. Em 1 a 2 minutos o site está no ar. Abra no celular e teste.

O que já está ajustado para o Pages:

- `.nojekyll`: o GitHub publica os arquivos como estão, sem passar pelo Jekyll.
- `404.html`: endereço errado volta para o jogo.
- `config.js` › `siteUrl` aponta para o endereço do Pages, então os QR codes e os convites levam para o site certo. Se usar domínio próprio, troque aqui e crie o arquivo `CNAME` com o domínio.
- O GitHub Pages não deixa configurar cabeçalhos de segurança. A política de segurança (CSP) e a de referrer já estão no `index.html` como `<meta>`. A proteção contra o jogo ser aberto dentro de outro site (frame-ancestors) não funciona por `<meta>`, então o `app.js` faz essa checagem. `.htaccess` (Hostinger) e `firebase.json` (Firebase Hosting) ficam na pasta só para quando o jogo mudar de hospedagem; o Pages ignora os dois.
- O mapa usa os tiles do OpenStreetMap, que pedem o cabeçalho Referer: o `index.html` já manda `strict-origin-when-cross-origin`.

## O que funciona (todas as telas do mockup aprovado)

| Tela | O que tem |
| --- | --- |
| Início | Stories dos lugares, árvore da cidade, Passe de Natal, feed com foto, XP, lugares, pets, km e tempo; aplausos, "Fazer esta rota", apagar o próprio post e denunciar; feed com fim |
| Detalhe da expedição | Estilo Strava: rota desenhada, distância, tempo, lugares, XP e pets |
| Clubes | Desafio da semana com ranking, Guardiões do mês, criar e entrar em clubes por código (sem chat) |
| Mapa | Pinos grandes, lista, "Como chegar", Rota do pisca-pisca (XP em dobro depois das 18h), expedição com GPS, lugares marcados |
| Expedição | "Começar expedição" mede km e tempo pelo GPS desde o toque; dá para usar o app e a câmera no caminho; encerra no Mapa; resumo com fotos da galeria (opcional) e publicação opcional; trajeto sem os primeiros 200 m e os últimos 150 m; abaixo de 200 m vira check-in |
| Marcar lugar | GPS a até 50 m, foto na hora, tipo e nome, aviso de duplicado; "em descoberta" até 3 visitas; bicho do ambiente; some em 30 dias |
| Este lugar é meu? | Dono escolhe plano e manda contato; a equipe confere antes de valer |
| Câmera em RA | Surucuá em 3D sobre a câmera, com os acessórios; dica dele em balão e voz; Galeria como reserva; modo Procurar; "Olhar ao redor aqui" (busca no território); "Fotografar uma ave de verdade" |
| Encontro | Surucuá cabisbaixo → ergue cabeça e asas → "Me leve com você" no chat (recolhido, com aviso); aceitar (canta), recusar (despedida, mudar de ideia, avisar no feed); foto e "Levar para o Jardim" separados; reencontro "Oi, você voltou!" |
| Almanaque | No Perfil, aba ao lado do Guarda-roupa: silhueta (não encontrada), preto e branco (pista pela comida), colorida (encontrada); busca e ordenação; ficha com fontes ou "pendente de verificação" |
| Recompensa e Story | XP, pet novo, presente certo da loja, Caixinha, Story 1080×1920 com QR, pedido de impressão |
| Jardim | Surucuá como tamagotchi (fome, carinho, sono, alegria), mochila, carinho, "Falar" com voz mais aguda, pet passeia se esquecido; ave levada pelo encontro fica de visita e volta ao habitat (alimentar com fome estende a visita) |
| Vínculo | Mensagens do pet no estilo WhatsApp, rotina pela hora do dia, respostas rápidas, vínculo 5 libera o canto |
| Guarda-roupa | Veste um acessório de Natal por parte do corpo (cabeça, pescoço, asas, rosto) |
| Caixinha e Passe | Chances visíveis, só se ganha jogando; trilha grátis com missões do dia; Padrinho da Serra com preço em aberto |
| Perfil | Nível, sequência, convite, Almanaque e Guarda-roupa, conquistas, letra grande, privacidade, apagar dados |
| Loja | Contato com consentimento, criar missão por modelo (fica pendente até você aprovar), QR do balcão, painel de exemplo, oferta de VR |
| Instalar | PWA na tela inicial |

**Um bicho só: o surucuá.** É o guia (dicas e voz na câmera) e o pet. Cada missão dá um acessório de Natal (gorro, laço, cachecol, pisca-pisca nas asas, óculos de estrela); a Caixinha dá o gorro dourado. O almanaque virou o Guarda-roupa.

**Modelo e animações.** O modelo é o seu surucuá, agora com esqueleto, a sua textura e 4 animações feitas no Blender:

- `assets/models/surucua.blend`: arquivo editável (textura em `assets/models/SurucuaUV.png`, caminho relativo).
- `assets/models/surucua.glb`: o que o jogo carrega (textura embutida).

A UV foi refeita para usar a `SurucuaUV.png`: costas e capuz azul-marinho, barriga amarela, penas nas asas e listras nas pernas. Para a passagem suave do azul para o amarelo, foi pintada uma faixa em degradê no canto inferior direito da textura, que era azul-marinho liso.

| Animação (clipe no .glb) | Quando | O que faz |
| --- | --- | --- |
| `pouso` | Primeira aparição: na tag, na câmera e ao abrir o jardim | Desce batendo as asas e fecha as asas ao pousar |
| `idle` | Parado (loop) | Asas fechadas, respira, olha em volta e mexe o rabo |
| `canto` | Toque no surucuá | Só o peito (osso `chest`) infla, no ritmo da gravação `assets/audio/canto.mp3` |
| `voo` | Modo Procurar (corrida) | Bate as asas com o corpo inclinado |
| `comer` | A frutinha chega no bico | Duas bicadas para a frente |
| `curioso` | Abrir a bandeja de comida ou começar a falar | Inclina a cabeça de lado, pausa e volta |
| `carinho` | Tocar no surucuá (reação principal ao carinho) | Fecha os olhos, relaxa as asas e aparece um ♥ ao lado da cabeça; o canto toca junto |
| `feliz` | Depois de comer | Pulinho curto com as asas um pouco abertas e uma ♪ ao lado da cabeça |

Ossos: `root`, `body`, `chest`, `head`, `tail`, `wing.L`, `wingtip.L`, `wing.R`, `wingtip.R`. Olhos (que fecham no carinho, achatando no eixo vertical), gorro, laço e óculos ficam presos em `head`; cachecol em `body`; pisca-pisca em `wing`/`wingtip`. Se você editar as animações no Blender, mantenha esses nomes e exporte glTF Binary com as actions (modo NLA Tracks ou Actions).

**Compartilhar a expedição (estilo Strava).** No detalhe de uma expedição sua, o botão "Compartilhar expedição" gera a imagem no próprio aparelho, em 4 formatos e 2 tamanhos (Post 1:1 e Story 9:16):

- **Resumo:** nome, data, título, distância, tempo, ritmo e lugares, com o mapa ao lado da foto.
- **Foto com dados:** os números e a forma do trajeto por cima da foto.
- **Adesivo:** PNG transparente para colar por cima de qualquer foto nos Stories.
- **Só o mapa:** o cartão com o mapa no lugar da foto.

O botão "Escolher foto da galeria" troca a foto e usa a resolução cheia. O trajeto sai sempre sem os primeiros e os últimos 150 m ("Início e final ocultos"). O mapa usa os tiles do OpenStreetMap com o crédito na imagem; se não carregarem, entra um fundo ilustrado. Passos não são contados: o navegador não dá acesso ao pedômetro do celular.

**Tag da mandala (MindAR).** Nas missões das lojas (`tag: true` em `config.js`), a câmera procura a tag `assets/tag.png` no balcão e o surucuá pousa em cima dela. Achar a tag já prova que a pessoa está na loja, então a missão vale sem GPS. Botão "Estou sem a tag" volta para o modo livre. A biblioteca (`vendor/mindar.js`, 1,3 MB) só carrega quando esse modo abre. O alvo compilado é `assets/tag.mind`: se mudar a arte da tag, ele precisa ser gerado de novo. No painel da loja há o botão "Baixar a tag" para imprimir.

O `assets/tag.mind` reconhece três alvos: 0 = a mandala impressa (deitada no balcão) e 1 = o letreiro neon "É junto dos Bão" (foto de referência em `assets/tag-neon.jpg`, na parede) e 2 = o logo "Cheirin Bão" da caneca (recorte em `assets/tag-caneca.jpg`). Qualquer um dos três faz o surucuá pousar e vale a missão. Para trocar ou incluir alvos, compile todas as imagens juntas num único `.mind`, na mesma ordem, e ajuste a lista `SPOTS` em `startTag` (`app.js`) com o tamanho e a posição do pássaro em cada alvo.

**Mapa real (Leaflet + OpenStreetMap).** Pinos grandes, botão 📍 "Onde estou", lugares marcados e a rota da expedição desenhada. O endereço dos mapas fica em `config.js` (`map.tiles`). Regras do OpenStreetMap: deixar a atribuição visível, enviar a origem do site (por isso a política de referência é `strict-origin-when-cross-origin`), não baixar mapas para usar offline. O acesso pode ser cortado em uso pesado ou comercial: se acontecer, troque `map.tiles` por outro provedor e adicione o domínio dele em `img-src` na CSP (`index.html`, `.htaccess`, `firebase.json`).

**Modo Procurar (LocAR.js, do projeto AR.js).** Na câmera, o surucuá voa na direção do lugar escolhido, usando GPS e bússola, mostra a distância e diz para que lado girar. A menos de 40 m, oferece tirar a foto. No iPhone, o celular pede permissão para a bússola. A bússola de alguns aparelhos aponta errado; o mapa continua sendo o caminho principal.

**Coordenadas de exemplo.** As posições das missões em `config.js` são aproximadas, perto do centro. Confira cada uma no mapa e troque `coordsOk` para `true`: só então a missão exige estar perto do lugar.

**Notificações:** os avisos do pet aparecem dentro do app (bolinha vermelha no Jardim e mensagens). Notificação com o app fechado precisa do Firebase Cloud Messaging e de um servidor; fica para a próxima etapa.

**Aprovar missões de loja:** no console do Firestore, abra `storeMissions`, confira a loja e mude `status` para `ok`. Se quiser, adicione `mapX` e `mapY` (0 a 1) para o pino no mapa e `lat`/`lng` para exigir presença.

## Busca no território, encontro, Almanaque e expedição (high concept atualizado)

**Busca no território.** Câmera › "Olhar ao redor aqui". Funciona sem expedição e sem tag: a localização do aparelho precisa estar a até `encounter.radiusMeters` (120 m) de um lugar com `lat`/`lng` em `config.js`. Nas lojas, o adesivo só avisa que vale abrir o jogo; a espécie é surpresa. A posição não é salva nem enviada.

**Encontro.** A ave aparece cabisbaixa (pose `triste`); ao perceber a pessoa, ergue cabeça e asas (pose `pedido`) e acende a bolinha no ícone de chat. O chat entra recolhido; o balão fica no alto, fora da área de toque da ave. "Ouvir o texto" só fala quando tocado. Aceitar: a ave canta (clipe `feliz` + `canto`). Foto (obturador) e "Levar para o Jardim" são ações separadas. Recusar: despedida, "Mudei de ideia" e "Avisar no feed que tem uma ave aqui". As poses `triste` e `pedido` são feitas em `pets.js` mexendo nos ossos `head`, `wingL` e `wingR` sobre o `idle` (não são clipes do `.glb`).

**Reencontro (hipótese em teste).** Com `encounter.recognizeAfterGardenVisit: true`, a ave que já visitou o Jardim mostra "♥ Lembrou de você" e "Oi, você voltou!".

**Jardim.** "Levar para o Jardim" deixa a ave de visita por `encounter.visitHours` (2 h). Com fome, alimentar soma `encounter.feedExtraHours` (1 h). Ao fim da visita ela volta ao habitat e o Jardim mostra onde revê-la. O surucuá que o jogador já tinha antes dessa versão continua no Jardim como antes.

**Comida e Almanaque.** Na revisita, a comida da ave do lugar aparece na câmera (uma por dia). Quando alguém encontra a própria ave num lugar, o app grava `spawns/{lugar}_{espécie}` (só lugar, espécie e hora) e a comida dessa espécie passa a aparecer ali para os outros por 7 dias. Pegar a comida de outra espécie faz o ícone do Almanaque piscar e revela só aquela espécie em preto e branco. O Almanaque usa a ficha de `species.*.almanac` em `config.js`: `{ text, src }` por campo, ou `null` para "pendente de verificação". Outras aves entram depois da curadoria, com arte própria (`img`).

**Expedição.** O aviso "Atenção, hora de olhar ao redor" (e variações em `nearby.lines`) aparece dentro do app quando a localização já está permitida e há um lugar a até `nearby.meters`. Tocar abre o Mapa em Lista, em ordem de distância, sem dizer a espécie. "Fazer esta expedição" num post abre os destinos daquele percurso. A expedição só começa em "Começar expedição"; ao encerrar aparece o resumo, e fotos e publicação são opcionais.

**Feed.** Tipos novos: `checkin` (sem trilha), `encounter` (ave virtual) e `sighting` com `real: true` ("Vi na vida real", com link para o iNaturalist). Até 3 fotos extras ficam na parte privada (`posts_private.photos`).

## Ligar o Firebase (gratuito, plano Spark)

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com/).
2. **Authentication → Sign-in method:** ative **Anônimo** (para jogar) e **Google** (só é pedido na hora de publicar).
3. **Firestore Database:** crie em modo produção, na região `southamerica-east1` (São Paulo).
4. Publique as regras deste projeto: copie `firestore.rules` em Firestore → Regras, ou rode `firebase deploy --only firestore:rules`.
5. Crie o documento `stats/city` com o campo `photos` (número) = `0`.
6. **Configurações do projeto → Seus apps → Web:** copie o objeto de configuração para `firebase:` em `config.js`.
7. **Authentication → Settings → Authorized domains:** deixe só o seu domínio (ex.: `seuusuario.github.io`).
8. Crie o documento `config/public` com o campo `feedOpen` (booleano) = `false`. Ele só vira `true` quando a moderação estiver pronta (ver abaixo).

A `apiKey` do Firebase não é segredo: ela só identifica o projeto. Quem protege os dados são as regras do `firestore.rules`.

## Versão pública: o que está fechado e por quê

Esta versão deixa todo mundo jogar sem conta e mantém fechado o que depende de verificação de idade ou de moderação.

| Função | Estado | O que falta para abrir |
| --- | --- | --- |
| Jogar (jardim, missões, acessórios, mapa, mundo real) | Aberto, sem conta | — |
| Publicar post ou marcar lugar | **Fechado** para todos | Verificação de idade confiável (ver abaixo) |
| Feed público (ver posts de outras pessoas) | **Fechado**: cada um vê só os seus | Responsável e canal de moderação, e então `config/public.feedOpen = true` |
| Caixinha de Natal (roleta) | **Ativada** | 10 caixinhas iniciais disponíveis; sorteio e prêmios continuam no app |
| Apagar meus dados | Aberto | Canal sem login com contato real (ver Privacidade) |

### Publicar: conta Google + maioridade verificada

- O app pede o login Google só quando a pessoa toca em **Publicar no feed** ou **Marcar um lugar**. Cancelar não muda nada no progresso local.
- Conta anônima é **vinculada** ao Google (`linkWithPopup`): o UID continua o mesmo e os posts antigos continuam da pessoa. Se a conta Google já pertencer a outro UID, o app explica o conflito e só troca de conta se a pessoa escolher. Nada é mesclado nem apagado; o perfil anônimo anterior continua no servidor.
- As regras (`canPublish()`) exigem conta Google **e** a claim `ageVerified == true` no token. Essa claim só pode ser gravada por backend confiável (Admin SDK, `setCustomUserClaims(uid, { ageVerified: true })`) depois de uma verificação de idade real. Login Google, e-mail confirmado ou data digitada pela pessoa **não** liberam. Sem essa integração, ninguém publica.
- Quando houver um serviço de verificação, guarde só o resultado mínimo (a claim). Não colete CPF, data de nascimento nem documento no app.
- O contador `stats/city` só sobe junto com um post autorizado criado no mesmo lote (`users.lastPostId` aponta para um post que não existia antes).

### Posts: o que é público e o que é privado

- Post novo (`posts/{id}`, campo `v: 2`): apelido, missão, XP, km, tempo, lugares e clube. **Sem** dono, foto, trajeto ou coordenadas.
- Parte privada (`posts_private/{id}`): dono, foto reduzida e trajeto resumido. Só o dono lê e apaga.
- Apagar o próprio post continua permitido mesmo para quem não pode mais publicar.
- **Posts antigos** (antes da v2) têm `uid`, foto e trajeto no documento público. As regras novas deixam esses posts visíveis **só para o dono**, mesmo com o feed aberto. Migração necessária antes de mostrá-los publicamente (script de admin, não automático): para cada post sem `v`, criar `posts_private/{id}` com `uid`, `photo` e `route`; regravar `posts/{id}` sem esses campos e com `v: 2`. Nenhum post antigo é apagado.
- **Lugares marcados** (`places`) continuam com leitura pública (o mapa precisa deles) e os antigos têm `uid` no documento. Marcar lugar agora exige `canPublish()`. Pendente: migrar o `uid` dos lugares para uma parte privada, como nos posts.

### Moderação (antes de abrir o feed)

- Denúncia: botão ⋯ em cada post → coleção `reports` (só criação; ninguém lê pelo app).
- Revisão: a equipe abre Firestore → `reports`, confere o post (`posts/{postId}`) e, se for o caso, apaga `posts/{id}`, `posts_private/{id}` e os aplausos `posts/{id}/claps`.
- **Pendente:** nome do responsável pela moderação, prazo de resposta e um canal real. Enquanto isso não existir, mantenha `feedOpen = false`.

### Caixinha de Natal

Ativada em `config.js` (`box: { enabled: true }`). Novos jogadores começam com 10 caixinhas; o estado salvo existente recebe esse saldo uma vez. Abrir uma caixinha desconta 1 unidade e concede um prêmio pelas chances visíveis.

### Privacidade e exclusão

- **Apagar meus dados** apaga primeiro no servidor, nesta ordem: aplausos dados por este aparelho, posts (com os aplausos neles e a parte privada), lugares marcados (com as visitas), pedidos de impressão, perfil e conta. Só depois limpa o aparelho. Se uma etapa falhar, o app mostra o que já foi apagado, mantém o jogo no aparelho e deixa tentar de novo (repetir é seguro).
- **Não** sai pelo botão (atendimento manual pela equipe, no console): denúncias enviadas (`reports`), pedidos "Este lugar é meu?" (`claims`), contatos e missões de loja (`leads`, `storeMissions`), confirmações de visita em lugares de outras pessoas, e aplausos dados por outro aparelho.
- **Pendente:** canal de pedido de exclusão sem login (para quem perdeu o celular). Coloque um contato real e confirmado em `config.js › privacy.contact`; enquanto for `null`, o app diz que o canal está em definição. Definir também: responsável, prazo de atendimento e por quanto tempo cada dado é guardado.
- Estes ajustes são técnicos e não garantem, sozinhos, conformidade com a LGPD ou o ECA Digital.

### Testes das regras (Firebase Emulator)

`tests/rules.test.mjs` cobre: check-in sem trilha, "Vi na vida real", ave virtual, fotos extras e a coleção `spawns`; e também: visitante, conta anônima e Google sem idade não publicam; Google + `ageVerified` publica; contador não sobe sem post; post público com foto/uid é recusado; feed fechado e aberto; posts antigos só para o dono; aplausos; apagar post, aplausos e perfil; marcar lugar sem permissão. Para rodar (Node 18+ e Java 11+):

```
npm i -D firebase-tools @firebase/rules-unit-testing firebase
npx firebase emulators:exec --only firestore --project demo-expedicoes "node tests/rules.test.mjs"
```

## Segurança

O que já está feito:

- **Regras do Firestore com tudo negado por padrão.** Cada gravação é validada no servidor: campos permitidos, tipos, tamanhos, dono, hora do servidor e limite de 1 post a cada 30 s por pessoa. Aplauso só de 1 em 1, um por pessoa. Contatos de lojistas são só de escrita: ninguém lê pelo app.
- **Mínimo de dados do jogador.** Login anônimo e apelido. Áudio e câmera nunca saem do aparelho. O feed recebe a foto reduzida (até 160 KB) que a pessoa posta, XP, km e a rota sem os primeiros e últimos 150 m e com precisão de cerca de 10 m. Cada pessoa pode apagar os próprios posts, e qualquer post pode ser denunciado.
- **Sem injeção de código.** Nenhum dado digitado é inserido como HTML; tudo vira texto puro. O apelido é limpo (letras, números e espaço, até 20 caracteres).
- **Política de segurança de conteúdo (CSP)** no `index.html`, e cabeçalhos completos em `firebase.json` (Firebase Hosting) e `.htaccess` (Hostinger): bloqueio de iframes, `nosniff`, HTTPS obrigatório, câmera e microfone só para o próprio site.
- **Bibliotecas locais** em `vendor/`: Three.js 0.181 + LocAR.js 0.2.12 num pacote só (`three-locar.js`), MindAR 1.2.5 (`mindar.js`, carregado só no modo tag), Leaflet 1.9.4 e qrcode-generator 1.4.4. Sem CDN de terceiros. Licenças MIT, BSD-2 (Leaflet) e Apache-2.0 (TensorFlow.js, dentro da MindAR).
- **Sem fontes ou rastreadores externos.** O único endereço de fora são as imagens do mapa do OpenStreetMap.
- **LGPD:** tela de privacidade, consentimento no formulário de lojistas e "Apagar meus dados".
- **Lei Felca (Lei 15.211/2025):** Caixinha só se ganha jogando, não tem cupom nem dinheiro e mostra as chances; missão nunca exige compra; feed sem comentários livres e com fim; nada de anúncio por perfil.

Antes de abrir para o público:

- [ ] Ativar o **App Check** (reCAPTCHA Enterprise) no Firebase, para que só o seu site use o banco.
- [ ] Configurar **alerta de orçamento** no Google Cloud.
- [ ] Preencher `lat`/`lng` das missões em `config.js` para exigir presença no lugar.
- [ ] Revisar a lista de espécies com um especialista e trocar `review: true` por `false`.
- [ ] Publicar uma política de privacidade com o seu contato de encarregado (LGPD).
- [ ] No GitHub Pages não dá para definir cabeçalhos: a CSP do `index.html` cobre o principal, mas o bloqueio de iframes só vale na Hostinger ou no Firebase Hosting.

## Arquivos

| Arquivo | Para quê |
| --- | --- |
| `index.html` | Estrutura e CSP |
| `config.js` | Missões, espécies, comidas, prêmios e textos (edite aqui) |
| `app.js` | O jogo |
| `db.js` | Dados: modo demonstração ou Firebase |
| `pets.js` | Surucuá em 3D (.glb), cores e acessórios de Natal |
| `styles.css` | Visual |
| `sw.js`, `manifest.webmanifest` | App instalável |
| `firestore.rules` | Regras de segurança do banco |
| `firebase.json`, `.htaccess` | Cabeçalhos de segurança da hospedagem |

## Próximos passos

- Surucuá com materiais, asas fechadas e animações (parado, pouso, falar, tonto, feliz).
- Painel real da loja e trilha Padrinho da Serra (pagamento por provedor, nunca pelo app).
- Notificações dos pets (Firebase Cloud Messaging).
