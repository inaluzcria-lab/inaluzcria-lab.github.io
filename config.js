/* =========================================================
   Expedições de Miguel Pereira · configuração
   Edite este arquivo para trocar missões, espécies, dicas e prêmios.
   Nada aqui é segredo: tudo neste arquivo fica público no site.
   ========================================================= */
window.CONFIG = {
  /* Endereço público do jogo (usado no QR e no convite dos Stories).
     Ex.: "https://seuusuario.github.io/expedicoes/". Vazio = endereço atual. */
  siteUrl: "",

  /* Configuração do app Web do Firebase (veja o README).
     null = modo demonstração: tudo fica só neste aparelho. */
  firebase: null,

  city: "Miguel Pereira",
  season: "Natal no Centro",
  seasonEnd: "6 de janeiro",
  cityGoal: 5000,          // fotos da cidade inteira para "acender a árvore"
  cityBase: 3120,          // ponto de partida mostrado no modo demonstração
  printPrice: "R$ 15",     // preço da foto impressa (exemplo; pago no balcão)
  pickupPoints: ["Cheirin Bom de Minas", "Padaria Ágape"],
  nightFrom: 18,           // a partir desta hora, missões de luzes valem XP em dobro
  radiusMeters: 120,       // distância máxima do lugar quando a missão tem lat/lng

  /* O jogo tem um bicho só: o surucuá, que é o guia e o pet. Espécie real da região.
     review: true = falta a revisão de especialista (o app mostra o aviso). */
  guideName: "Surucuá",
  species: {
    surucua: { name: "Surucuá-variado", sci: "Trogon surrucura", fav: "insetinhos", review: true,
               fact: "Ave da Mata Atlântica. Fica parado nos galhos e pega insetos e frutinhas em voos curtos.",
               skill: "Bônus de +20 XP nos lugares de mata." }
  },

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
     lat/lng = posição no mapa real. ATENÇÃO: as coordenadas abaixo são de EXEMPLO.
     Confira cada uma no mapa e troque coordsOk para true: só então a missão exige estar perto do lugar.
     tag: true = a câmera abre procurando a tag da mandala no balcão (o surucuá pousa nela).
     A missão NUNCA exige compra. "gift" é presente certo da loja, nunca sorteado. */
  missions: [
    { id: "pinheiros", name: "Pinheiros iluminados", partner: "Prefeitura de Miguel Pereira",
      task: "Foto com um pinheiro de Natal com pisca-pisca", xp: 50, pet: "surucua", acc: "gorro", food: "folhinhas",
      lights: true, scene: "pinheiro", mapX: .50, mapY: .44, lat: -22.4541, lng: -43.4683, coordsOk: false,
      tip: "Achou um pinheiro com pisca-pisca? Deixa as luzes atrás de você e me chama pra foto. Cuidado ao atravessar a rua, viu?" },
    { id: "sesc", name: "Luzes do Sesc", partner: "Sesc",
      task: "Foto com a instalação de luzes", xp: 100, pet: "surucua", acc: "pisca", food: "insetinhos",
      lights: true, scene: "luzes", mapX: .24, mapY: .28, lat: -22.4528, lng: -43.4701, coordsOk: false,
      tip: "Que luzes lindas! Fica um pouco longe pra caber tudo na foto. Se tiver fila, espera a vez com calma." },
    { id: "cheirin", name: "Chocolatíssimo", partner: "Cheirin Bom de Minas",
      task: "Foto com o Chocolatíssimo da vitrine (não precisa comprar)", xp: 80, pet: "surucua", acc: "cachecol", food: "formiguinhas",
      tag: true, lights: false, scene: "choco", mapX: .66, mapY: .62, lat: -22.455, lng: -43.4676, coordsOk: false,
      gift: "10% no Chocolatíssimo",
      tip: "Chegamos no Cheirin, onde fica o cachecol listrado! Aponta a câmera pro Chocolatíssimo da vitrine. Não precisa comprar nada pra ganhar." },
    { id: "agape", name: "Vitrine da Ágape", partner: "Padaria Ágape",
      task: "Foto com a vitrine de Natal", xp: 60, pet: "surucua", acc: "laco", food: "frutinhas",
      tag: true, lights: false, scene: "padaria", mapX: .36, mapY: .70, lat: -22.4556, lng: -43.4694, coordsOk: false,
      tip: "Cheirinho de pão, né? Enquadra a vitrine de Natal e me deixa aparecer do lado." },
    { id: "salgrosso", name: "Fachada do Sal Grosso", partner: "Sal Grosso Espetaria",
      task: "Foto com a fachada ou a placa da espetaria", xp: 70, pet: "surucua", acc: "oculos", food: "sementes",
      tag: true, lights: false, scene: "espeto", mapX: .84, mapY: .46, lat: -22.4535, lng: -43.4664, coordsOk: false,
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
  /* Privacidade do trajeto: corta o começo e o fim da rota publicada (metros). */
  routePrivacyMeters: 150,

  /* Evento relâmpago (exemplo de horário). */
  flash: { name: "Lago do Javary", text: "Hoje, 19h às 20h: fotos no lago valem XP em dobro", mapX: .60, mapY: .13, lat: -22.4522, lng: -43.4712 },

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
