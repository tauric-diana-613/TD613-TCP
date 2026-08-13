const STATES = Object.freeze([
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],['DC','District of Columbia']
]);

const selectedStates = new Set();

function selected() {
  return [...selectedStates];
}

function summaryText() {
  const count = selectedStates.size;
  return count ? `${count} selected` : '';
}

function updateSummary() {
  const count = document.querySelector('#givingStateFilterCount');
  if (!count) return;
  const text = summaryText();
  count.textContent = text;
  count.hidden = !text;
}

function installStateControl() {
  if (document.querySelector('#givingStateFilter')) return;
  const amountRange = document.querySelector('.contribution-amount-filter');
  if (!amountRange?.parentElement) return;

  const details = document.createElement('details');
  details.id = 'givingStateFilter';
  details.className = 'giving-state-filter';

  const summary = document.createElement('summary');
  summary.innerHTML = '<span>State</span><strong id="givingStateFilterCount" hidden></strong>';
  details.appendChild(summary);

  const menu = document.createElement('div');
  menu.className = 'giving-state-filter-menu';
  menu.setAttribute('role', 'group');
  menu.setAttribute('aria-label', 'Filter contributions by state');
  menu.innerHTML = STATES.map(([code, name]) => `
    <label><input type="checkbox" value="${code}"><span>${code}</span><small>${name}</small></label>
  `).join('');
  details.appendChild(menu);

  menu.addEventListener('change', (event) => {
    const input = event.target.closest?.('input[type="checkbox"]');
    if (!input) return;
    if (input.checked) selectedStates.add(input.value);
    else selectedStates.delete(input.value);
    updateSummary();
  });

  amountRange.insertAdjacentElement('afterend', details);
  updateSummary();
}

const nativeFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init = {}) => {
  let nextInit = init;
  try {
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : null;
    if (body?.operation === 'search.page' && body?.payload?.query) {
      const states = selected();
      const query = { ...body.payload.query };
      query.exact_match = Boolean(document.querySelector('#exactMatchToggle')?.checked);
      query.states = states;
      if (states.length === 1) query.state = states[0];
      else delete query.state;
      nextInit = {
        ...init,
        body: JSON.stringify({
          ...body,
          payload: { ...body.payload, query }
        })
      };
    }
  } catch {
    // Preserve the original request if it is not a Giving JSON envelope.
  }
  return nativeFetch(input, nextInit);
};

installStateControl();
