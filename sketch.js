//➖➖➖⬛⬛⬛⬛⬛
//➖➖⬛🟥🟥🟥🟥🟥⬛
//➖➖⬛🟥⬛⬛⬛⬛⬛⬛
//⬛⬛⬛🟥⬛🟦🟦⬜⬜⬛
//⬛🟥⬛🟥⬛🟦🟦🟦🟦⬛
//⬛🟥⬛🟥⬛⬛⬛⬛⬛⬛
//⬛🟥⬛🟥🟥🟥🟥🟥⬛
//⬛🟥⬛🟥🟥🟥🟥🟥⬛
//⬛⬛⬛🟥🟥⬛🟥🟥⬛
//➖➖⬛🟥🟥⬛🟥🟥⬛
//➖➖⬛⬛⬛➖⬛⬛⬛

//nota:
//esse desnho acima não tem interção ou sentido algum coma a atividade, é apenas um desenho para enfeitar o código :D


const G = 9.81;
const TEMPO_MAX = 10;

let sistema = "Plano Inclinado";
let tipoArrasto = "Linear";
let animacaoAtiva = true;
let tempoAnimacao = 0;
let ultimoTempo = 0;

let controles = {};
let botaoSistema = [];
let seletorArrasto;
let botaoPausa;

let resultados = {};
let dadosGrafico = [];

const cores = {
  fundo: "#151923",
  painel: "#202635",
  texto: "#F1F4FA",
  secundario: "#AAB4C8",
  grade: "#394356",
  azul: "#72A7FF",
  laranja: "#FFB86C",
  vermelho: "#FF6978",
  cinza: "#8995AA"
};

function setup() {
  createCanvas(1000, 650);
  textFont("Arial");

  // Sliders do plano inclinado
  controles.m1 = criarSlider(1, 0.1, 10, 0.1, 720, 200);
  controles.m2 = criarSlider(1, 0.1, 10, 0.1, 720, 260);
  controles.theta = criarSlider(30, 0, 80, 1, 720, 320);
  controles.mu = criarSlider(0.2, 0, 1, 0.01, 720, 380);

  // Sliders da força centrípeta
  controles.m = criarSlider(1, 0.1, 10, 0.1, 720, 200);
  controles.R = criarSlider(3, 0.5, 10, 0.1, 720, 260);
  controles.v = criarSlider(5, 0.1, 20, 0.1, 720, 320);

  // Sliders da força de arrasto
  controles.ma = criarSlider(1, 0.1, 10, 0.1, 720, 200);
  controles.b = criarSlider(1, 0.1, 5, 0.1, 720, 260);
  controles.c = criarSlider(1, 0.1, 5, 0.1, 720, 320);

  // Menu do tipo de arrasto
  seletorArrasto = createSelect();
  seletorArrasto.option("Linear");
  seletorArrasto.option("Quadrático");
  seletorArrasto.position(720, 380);
  seletorArrasto.changed(() => {
    tipoArrasto = seletorArrasto.value();
  });

  // Menu dos sistemas
  const sistemas = [
    "Plano Inclinado",
    "Força Centrípeta",
    "Força de Arrasto"
  ];

  for (let i = 0; i < sistemas.length; i++) {
    let btn = createButton(sistemas[i]);
    btn.position(720, 75 + i * 35);
    btn.size(250, 29);
    btn.mousePressed(() => {
      sistema = sistemas[i];
      atualizarVisibilidade();
    });
    botaoSistema.push(btn);
  }

  botaoPausa = createButton("Pausar animação");
  botaoPausa.position(720, 425);
  botaoPausa.size(250, 32);
  botaoPausa.mousePressed(() => {
    animacaoAtiva = !animacaoAtiva;
    botaoPausa.html(
      animacaoAtiva ? "Pausar animação" : "Retomar animação"
    );
  });

  atualizarVisibilidade();
  calcularSistema();
  ultimoTempo = millis();
}

function criarSlider(valor, minimo, maximo, passo, x, y) {
  let s = createSlider(minimo, maximo, valor, passo);
  s.position(x, y);
  s.size(240);
  s.style("accent-color", "#72A7FF");
  return s;
}

function atualizarVisibilidade() {
  const grupos = {
    inclinado: ["m1", "m2", "theta", "mu"],
    centripeta: ["m", "R", "v"],
    arrasto: ["ma", "b", "c"]
  };

  const grupoAtual =
    sistema === "Plano Inclinado" ? "inclinado" :
    sistema === "Força Centrípeta" ? "centripeta" : "arrasto";

  for (const [nome, slider] of Object.entries(controles)) {
    if (grupos[grupoAtual].includes(nome)) {
      slider.show();
    } else {
      slider.hide();
    }
  }

  seletorArrasto.elt.style.display =
    sistema === "Força de Arrasto" ? "block" : "none";

  botaoPausa.elt.style.display =
    sistema === "Força Centrípeta" ? "block" : "none";
}

