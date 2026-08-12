const rail = document.querySelector('#givingControlRail');
const searchTerms = rail?.querySelector('.search-control');
const campaignLookup = rail?.querySelector('#campaignDirectoryPanel');
const researchDossier = rail?.querySelector('.dossier-control');

if (rail && searchTerms && campaignLookup && researchDossier) {
  rail.insertBefore(searchTerms, rail.firstElementChild);
  searchTerms.after(campaignLookup);
  campaignLookup.after(researchDossier);
}
