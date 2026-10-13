import { mountLoomInstrumentLab } from './instrument-lab.js';
const root=document.querySelector('#loomInstrumentLab');
const lab=mountLoomInstrumentLab(root,{
  environment:window,
  observe:()=>({source_revision:'browser-unpinned',events:[]})
});
window.addEventListener('pagehide',()=>lab?.dispose(),{once:true});
