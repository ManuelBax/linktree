const linksContainer = document.getElementById('links');

// chiave pubblica di Web3Forms
const WEB3FORMS_KEY = '57a36a75-0082-4f16-9d0d-d61c82164090';

// elementi della finestra "proponi un'uscita"
const modal = document.getElementById('outing-modal');
const form = document.getElementById('outing-form');
const closeBtn = document.getElementById('outing-close');
const statusEl = document.getElementById('outing-status');
const sendBtn = form.querySelector('.btn-send');

// creazione dei pulsanti da links.json
fetch('links.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Errore nel caricamento dei link: ${response.status}`);
    }
    return response.json();
  })
  .then((links) => {
    links.forEach((link) => {
      let el;

      if (link.type === 'outing') {
        // non è un link: è un bottone che apre la finestra
        el = document.createElement('button');
        el.type = 'button';
        el.addEventListener('click', () => modal.showModal());
      } else {
        el = document.createElement('a');

        if (link.type === 'mail') {
          // encodeURIComponent gestisce apostrofi, spazi ed emoji
          el.href = `mailto:${link.email}?subject=${encodeURIComponent(link.subject)}`;
        } else {
          el.href = link.url;
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        }
      }

      el.className = 'btn';
      el.textContent = link.title;
      linksContainer.appendChild(el);
    });
  })
  .catch((error) => {
    console.error(error);
    linksContainer.innerHTML = '<p class="bio">Impossibile caricare i link.</p>';
  });

// finestra uscita: apertura, chiusura, invio
const oggi = new Date();
const yyyy = oggi.getFullYear();
const mm = String(oggi.getMonth() + 1).padStart(2, '0');
const dd = String(oggi.getDate()).padStart(2, '0');
form.elements.data.min = `${yyyy}-${mm}-${dd}`;

// chiusura,tasto × oppure click fuori dalla finestra
closeBtn.addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.close();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // la pagina non si ricarica

  // se la trappola è spuntata è un bot,non inviamo niente
  if (form.elements.botcheck.checked) return;

  const nome = form.elements.nome.value.trim();
  const ora = form.elements.ora.value;
  const luogo = form.elements.luogo.value.trim();
  const programma = form.elements.programma.value.trim();

  // "T00:00" evita che la data venga letta in UTC e slitti di un giorno
  const data = new Date(form.elements.data.value + 'T00:00');
  const giorno = data.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // bottone in stato caricamento
  sendBtn.disabled = true;
  sendBtn.textContent = 'Invio in corso…';
  statusEl.textContent = '';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Un'offerta che non puoi rifiutare: ${giorno} 🍻`,
        from_name: 'Linktree · Usciamo?',
        name: nome,
        Giorno: giorno,
        Ora: ora || 'da decidere',
        Dove: luogo || 'da decidere',
        Programma: programma,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    statusEl.textContent = 'Ti rispondo presto';
    form.reset();
    setTimeout(() => {
      modal.close();
      statusEl.textContent = '';
    }, 2000);
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Qualcosa è andato storto, riprova tra poco.';
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Invia 🍻';
  }
});