function draw() {
  background(cores.fundo);

  calcularSistema();

  // Relógio da animação
  const agora = millis();
  const dt = min((agora - ultimoTempo) / 1000, 0.05);
  ultimoTempo = agora;

  if (animacaoAtiva && sistema === "Força Centrípeta") {
    tempoAnimacao += dt;
  }

  desenharCabecalho();
  desenharGrafico();
  desenharPainelResultados();
  desenharPainelControles();
}

function desenharCabecalho() {
  fill(cores.texto);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(23);
  text("Simulação — Leis de Newton", 25, 18);

  textSize(12);
  fill(cores.secundario);
  text("Modelos físicos interativos", 27, 47);

  fill(cores.azul);
  textSize(14);
  text(sistema, 28, 79);
}

function calcularSistema() {
  dadosGrafico = [];

  if (sistema === "Plano Inclinado") {
    calcularPlanoInclinado();
  } else if (sistema === "Força Centrípeta") {
    calcularCentripeta();
  } else {
    calcularArrasto();
  }
}

// --------------------------------------------------
// SISTEMA 1: PLANO INCLINADO
// --------------------------------------------------

function calcularPlanoInclinado() {
  const m1 = controles.m1.value();
  const m2 = controles.m2.value();
  const thetaGraus = controles.theta.value();
  const mu = controles.mu.value();

  const theta = radians(thetaGraus);

  // Componente do peso paralela ao plano
  const pesoParalelo = m1 * G * sin(theta);

  // Força normal
  const normal = m1 * G * cos(theta);

  // Modelo simplificado de atrito
  const atrito = mu * normal;

  // Força motriz, considerando m2 descendo
  const forcaMotriz = m2 * G - pesoParalelo;

  let aceleracao;
  let tracao;
  let status;

  if (abs(forcaMotriz) <= atrito + 1e-10) {
    aceleracao = 0;
    tracao = m2 * G;
    status = "Equilíbrio estático";
  } else {
    const sentido = Math.sign(forcaMotriz);

    aceleracao =
      (forcaMotriz - atrito * sentido) / (m1 + m2);

    tracao = m2 * (G - aceleracao);

    status = aceleracao > 0
      ? "m2 desce / m1 sobe"
      : "m1 desce / m2 sobe";
  }

  // Velocidade final após TEMPO_MAX segundos.
  // O modelo considera velocidade inicial igual a zero.
  const velocidadeFinal = aceleracao * TEMPO_MAX;

  const pontos = [];

  for (let i = 0; i <= 200; i++) {
    const t = TEMPO_MAX * i / 200;
    const posicao = 0.5 * aceleracao * t * t;

    pontos.push({
      x: t,
      y: posicao
    });
  }

  dadosGrafico.push({
    nome: "Posição",
    cor: cores.azul,
    pontos
  });

  resultados = {
    titulo: "PLANO INCLINADO",
    linhas: [
      `Massa m1: ${m1.toFixed(2)} kg`,
      `Massa m2: ${m2.toFixed(2)} kg`,
      `Ângulo: ${thetaGraus.toFixed(1)} graus`,
      `Atrito: ${mu.toFixed(2)}`,
      "",
      `Força normal: ${normal.toFixed(2)} N`,
      `Aceleração: ${aceleracao.toFixed(3)} m/s²`,
      `Tração: ${tracao.toFixed(3)} N`,
      "",
      `Status: ${status}`,
      `Velocidade em 10 s: ${velocidadeFinal.toFixed(2)} m/s`,
      `Velocidade final: ${velocidadeFinal.toFixed(2)} m/s`
    ]
  };
}

// --------------------------------------------------
// SISTEMA 2: FORÇA CENTRÍPETA
// --------------------------------------------------

function calcularCentripeta() {
  const m = controles.m.value();
  const R = controles.R.value();
  const v = controles.v.value();

  const omega = v / R;
  const aceleracaoCentripeta = v * v / R;
  const forcaCentripeta = m * aceleracaoCentripeta;

  resultados = {
    titulo: "FORÇA CENTRÍPETA",
    linhas: [
      `Massa: ${m.toFixed(2)} kg`,
      `Raio: ${R.toFixed(2)} m`,
      `Velocidade: ${v.toFixed(2)} m/s`,
      "",
      "Aceleração centrípeta:",
      `${aceleracaoCentripeta.toFixed(3)} m/s²`,
      "",
      "Força centrípeta:",
      `${forcaCentripeta.toFixed(3)} N`,
      "",
      "Velocidade angular:",
      `${omega.toFixed(3)} rad/s`
    ]
  };
}

