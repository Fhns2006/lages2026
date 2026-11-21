const btnOpenVideo = document.getElementById('btnOpenVideo');
const videoModal = document.getElementById('videoModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const localVideoPlayer = document.getElementById('localVideoPlayer');

function abrirModal() {
  videoModal.classList.add('is-open');
  videoModal.setAttribute('aria-hidden', 'false');
}

function fecharModal() {
  videoModal.classList.remove('is-open');
  videoModal.setAttribute('aria-hidden', 'true');
  localVideoPlayer.pause();
}

btnOpenVideo.addEventListener('click', abrirModal);
btnCloseModal.addEventListener('click', fecharModal);

videoModal.addEventListener('click', (event) => {
  if (event.target === videoModal) {
    fecharModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && videoModal.classList.contains('is-open')) {
    fecharModal();
  }
});

// Mural de recados com Supabase e modo administrador
const SUPABASE_REST_URL = 'https://hwpyxghwbhguvuljcwxf.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cHl4Z2h3YmhndXZ1bGpjd3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMjM1NTYsImV4cCI6MjExMDc5OTU1Nn0.pUEk-8D0JOPKs0bZjawrTubXpi93UcOhu90RvLtRARA';
const ADMIN_SENHA = 'lages2026';

let isAdmin = false;
let mensagens = [];

const messageForm = document.getElementById('messageForm');
const senderNameInput = document.getElementById('senderName');
const senderOriginSelect = document.getElementById('senderOrigin');
const messageTextInput = document.getElementById('messageText');
const messagesList = document.getElementById('messagesList');

const adminLockedBox = document.getElementById('adminLockedBox');
const adminUnlockedBox = document.getElementById('adminUnlockedBox');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const btnAdminLogin = document.getElementById('btnAdminLogin');
const btnAdminLogout = document.getElementById('btnAdminLogout');

const headersSupabase = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function carregarMensagens() {
  try {
    const resp = await fetch(
      `${SUPABASE_REST_URL}/recados?select=*&order=criado_em.desc`,
      { headers: headersSupabase }
    );
    if (!resp.ok) throw new Error('Falha ao buscar recados');
    mensagens = await resp.json();
    renderizarMensagens(mensagens);
  } catch (err) {
    messagesList.innerHTML = '<p>Não foi possível carregar os recados no momento.</p>';
  }
}

function atualizarInterfaceAdmin() {
  if (isAdmin) {
    adminLockedBox.style.display = 'none';
    adminUnlockedBox.style.display = 'flex';
  } else {
    adminLockedBox.style.display = 'flex';
    adminUnlockedBox.style.display = 'none';
  }
  renderizarMensagens(mensagens);
}

async function excluirMensagem(id) {
  if (!isAdmin || !id) return;
  const confirmar = confirm('Deseja realmente excluir este recado?');
  if (!confirmar) return;

  try {
    const resp = await fetch(
      `${SUPABASE_REST_URL}/recados?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: headersSupabase
      }
    );
    if (!resp.ok) throw new Error('Falha ao excluir recado');
    await carregarMensagens();
  } catch (err) {
    alert('Erro ao excluir o recado.');
  }
}

function renderizarMensagens(lista) {
  messagesList.innerHTML = '';

  if (!lista.length) {
    messagesList.innerHTML = '<p>Ainda não há recados publicados. Seja o primeiro a deixar uma mensagem!</p>';
    return;
  }

  lista.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'message-card';

    const header = document.createElement('div');
    header.className = 'message-header';

    const author = document.createElement('span');
    author.className = 'message-author';
    author.textContent = item.nome;

    const actions = document.createElement('div');
    actions.className = 'message-actions';

    const badge = document.createElement('span');
    badge.className = 'message-badge';
    badge.textContent = item.origem;
    actions.appendChild(badge);

    if (isAdmin) {
      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn-delete';
      btnDelete.textContent = 'Excluir';
      btnDelete.addEventListener('click', () => excluirMensagem(item.id));
      actions.appendChild(btnDelete);
    }

    const body = document.createElement('p');
    body.className = 'message-body';
    body.textContent = item.texto;

    header.appendChild(author);
    header.appendChild(actions);
    card.appendChild(header);
    card.appendChild(body);
    messagesList.appendChild(card);
  });
}

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nome = senderNameInput.value.trim();
  const origem = senderOriginSelect.value;
  const texto = messageTextInput.value.trim();

  if (!nome || !texto) return;

  try {
    const resp = await fetch(`${SUPABASE_REST_URL}/recados`, {
      method: 'POST',
      headers: headersSupabase,
      body: JSON.stringify([{ nome, origem, texto }])
    });
    if (!resp.ok) throw new Error('Falha ao publicar recado');

    messageTextInput.value = '';
    messageTextInput.focus();
    await carregarMensagens();
  } catch (err) {
    alert('Não foi possível publicar o recado.');
  }
});

btnAdminLogin.addEventListener('click', () => {
  const digitada = adminPasswordInput.value;
  if (digitada === ADMIN_SENHA) {
    isAdmin = true;
    adminPasswordInput.value = '';
    atualizarInterfaceAdmin();
  } else {
    alert('Senha incorreta.');
  }
});

adminPasswordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    btnAdminLogin.click();
  }
});

btnAdminLogout.addEventListener('click', () => {
  isAdmin = false;
  atualizarInterfaceAdmin();
});

carregarMensagens();