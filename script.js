const linksContainer = document.getElementById('links');

fetch('links.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Errore nel caricamento dei link: ${response.status}`);
    }
    return response.json();
  })
  .then((links) => {
    links.forEach((link) => {
      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.className = 'btn';
      anchor.textContent = link.title;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';

      if (link.class) {
        anchor.classList.add(link.class);
      }

      linksContainer.appendChild(anchor);
    });
  })
  .catch((error) => {
    console.error(error);
    linksContainer.innerHTML = '<p class="bio">Impossibile caricare i link.</p>';
  });
