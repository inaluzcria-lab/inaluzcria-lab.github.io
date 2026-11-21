# Expedições de Miguel Pereira · protótipo

Jogo de celular em realidade aumentada com o **surucuá-variado**, ave real da Mata Atlântica. Ele é o guia e o pet: o jogador visita lugares da cidade, ganha acessórios de Natal para vestir o surucuá, cuida dele e posta. Roda no navegador, sem instalar, e pode virar app na tela inicial.

## Rodar agora (modo demonstração)

Sem Firebase, tudo fica salvo só no aparelho. É o jeito mais rápido de testar.

1. Suba a pasta inteira no GitHub Pages ou na Hostinger. A câmera só funciona em **https**.
2. Para testar no computador: `python3 -m http.server 8000` dentro da pasta e abra `http://localhost:8000`.
3. Edite `config.js` para trocar missões, lojas, espécies, dicas e prêmios.

## O que funciona (todas as telas do mockup aprovado)

| Tela | O que tem |
| --- | --- |
| Início | Stories dos lugares, árvore da cidade, Passe de Natal, feed com foto, XP, lugares, pets, km e tempo; aplausos, "Fazer esta rota", apagar o próprio post e denunciar; feed com fim |
| Detalhe da expedição | Estilo Strava: rota desenhada, distância, tempo, lugares, XP e pets |
| Clubes | Desafio da semana com ranking, Guardiões do mês, criar e entrar em clubes por código (sem chat) |
| Mapa | Pinos grandes, lista, "Como chegar", Rota do pisca-pisca (XP em dobro depois das 18h), expedição com GPS, lugares marcados |
| Expedição | Escolhe o companheiro, mede km e tempo pelo GPS, junta lugares e pets, publica com a rota sem os primeiros e últimos 150 m |
| Marcar lugar | GPS a até 50 m, foto na hora, tipo e nome, aviso de duplicado; "em descoberta" até 3 visitas; bicho do ambiente; some em 30 dias |
| Este lugar é meu? | Dono escolhe plano e manda contato; a equipe confere antes de valer |
| Câmera em RA | Surucuá em 3D sobre a câmera, com os acessórios; dica dele em balão e voz; Galeria como reserva; modo Procurar |
| Recompensa e Story | XP, pet novo, presente certo da loja, Caixinha, Story 1080×1920 com QR, pedido de impressão |
| Jardim | Surucuá como tamagotchi (fome, carinho, sono, alegria), mochila, carinho, "Falar" com voz mais aguda, pet passeia se esquecido |
| Vínculo | Mensagens do pet no estilo WhatsApp, rotina pela hora do dia, respostas rápidas, vínculo 5 libera o canto |
| Guarda-roupa | Veste um acessório de Natal por parte do corpo (cabeça, pescoço, asas, rosto) |
| Caixinha e Passe | Chances visíveis, só se ganha jogando; trilha grátis com missões do dia; Padrinho da Serra com preço em aberto |
| Perfil | Nível, sequência, convite, almanaque com ficha, conquistas, letra grande, privacidade, apagar dados |
| Loja | Contato com consentimento, criar missão por modelo (fica pendente até você aprovar), QR do balcão, painel de exemplo, oferta de VR |
| Instalar | PWA na tela inicial |

**Um bicho só: o surucuá.** É o guia (dicas e voz na câmera) e o pet. Cada missão dá um acessório de Natal (gorro, laço, cachecol, pisca-pisca nas asas, óculos de estrela); a Caixinha dá o gorro dourado. O almanaque virou o Guarda-roupa.

**Modelo e animações.** O modelo é o seu `surucua.blend`, em `assets/models/surucua.glb`. A textura `SurucuaUV.png` não encaixa nas UVs do arquivo (a `UVMap` está vazia e a `map1` é o layout antigo do tucano), e o arquivo não tem o esqueleto nem animações salvas. Por isso as cores seguem o concept (capuz e costas azul-escuro, barriga amarela grande, bico claro, olho azul com anel amarelo) e as animações são feitas em `pets.js`, deformando o próprio modelo:

| Animação | Quando | Como |
| --- | --- | --- |
| Pouso | Primeira aparição: na tag, na câmera e ao abrir o jardim | Desce batendo as asas e fecha as asas ao pousar |
| Idle | Parado | Asas fechadas, respiração no peito, vira devagar |
| Canto | Toque no surucuá | Toca a sua gravação (`assets/audio/canto.mp3`) e o peito infla no ritmo do som, só o peito |
| Voo | Modo Procurar (corrida) | Bate as asas e inclina para frente |
| Fala | "Falar" no jardim | Peito acompanha a sua voz repetida |

