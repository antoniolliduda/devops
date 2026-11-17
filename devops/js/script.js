//Tema claro/escuro

//Troca o atributo data-theme no <html> (o CSS reage a ele)
//e ajusta o texto do botão.
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  const btn = document.getElementById('tema-btn');
  if (btn) btn.textContent = tema === 'dark' ? '☀️ Claro' : '🌙 Escuro';
}

//Lê o tema salvo (o padrão é escuro) e liga o clique do botão.
//O try/catch é porque o localStorage pode estar bloqueado.
function iniciarTema() {
  let salvo = 'dark';
  try { salvo = localStorage.getItem('tema') || 'dark'; } catch (e) {}
  aplicarTema(salvo);

  const btn = document.getElementById('tema-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const novo = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    aplicarTema(novo);
    try { localStorage.setItem('tema', novo); } catch (e) {}
  });
}


//Filtro por categoria e busca

//Guarda qual botão de filtro está ativo no momento
let categoriaAtual = 'todos';

//Percorre os cards e mostra só os que passam no filtro E na busca.
//Também controla a mensagem "nenhum comando encontrado".
function atualizarLista() {
  const busca = document.getElementById('busca');
  const termo = busca ? busca.value.trim().toLowerCase() : '';
  let visiveis = 0;

  document.querySelectorAll('.item').forEach(item => {
    const okCat = categoriaAtual === 'todos' || item.dataset.categoria === categoriaAtual;
    const okBusca = item.textContent.toLowerCase().includes(termo);
    item.classList.toggle('oculto', !(okCat && okBusca));
    if (okCat && okBusca) visiveis++;
  });

  const vazio = document.getElementById('vazio');
  if (vazio) vazio.style.display = visiveis ? 'none' : 'block';
}

// Chamada quando clica num botão de filtro: marca o botão
// como ativo e atualiza a grade.
function filtrar(categoria) {
  categoriaAtual = categoria;
  document.querySelectorAll('.filtros button').forEach(b => {
    const ativo = b.dataset.filtro === categoria;
    b.classList.toggle('ativo', ativo);
    b.setAttribute('aria-pressed', ativo);
  });
  atualizarLista();
}

function iniciarFiltro() {
  document.querySelectorAll('.filtros button').forEach(b =>
    b.addEventListener('click', () => filtrar(b.dataset.filtro)));

  const busca = document.getElementById('busca');
  if (busca) busca.addEventListener('input', atualizarLista);
}


//Botão "Copiar"
function copiarPlanoB(texto) {
  const area = document.createElement('textarea');
  area.value = texto;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let deuCerto = false;
  try { deuCerto = document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(area);
  return deuCerto;
}

// Copia o texto do <code> que fica ao lado do botão e
// mostra "Copiado!" por um instante.
async function copiarComando(botao) {
  const texto = botao.previousElementSibling.textContent;
  let copiou = false;
  try {
    await navigator.clipboard.writeText(texto);
    copiou = true;
  } catch (e) {
    copiou = copiarPlanoB(texto);
  }

  botao.textContent = copiou ? 'Copiado!' : 'Erro ao copiar';
  botao.classList.toggle('ok', copiou);
  setTimeout(() => {
    botao.textContent = 'Copiar';
    botao.classList.remove('ok');
  }, 1500);
}

function iniciarCopiar() {
  document.querySelectorAll('.copiar').forEach(b =>
    b.addEventListener('click', () => copiarComando(b)));
}


//Formulário de sugestão
function mostrarErro(campo, texto) {
  campo.classList.toggle('invalido', !!texto);
  const span = campo.closest('.campo').querySelector('.erro');
  if (span) span.textContent = texto;
  return !texto;
}

//Valida todos os campos de uma vez, para o usuário ver todos
//os erros juntos e não um por tentativa.
function validarCampos(f) {
  let ok = true;
  const nivel = f.querySelector('input[name="nivel"]:checked');

  ok = mostrarErro(f.nome, f.nome.value.trim().length < 3 ? 'Informe ao menos 3 caracteres.' : '') && ok;
  ok = mostrarErro(f.email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value) ? 'E-mail inválido.' : '') && ok;
  ok = mostrarErro(f.ferramenta, !f.ferramenta.value ? 'Escolha uma ferramenta.' : '') && ok;
  ok = mostrarErro(f.querySelector('input[name="nivel"]'), !nivel ? 'Escolha o nível.' : '') && ok;
  ok = mostrarErro(f.descricao, f.descricao.value.trim().length < 10 ? 'Mínimo de 10 caracteres.' : '') && ok;
  ok = mostrarErro(f.termos, !f.termos.checked ? 'Aceite os termos.' : '') && ok;
  return ok;
}

//Escreve a mensagem de sucesso ou de falha na caixa de feedback.
//O tipo ('sucesso' ou 'falha') vira a classe que o CSS usa.
function exibirMensagem(texto, tipo) {
  const box = document.getElementById('feedback');
  box.textContent = texto;
  box.className = tipo;
}

function iniciarFormulario() {
  const f = document.getElementById('form-contato');
  if (!f) return;

  //No envio: se estiver tudo válido simula o envio e limpa os
  //campos, senão mostra o aviso de erro.
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (validarCampos(f)) {
      exibirMensagem('Sua sugestão foi enviada com sucesso!', 'sucesso');
      f.reset();
    } else {
      exibirMensagem('Corrija os campos destacados e tente novamente.', 'falha');
    }
  });

  //Quando a pessoa mexe num campo, o erro dele some na hora
  f.addEventListener('input', e => {
    if (e.target.closest('.campo')) mostrarErro(e.target, '');
  });
  f.addEventListener('change', e => {
    if (e.target.closest('.campo')) mostrarErro(e.target, '');
  });
}


//Efeitos da página inicial

// Efeito de máquina de escrever: digita uma frase, espera,
// apaga e passa pra próxima.
function digitarComandos() {
  const alvo = document.getElementById('digitando');
  if (!alvo) return;

  const frases = ['git commit -m "primeiro commit"', 'docker run -d nginx', 'kubectl get pods'];

  // Quem prefere menos animação vê só a primeira frase parada
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    alvo.textContent = frases[0];
    return;
  }

  let f = 0, i = 0, apagando = false;
  function passo() {
    const frase = frases[f];
    alvo.textContent = frase.slice(0, i);
    if (!apagando && i === frase.length) { apagando = true; return setTimeout(passo, 1500); }
    if (apagando && i === 0) { apagando = false; f = (f + 1) % frases.length; }
    i += apagando ? -1 : 1;
    setTimeout(passo, apagando ? 30 : 80);
  }
  passo();
}

// Conta quantos cards existem e coloca o número na home,
// assim não preciso atualizar na mão quando adiciono comando.
function contarComandos() {
  const total = document.getElementById('total-cmds');
  if (total) total.textContent = document.querySelectorAll('.item').length;
}


//Inicialização

// Todas as funções são seguras para qualquer página: se o
// elemento não existir, elas simplesmente não fazem nada.
document.addEventListener('DOMContentLoaded', () => {
  iniciarTema();
  iniciarFiltro();
  iniciarCopiar();
  iniciarFormulario();
  digitarComandos();
  contarComandos();
});