// --------------------------------------------------
// SISTEMA 3: FORÇA DE ARRASTO
// --------------------------------------------------

function calcularArrasto() {
  const m = controles.ma.value();
  const b = controles.b.value();
  const c = controles.c.value();

  let vTerminal;
  let velocidade;
  let posicao;

  if (tipoArrasto === "Linear") {
    vTerminal = (m * G) / b;

    velocidade = t =>
      vTerminal * (1 - Math.exp((-b * t) / m));

    posicao = t =>
      vTerminal * t -
      (m / b) * vTerminal *
      (1 - Math.exp((-b * t) / m));

  } else {
    vTerminal = Math.sqrt((m * G) / c);

    velocidade = t =>
      vTerminal * Math.tanh((G * t) / vTerminal);

    posicao = t =>
      ((vTerminal * vTerminal) / G) *
      Math.log(Math.cosh((G * t) / vTerminal));
  }

  const pontosVelocidade = [];
  const pontosPosicao = [];

  for (let i = 0; i <= 200; i++) {
    const t = TEMPO_MAX * i / 200;

    pontosVelocidade.push({
      x: t,
      y: velocidade(t)
    });

    pontosPosicao.push({
      x: t,
      y: posicao(t)
    });
  }

  dadosGrafico = [
    {
      nome: "Velocidade",
      cor: cores.azul,
      pontos: pontosVelocidade
    },
    {
      nome: "Posição",
      cor: cores.laranja,
      pontos: pontosPosicao
    }
  ];

  resultados = {
    titulo: `FORÇA DE ARRASTO — ${tipoArrasto.toUpperCase()}`,
    linhas: [
      `Massa: ${m.toFixed(2)} kg`,
      `Coeficiente linear b: ${b.toFixed(2)}`,
      `Coeficiente quadrático c: ${c.toFixed(2)}`,
      "",
      `Velocidade terminal: ${vTerminal.toFixed(3)} m/s`,
      `Velocidade em 10 s: ${velocidade(TEMPO_MAX).toFixed(3)} m/s`,
      `Posição em 10 s: ${posicao(TEMPO_MAX).toFixed(3)} m`
    ]
  };
}

// --------------------------------------------------
// DESENHO DOS GRÁFICOS
// --------------------------------------------------

function desenharGrafico() {
  const x0 = 65;
  const y0 = 140;
  const largura = 600;
  const altura = 430;

  noStroke();
  fill(cores.painel);
  rect(18, 112, 660, 490, 12);

  if (sistema === "Força Centrípeta") {
    desenharOrbita(x0, y0, largura, altura);
    return;
  }

  const todosY = [];

  for (const serie of dadosGrafico) {
    for (const p of serie.pontos) {
      todosY.push(p.y);
    }
  }

  let minimoY = min(0, ...todosY);
  let maximoY = max(1, ...todosY);

  if (maximoY === minimoY) {
    maximoY = minimoY + 1;
  }

  const margem = (maximoY - minimoY) * 0.08;
  minimoY -= margem;
  maximoY += margem;

  // Grade horizontal e vertical
  stroke(cores.grade);
  strokeWeight(1);

  for (let i = 0; i <= 5; i++) {
    const x = map(i, 0, 5, x0, x0 + largura);
    line(x, y0, x, y0 + altura);

    noStroke();
    fill(cores.secundario);
    textSize(11);
    textAlign(CENTER, TOP);
    text((TEMPO_MAX * i / 5).toFixed(0), x, y0 + altura + 9);

    stroke(cores.grade);
  }

  for (let i = 0; i <= 5; i++) {
    const y = map(i, 0, 5, y0 + altura, y0);
    line(x0, y, x0 + largura, y);

    noStroke();
    fill(cores.secundario);
    textSize(11);
    textAlign(RIGHT, CENTER);

    const valor = minimoY + (maximoY - minimoY) * i / 5;
    text(valor.toFixed(1), x0 - 9, y);

    stroke(cores.grade);
  }

  // Título e eixos
  noStroke();
  fill(cores.texto);
  textAlign(CENTER, TOP);
  textSize(15);

  const titulo = sistema === "Plano Inclinado"
    ? "Deslocamento em função do tempo"
    : "Velocidade e posição em função do tempo";

  text(titulo, x0 + largura / 2, 122);

  fill(cores.secundario);
  textSize(12);
  text("Tempo (s)", x0 + largura / 2, y0 + altura + 31);

  push();
  translate(30, y0 + altura / 2);
  rotate(-HALF_PI);
  text("Valor físico", 0, 0);
  pop();

  // Curvas
  for (const serie of dadosGrafico) {
    noFill();
    stroke(serie.cor);
    strokeWeight(2.5);
    beginShape();

    for (const p of serie.pontos) {
      const x = map(p.x, 0, TEMPO_MAX, x0, x0 + largura);
      const y = map(p.y, minimoY, maximoY, y0 + altura, y0);
      vertex(x, y);
    }

    endShape();
  }

  // Legenda
  let legendaX = x0;

  for (const serie of dadosGrafico) {
    stroke(serie.cor);
    strokeWeight(3);
    line(legendaX, 590, legendaX + 22, 590);

    noStroke();
    fill(cores.texto);
    textAlign(LEFT, CENTER);
    textSize(11);
    text(serie.nome, legendaX + 28, 590);

    legendaX += 135;
  }
}