Se você mandar o `.blend` com a UV da textura e o esqueleto com as ações (pouso, idle, canto, voo), eu troco as animações do código pelas suas.

**Compartilhar a expedição (estilo Strava).** No detalhe de uma expedição sua, o botão "Compartilhar expedição" gera a imagem no próprio aparelho, em 4 formatos e 2 tamanhos (Post 1:1 e Story 9:16):

- **Resumo:** nome, data, título, distância, tempo, ritmo e lugares, com o mapa ao lado da foto.
- **Foto com dados:** os números e a forma do trajeto por cima da foto.
- **Adesivo:** PNG transparente para colar por cima de qualquer foto nos Stories.
- **Só o mapa:** o cartão com o mapa no lugar da foto.

O botão "Escolher foto da galeria" troca a foto e usa a resolução cheia. O trajeto sai sempre sem os primeiros e os últimos 150 m ("Início e final ocultos"). O mapa usa os tiles do OpenStreetMap com o crédito na imagem; se não carregarem, entra um fundo ilustrado. Passos não são contados: o navegador não dá acesso ao pedômetro do celular.

**Tag da mandala (MindAR).** Nas missões das lojas (`tag: true` em `config.js`), a câmera procura a tag `assets/tag.png` no balcão e o surucuá pousa em cima dela. Achar a tag já prova que a pessoa está na loja, então a missão vale sem GPS. Botão "Estou sem a tag" volta para o modo livre. A biblioteca (`vendor/mindar.js`, 1,3 MB) só carrega quando esse modo abre. O alvo compilado é `assets/tag.mind`: se mudar a arte da tag, ele precisa ser gerado de novo. No painel da loja há o botão "Baixar a tag" para imprimir.

**Mapa real (Leaflet + OpenStreetMap).** Pinos grandes, botão 📍 "Onde estou", lugares marcados e a rota da expedição desenhada. O endereço dos mapas fica em `config.js` (`map.tiles`). Regras do OpenStreetMap: deixar a atribuição visível, enviar a origem do site (por isso a política de referência é `strict-origin-when-cross-origin`), não baixar mapas para usar offline. O acesso pode ser cortado em uso pesado ou comercial: se acontecer, troque `map.tiles` por outro provedor e adicione o domínio dele em `img-src` na CSP (`index.html`, `.htaccess`, `firebase.json`).

**Modo Procurar (LocAR.js, do projeto AR.js).** Na câmera, o surucuá voa na direção do lugar escolhido, usando GPS e bússola, mostra a distância e diz para que lado girar. A menos de 40 m, oferece tirar a foto. No iPhone, o celular pede permissão para a bússola. A bússola de alguns aparelhos aponta errado; o mapa continua sendo o caminho principal.

**Coordenadas de exemplo.** As posições das missões em `config.js` são aproximadas, perto do centro. Confira cada uma no mapa e troque `coordsOk` para `true`: só então a missão exige estar perto do lugar.

**Notificações:** os avisos do pet aparecem dentro do app (bolinha vermelha no Jardim e mensagens). Notificação com o app fechado precisa do Firebase Cloud Messaging e de um servidor; fica para a próxima etapa.

**Aprovar missões de loja:** no console do Firestore, abra `storeMissions`, confira a loja e mude `status` para `ok`. Se quiser, adicione `mapX` e `mapY` (0 a 1) para o pino no mapa e `lat`/`lng` para exigir presença.

## Ligar o Firebase (gratuito, plano Spark)

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com/).
2. **Authentication → Sign-in method:** ative só **Anônimo**.
3. **Firestore Database:** crie em modo produção, na região `southamerica-east1` (São Paulo).
4. Publique as regras deste projeto: copie `firestore.rules` em Firestore → Regras, ou rode `firebase deploy --only firestore:rules`.
5. Crie o documento `stats/city` com o campo `photos` (número) = `0`.
6. **Configurações do projeto → Seus apps → Web:** copie o objeto de configuração para `firebase:` em `config.js`.
7. **Authentication → Settings → Authorized domains:** deixe só o seu domínio (ex.: `seuusuario.github.io`).

A `apiKey` do Firebase não é segredo: ela só identifica o projeto. Quem protege os dados são as regras do `firestore.rules`.

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
