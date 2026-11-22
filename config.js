/* =========================================================
   Expedições de Miguel Pereira · configuração
   Edite este arquivo para trocar missões, espécies, dicas e prêmios.
   Nada aqui é segredo: tudo neste arquivo fica público no site.
   ========================================================= */
window.CONFIG = {
  /* Endereço público do jogo (usado no QR e no convite dos Stories).
     Ex.: "https://seuusuario.github.io/expedicoes/". Vazio = endereço atual. */
  siteUrl: "https://inaluzcria-lab.github.io/",

  /* Configuração pública do app Web do Firebase. */
  firebase: {
    apiKey: "AIzaSyDgg9GB1Zp62a_hfTY-7nEizrBxQg67Z68",
    authDomain: "valedocafegames.firebaseapp.com",
    projectId: "valedocafegames",
    storageBucket: "valedocafegames.firebasestorage.app",
    messagingSenderId: "334114237396",
    appId: "1:334114237396:web:9c09d7a6e2912413f2c441",
    measurementId: "G-EMSTRY0SZK"
  },

  /* Caixinha de Natal. */
  box: { enabled: true },
  /* Privacidade. contact = canal REAL e confirmado para pedidos de exclusão sem login (e-mail ou formulário).
     null = o app avisa que o canal está em definição. Não coloque contato que ninguém atende. */
  privacy: { contact: null },

  city: "Miguel Pereira",
  season: "Natal no Centro",
  seasonEnd: "6 de janeiro",
  cityGoal: 5000,          // fotos da cidade inteira para "acender a árvore"
  cityBase: 3120,          // ponto de partida mostrado no modo demonstração
  printPrice: "R$ 15",     // preço da foto impressa (exemplo; pago no balcão)
  pickupPoints: ["Cheirin Bom de Minas", "Padaria Ágape"],
  nightFrom: 18,           // a partir desta hora, missões de luzes valem XP em dobro
  radiusMeters: 120,       // distância máxima do lugar quando a missão tem lat/lng
  careThresholds: { hunger: 40, love: 30, sleep: 30, joy: 30 },

  /* O jogo tem um bicho só: o surucuá, que é o guia e o pet. Espécie real da região.
     review: true = falta a revisão de especialista (o app mostra o aviso). */
  guideName: "Surucuá",
  species: {
    surucua: { name: "Surucuá-variado", sci: "Trogon surrucura", fav: "insetinhos", review: true,
               fact: "Ave da Mata Atlântica. Fica parado nos galhos e pega insetos e frutinhas em voos curtos.",
               skill: "Bônus de +20 XP nos lugares de mata.",
               /* Ficha do Almanaque. Preencha só com a curadoria (texto próprio + link da fonte).
                  { text, src } = informação verificada; null = o app mostra "pendente de verificação".
                  obs = link de uma observação em Miguel Pereira no iNaturalist (só o link; nada é importado). */
               almanac: { diet: null, habitat: null, nest: null, obs: null } }
  },
  /* Outras aves do Almanaque entram aqui depois da curadoria, no mesmo formato acima, com:
     fav (comida da espécie, em foods) e img (arte própria do jogo; sem img o app mostra uma silhueta genérica).
     Ex.: tiesangue: { name: "Tiê-sangue", sci: "…", fav: "frutinhas", img: "assets/aves/tie.png", almanac: { … } } */

  /* Busca no território e encontro (sem tag, sem expedição): a localização do lugar cadastrado libera a busca. */
  encounter: {
    radiusMeters: 120,          // distância máxima do lugar cadastrado (lat/lng da missão)
    visitHours: 2,              // quanto tempo a ave fica de visita no Jardim
    feedExtraHours: 1,          // alimentar com fome faz ela ficar mais esse tempo
    /* Hipótese em teste: a ave reconhece a pessoa ("Oi, você voltou!") depois de já ter visitado o Jardim. */
    recognizeAfterGardenVisit: true,
    lines: { ask: "Me leve com você", bye: "Tudo bem… fico por aqui. Tchau!", back: "Oi, você voltou!" }
  },
  /* Aviso de proximidade dentro do app (sem notificação com o app fechado). */
  nearby: { meters: 300, lines: ["Atenção, hora de olhar ao redor", "Psiu, olha em volta!", "Algo se mexeu por aqui…"] },

  /* Acessórios de Natal: cada missão dá um. O surucuá veste um por parte do corpo. */
  accessories: {
    gorro:         { label: "Gorro de Natal",          slot: "cabeca" },
    laco:          { label: "Laço vermelho",           slot: "cabeca" },
    cachecol:      { label: "Cachecol listrado",       slot: "pescoco" },
    pisca:         { label: "Pisca-pisca nas asas",    slot: "asas" },
    oculos:        { label: "Óculos de estrela",       slot: "rosto" },
    gorro_dourado: { label: "Gorro dourado",           slot: "cabeca" }
  },
  slots: { cabeca: "Cabeça", pescoco: "Pescoço", asas: "Asas", rosto: "Rosto" },

  /* Mapa real (Leaflet + OpenStreetMap). Troque o endereço dos mapas sem mexer no código.
     Se trocar de provedor, adicione o domínio dele em img-src na CSP (index.html, .htaccess, firebase.json). */
  map: {
    center: [-22.4539, -43.4689], zoom: 16,
    tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 19
  },

  /* Comidas dos pets: só se ganham nas missões (nunca com dinheiro). */
  foods: {
    frutinhas:    { label: "Frutinhas",    color: "#e08a3c" },
    folhinhas:    { label: "Folhinhas",    color: "#3f8f3a" },
    formiguinhas: { label: "Formiguinhas", color: "#6b4426" },
    insetinhos:   { label: "Insetinhos",   color: "#7a6a2a" },
    sementes:     { label: "Sementes",     color: "#c9a14a" }
  },

  /* Missões. mapX/mapY = posição no mapa ilustrado (0 a 1).
     lat/lng = posição no mapa real, tirada do endereço (OpenStreetMap acha a rua, não o número).
     Confira cada pino no mapa e troque coordsOk para true: só então a missão exige estar perto do lugar.
     anywhere: true = a missão vale em qualquer lugar da cidade (sem pino no mapa), como os pinheiros.
     accNight = acessório que a missão dá depois das 18h (nightFrom) no lugar de "acc".
     tag: true = a câmera abre procurando a tag da mandala no balcão (o surucuá pousa nela).
     A missão NUNCA exige compra. "gift" é presente certo da loja, nunca sorteado. */
  missions: [
    { id: "pinheiros", name: "Pinheiros iluminados", partner: "Prefeitura de Miguel Pereira",
      task: "Foto com qualquer pinheiro de Natal iluminado da cidade", xp: 50, pet: "surucua", acc: "gorro", accNight: "pisca", food: "folhinhas",
      anywhere: true, lights: true, scene: "pinheiro",
      tip: "Achou um pinheiro com pisca-pisca? Deixa as luzes atrás de você e me chama pra foto. Depois das 18h o prêmio é o pisca-pisca nas asas! Cuidado ao atravessar a rua, viu?" },
    { id: "cheirin", name: "Cafezinho", partner: "Cheirin Bom de Minas",
      task: "Foto com o cafezinho na caneca do Cheirin Bão (não precisa comprar)", xp: 80, pet: "surucua", acc: "cachecol", food: "formiguinhas",
      tag: true, lights: false, scene: "cafe", mapX: .66, mapY: .62, lat: -22.4569, lng: -43.4682, coordsOk: false,
      address: "Av. Presidente John Kennedy, 48 - Centro, Miguel Pereira - RJ",
      gift: "10% no cafezinho",
      tip: "Chegamos no Cheirin, onde fica o cachecol listrado! Hum, que cheirinho bão de café! Aponta a câmera pra caneca ou pro letreiro que eu pouso lá. Não precisa comprar nada pra ganhar." },
    { id: "agape", name: "Vitrine da Ágape", partner: "Padaria Ágape",
      task: "Foto com a vitrine de Natal", xp: 60, pet: "surucua", acc: "laco", food: "frutinhas",
      tag: true, lights: false, scene: "padaria", mapX: .36, mapY: .70, lat: -22.4545, lng: -43.4710, coordsOk: false,
      address: "R. Francisco Alves, 57 - Lj 3 - Centro, Miguel Pereira - RJ, 26900-000",
      tip: "Cheirinho de pão, né? Enquadra a vitrine de Natal e me deixa aparecer do lado." },
    { id: "salgrosso", name: "Fachada do Sal Grosso", partner: "Sal Grosso Espetaria",
      task: "Foto com a fachada ou a placa da espetaria", xp: 70, pet: "surucua", acc: "oculos", food: "sementes",
      tag: true, lights: false, scene: "espeto", mapX: .84, mapY: .46, lat: -22.4795, lng: -43.4971, coordsOk: false,
      address: "Tv. Osmar Chaves, 88 - Gov. Portela, Miguel Pereira - RJ, 26900-000",
      tip: "Chegamos no Sal Grosso! Enquadra a placa e me deixa aparecer do lado." }
  ],

  /* Lugares marcados pelos jogadores: tipo de ambiente e o bicho que vem morar lá. */
  placeTypes: {
    agua:     { label: "Beira d'água", pet: "surucua" },
    mata:     { label: "Mata",         pet: "surucua" },
    praca:    { label: "Praça",        pet: "surucua" },
    mirante:  { label: "Mirante",      pet: "surucua" },
    comercio: { label: "Comércio",     pet: "surucua" }
  },
  placeConfirmations: 3,   // visitas de pessoas diferentes para o lugar ficar público
  placeDays: 30,           // some se não for confirmado nesse prazo
  /* Proibido marcar: casas, escolas e lugares de pessoas. */
  placeBlocked: ["casa", "escola", "creche", "residência", "residencia", "apartamento", "condomínio", "condominio"],
  /* Limites do mapa ilustrado (opcional). Com isso, lugares marcados aparecem como pinos.
     Ex.: { north: -22.44, south: -22.47, west: -43.49, east: -43.45 } */
  mapBounds: null,
  /* Privacidade do trajeto: corta o começo e o fim da rota publicada (metros).
     routeHideStartMeters: os primeiros metros saem do mapa, dos dados e da imagem compartilhada.
     routePrivacyMeters: corte do final (já existia; mantido até decisão).
     checkinMeters: abaixo disso, a expedição vira check-in do lugar, sem trilha. */
  routeHideStartMeters: 200,
  routePrivacyMeters: 150,
  checkinMeters: 200,

  /* Evento relâmpago (exemplo de horário). */
  flash: { name: "Lago do Javary", text: "Hoje, 19h às 20h: fotos no lago valem XP em dobro", mapX: .60, mapY: .13, lat: -22.4715, lng: -43.4929,
           address: "Lago de Javary, Governador Portela, Miguel Pereira - RJ" },

  /* Missões do dia do Passe de Natal (trilha grátis). */
  daily: [
    { id: "fed",   label: "Alimentar um pet",        goal: 1, xp: 20 },
    { id: "visit", label: "Fazer 1 missão",          goal: 1, xp: 40 },
    { id: "claps", label: "Aplaudir 3 expedições",   goal: 3, xp: 15 }
  ],

  /* Caixinha de Natal: só se ganha jogando. Nunca é vendida, não tem cupom
     nem dinheiro. As chances aparecem para o jogador e somam 100. */
  prizes: [
    { id: "xp10",    label: "+10 XP",                     chance: 40, xp: 10 },
    { id: "xp25",    label: "+25 XP",                     chance: 25, xp: 25 },
    { id: "enfeite", label: "Enfeite para o jardim",      chance: 20 },
    { id: "gorro",   label: "Gorro dourado do surucuá",   chance: 10 },
    { id: "comida",  label: "Comidinha extra para o pet", chance: 5 }
  ]
};
