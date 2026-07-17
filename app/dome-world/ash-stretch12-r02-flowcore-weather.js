export const FLOWCORE_WEATHER_UI_VERSION = 'td613.flowcore.route-weather-visualization/v0.1';

export function renderFlowCoreWeather(host, weather) {
  if (!host) throw new TypeError('Weather host is required.');
  host.textContent = '';
  const root = host.ownerDocument.createElement('section');
  root.className = 'ash-flowcore-weather';
  root.dataset.version = FLOWCORE_WEATHER_UI_VERSION;
  const entries = Object.entries(weather.components || {});
  root.innerHTML = `
    <h3>Flow-Core · artifact-blind route weather</h3>
    <p>No scalar average may conceal a dangerous component.</p>
    <dl>${entries.map(([name,value]) => `<div data-weather-component="${name}"><dt>${name.replaceAll('_',' ')}</dt><dd>${value.state}</dd></div>`).join('')}</dl>
    <p data-weather-intervention>${weather.intervention}</p>
    <p>automatic release: false · automatic Ash action: false · prediction authority: false</p>`;
  host.append(root);
  return root;
}
