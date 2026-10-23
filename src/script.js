/* The content and recipe disclosures also work without JavaScript. */
document.documentElement.classList.add('js');

const cards = [...document.querySelectorAll('.food-card')];
const sections = [...document.querySelectorAll('.province-recipes')];
const filters = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#dish-search');
const status = document.querySelector('.result-count');
const emptyState = document.querySelector('.empty-state');
let activeProvince = 'all';

const searchableContent = new Map(cards.map(card => [card,
  `${card.querySelector('h4').textContent} ${card.querySelector('.food-province').textContent} ${card.querySelector('.ingredient-list').textContent}`.toLocaleLowerCase()
]));

function filterDishes() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const section of sections) {
    let visible = 0;
    for (const card of section.querySelectorAll('.food-card')) {
      const matches = (activeProvince === 'all' || activeProvince === section.id) && searchableContent.get(card).includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    }
    section.hidden = visible === 0;
    count += visible;
  }
  status.textContent = query || activeProvince !== 'all'
    ? `${count} ${count === 1 ? 'dish' : 'dishes'} to discover${query ? ` for “${search.value.trim()}”` : ''}.`
    : '35 dishes, countless reasons to gather.';
  emptyState.hidden = count !== 0;
  filters.forEach(button => {
    const selected = button.dataset.filter === activeProvince;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

filters.forEach(button => button.addEventListener('click', () => {
  activeProvince = button.dataset.filter;
  filterDishes();
}));
search.addEventListener('input', filterDishes);

// Keep destination links useful even after a search or province filter.
function revealDestination() {
  const target = document.getElementById(window.location.hash.slice(1));
  if (target && (target.matches('.province-recipes') || target.matches('.food-card'))) {
    activeProvince = 'all';
    search.value = '';
    filterDishes();
    requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  }
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#section"], a[href^="#dish-"]');
  if (link) {
    activeProvince = 'all';
    search.value = '';
    filterDishes();
  }
});
window.addEventListener('hashchange', revealDestination);
if (window.location.hash) revealDestination();

cards.forEach((card, index) => {
  const description = card.querySelector('.dish-description');
  description.id = `story-${index + 1}`;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'read-story';
  toggle.textContent = 'Read the story ↗';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', description.id);
  let expanded = false;
  function setExpanded(value) {
    expanded = value;
    description.classList.toggle('is-expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Show less ↑' : 'Read the story ↗';
  }
  toggle.addEventListener('click', () => setExpanded(!expanded));
  // Expand clipped descriptions when their recommendation links receive focus.
  description.addEventListener('focusin', () => setExpanded(true));
  description.after(toggle);
});