// --------------------------------------------------
// ANIMAÇÃO CIRCULAR
// --------------------------------------------------

function desenharOrbita(x0, y0, largura, altura) {
  const R = controles.R.value();
  const v = controles.v.value();
  const omega = v / R;

  const cx = x0 + largura / 2;
  const cy = y0 + altura / 2;

  const raioDesenho = min(largura, altura) * 0.38;
  const angulo = omega * tempoAnimacao;

  noStroke();
  fill(cores.texto);
  textAlign(CENTER, TOP);
  textSize(15);
  text("Movimento Circular Uniforme", cx, 122);

  // Órbita
  noFill();
  stroke(cores.cinza);
  strokeWeight(2);
  drawingContext.setLineDash([7, 6]);
  ellipse(cx, cy, raioDesenho * 2, raioDesenho * 2);
  drawingContext.setLineDash([]);

  // Centro
  stroke(cores.texto);
  line(cx - 7, cy, cx + 7, cy);
  line(cx, cy - 7, cx, cy + 7);

  // Posição da massa
  const px = cx + raioDesenho * cos(angulo);
  const py = cy - raioDesenho * sin(angulo);

  stroke(cores.vermelho);
  strokeWeight(2);
  line(cx, cy, px, py);

  noStroke();
  fill(cores.vermelho);
  ellipse(px, py, 17, 17);

  fill(cores.secundario);
  textSize(12);
  textAlign(CENTER, TOP);
  text(
    `R = ${R.toFixed(2)} m    v = ${v.toFixed(2)} m/s    ω = ${omega.toFixed(2)} rad/s`,
    cx,
    y0 + altura + 18
  );
}

// --------------------------------------------------
// PAINEL DE RESULTADOS
// --------------------------------------------------

function desenharPainelResultados() {
  noStroke();
  fill(cores.painel);


  rect(695, 465, 290, 180, 12);

  fill(cores.texto);
  textAlign(LEFT, TOP);
  textSize(14);
  text("Resultados", 710, 474);

  fill(cores.secundario);
  textSize(10.5);

  const linhas = resultados.linhas || [];
  let y = 495;
  const espacamento = 11.8;

  // Exibe todas as linhas, incluindo os resultados finais.
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i] !== "") {
      text(linhas[i], 710, y);
    }
    y += espacamento;
  }
}

// --------------------------------------------------
// PAINEL DE CONTROLES
// --------------------------------------------------

function desenharPainelControles() {
  noStroke();
  fill(cores.painel);
  rect(695, 18, 290, 440, 12);

  fill(cores.texto);
  textAlign(LEFT, TOP);
  textSize(16);
  text("Controles", 710, 29);

  fill(cores.secundario);
  textSize(11);
  text("Sistema selecionado:", 710, 54);

  fill(cores.azul);
  textSize(12);
  text(sistema, 710, 61);

  if (sistema === "Plano Inclinado") {
    desenharValor("Massa m1", controles.m1, 0.1, 10, 2, 185);
    desenharValor("Massa m2", controles.m2, 0.1, 10, 2, 240);
    desenharValor("Ângulo (graus)", controles.theta, 0, 80, 1, 300);
    desenharValor("Atrito μ", controles.mu, 0, 1, 2, 365);

  } else if (sistema === "Força Centrípeta") {
    desenharValor("Massa m (kg)", controles.m, 0.1, 10, 2, 185);
    desenharValor("Raio R (m)", controles.R, 0.5, 10, 2, 240);
    desenharValor("Velocidade v (m/s)", controles.v, 0.1, 20, 2, 300);

  } else {
    desenharValor("Massa (kg)", controles.ma, 0.1, 10, 2, 185);
    desenharValor("Coeficiente linear b", controles.b, 0.1, 5, 2, 240);
    desenharValor("Coeficiente quadrático c", controles.c, 0.1, 5, 2, 300);

    fill(cores.secundario);
    textSize(12);
    text(`Modelo: ${tipoArrasto}`, 800, 400);
  }
}

function desenharValor(nome, slider, minimo, maximo, casas, y) {
  fill(cores.secundario);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text(nome, 710, y);

  fill(cores.texto);
  textAlign(RIGHT, TOP);
  text(slider.value().toFixed(casas), 970, y);
}
