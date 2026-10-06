// wizardToiture.js — moteur du wizard découverte COMBLES PERDUS + TOITURE.
// Même logique que wizardITE.js : une question par écran, mesures saisies sur place,
// calculs automatiques, récap, puis devis écrit directement sur la fiche client du CRM.
//
// Produits : chaque ligne cherche d'abord la référence (champ `ref` du catalogue, ex. "TOIT-DEPOSE-MECA"),
// puis, si la référence n'existe pas encore, l'identifiant produit du catalogue (ex. "P0114").
// → ça marche tout de suite, et tu peux ajouter les références dans Admin → Catalogue quand tu veux.

const CSS = `
  :root{
    --ink:#15181C; --ink-soft:#4A5057;
    --concrete:#ECEAE5; --concrete-2:#E1DFD9;
    --panel:#FFFFFF; --line:#D4D1C8;
    --amber:#F2A900; --amber-deep:#C88700;
    --alert:#C8402A; --alert-bg:#FBEAE6; --ok:#2E7D4F; --ok-bg:#E8F3EC;
  }
  *{box-sizing:border-box;}
  .wizardRoot{
    background:var(--concrete); color:var(--ink);
    font-family:'IBM Plex Sans',sans-serif; -webkit-font-smoothing:antialiased;
    display:flex; flex-direction:column; height:100vh; height:100dvh; overflow:hidden;
  }
  .mono{font-family:'IBM Plex Mono',monospace;}
  .disp{font-family:'Oswald',sans-serif; text-transform:uppercase; letter-spacing:.03em;}

  header{ background:var(--ink); color:#fff; flex-shrink:0; padding:calc(12px + env(safe-area-inset-top)) 16px 10px; border-bottom:4px solid var(--amber); }
  .headrow{display:flex; align-items:center; gap:10px;}
  #backBtn{ background:none; border:1px solid #3A3F45; color:#B9BEC4; width:32px; height:32px; border-radius:2px; cursor:pointer; font-size:16px; flex-shrink:0; visibility:hidden;}
  #backBtn.show{visibility:visible;}
  .headlabel{flex:1; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9AA0A6; letter-spacing:.03em;}
  .headlabel b{color:var(--amber);}

  main{flex:1; overflow-y:auto; display:flex; align-items:flex-start; justify-content:center; padding:28px 18px 100px;}
  .qcard{width:100%; max-width:560px;}
  .eyebrow{font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--amber-deep); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;}
  .qtitle{font-size:22px; line-height:1.28; color:var(--ink); margin-bottom:6px;}
  .qsub{font-size:13px; color:var(--ink-soft); margin-bottom:18px;}
  .warnline{ background:var(--alert-bg); border-left:3px solid var(--alert); color:#7A2A1D; font-size:12.5px; padding:8px 12px; margin-top:14px; border-radius:2px;}
  .okline{ background:var(--ok-bg); border-left:3px solid var(--ok); color:#1E5738; font-size:12.5px; padding:8px 12px; margin-top:14px; border-radius:2px;}

  .choices{display:flex; flex-wrap:wrap; gap:10px; margin-top:6px;}
  .choice-btn{
    flex:1; min-width:130px; background:var(--panel); border:1.5px solid var(--line); color:var(--ink);
    border-radius:3px; padding:14px 12px; cursor:pointer; font-size:14px; font-weight:600; text-align:left;
    transition:.12s; display:flex; flex-direction:column; gap:4px;
  }
  .choice-btn:hover{border-color:var(--amber);}
  .choice-btn .icon{font-size:22px;}
  .choice-btn .desc{font-size:11px; font-weight:400; color:var(--ink-soft);}
  .choice-btn.wide{min-width:100%;}

  .visualcard{ min-width:150px; text-align:center;}
  .visualcard .shape{ width:100%; height:64px; display:flex; align-items:center; justify-content:center; margin-bottom:6px;}
  .visualcard svg{width:56px;height:56px;}

  label.flabel{display:block; font-size:11px; font-weight:700; color:var(--ink-soft); text-transform:uppercase; letter-spacing:.03em; margin:14px 0 5px;}
  input.finput, select.finput{ width:100%; padding:10px 12px; border:1.5px solid var(--line); border-radius:3px; font-size:14px; font-family:inherit; background:var(--panel); color:var(--ink);}
  .row2{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
  .row3{display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;}

  .facadecard{ background:var(--panel); border:1.5px solid var(--line); border-radius:4px; padding:16px; margin-bottom:14px; position:relative;}
  .facadecard .fhead{display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;}
  .facadecard .fhead b{font-size:15px;}
  .facadecard .rm{background:none;border:none;color:var(--alert);cursor:pointer;font-size:13px;font-weight:700;}
  .facadecard .fsummary{font-size:12px; color:var(--ink-soft); margin-top:6px;}

  .addfacade-btn{ width:100%; border:2px dashed var(--line); background:none; color:var(--ink-soft); border-radius:4px; padding:14px; font-size:14px; font-weight:700; cursor:pointer; margin-top:4px;}
  .addfacade-btn:hover{border-color:var(--amber); color:var(--amber-deep);}

  .recap-line{ display:flex; justify-content:space-between; font-size:13px; padding:6px 0; border-bottom:1px solid var(--concrete-2);}
  .recap-group{ margin-bottom:16px;}
  .recap-group h4{ font-family:'Oswald',sans-serif; text-transform:uppercase; font-size:13px; letter-spacing:.03em; color:var(--amber-deep); margin:0 0 6px; border-bottom:2px solid var(--ink); padding-bottom:4px;}
  .recap-total{ display:flex; justify-content:space-between; font-size:18px; font-weight:700; padding-top:12px; margin-top:6px; border-top:3px solid var(--ink);}

  footer{ flex-shrink:0; background:var(--panel); border-top:1.5px solid var(--line); padding:12px 18px calc(12px + env(safe-area-inset-bottom)); display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap;}
  .btn{ padding:12px 22px; border-radius:3px; font-size:14px; font-weight:700; cursor:pointer; border:1.5px solid var(--ink); }
  .btn-primary{ background:var(--ink); color:#fff;}
  .btn-ghost{ background:none; color:var(--ink);}
  .note{font-size:11px; color:#B9840A; background:#FFF7E6; border:1px dashed #E0B23C; padding:6px 10px; border-radius:3px; margin-top:6px;}
`;

let _cssInjectedT = false;
function injectCssT() {
  if (_cssInjectedT) return;
  const style = document.createElement('style');
  style.textContent = CSS + `
    .choice-btn.sel{border-color:var(--amber); background:#FFF7E6; box-shadow:inset 0 0 0 1px var(--amber);}
    .btn:disabled{opacity:.4; cursor:default;}
    .lin-grid{display:grid; grid-template-columns:1fr 110px; gap:8px 12px; align-items:center; margin-top:10px;}
    .lin-grid label{font-size:13px; font-weight:600;}
    .lin-grid .hint{display:block; font-size:11px; font-weight:400; color:var(--ink-soft);}
  `;
  document.head.appendChild(style);
  _cssInjectedT = true;
}

// ─────────────────────────────────────────────────────────
// Produits utilisés (référence conseillée + id catalogue de secours + unité)
// ─────────────────────────────────────────────────────────
const P = {
  // Préparation
  ORGA_CLASSIQUE:   { ref:'ORGA-CLASSIQUE',     id:'P0001', u:'forfait' },
  ORGA_DP:          { ref:'ORGA-DP',            id:'P0016', u:'forfait' },
  PROTECTION:       { ref:'PROTECTION-CHANTIER',id:'P0008', u:'forfait' },
  ECHAF_CLASSIQUE:  { ref:'ECHAF-CLASSIQUE',    id:'P0002', u:'m²' },
  ECHAF_VOIRIE:     { ref:'ECHAF-VOIRIE',       id:'P0003', u:'m²' },
  ECHAF_FORFAIT:    { ref:'ECHAF-FORFAIT',      id:'P0015', u:'forfait' },
  BENNE:            { ref:'BENNE-6M3',          id:'P0004', u:'forfait' },
  CAMION_BENNE:     { ref:'CAMION-BENNE',       id:'P0014', u:'forfait' },
  GRENIER:          { ref:'GRENIER-ENCOMBRE',   id:'P0009', u:'forfait' },
  CACHE_SPOT:       { ref:'CACHE-SPOT',         id:'P0011', u:'u' },
  MONTE_CHARGE:     { ref:'MONTE-CHARGE',       id:'P0132', u:'forfait' },
  ACCES_TOITURE:    { ref:'ACCES-TOITURE',      id:'P0131', u:'forfait' },
  // Combles perdus
  DEBARRAS_MONO:    { ref:'COMBLES-DEBARRAS-MONO',   id:'P0017', u:'m²' },
  DEBARRAS_DOUBLE:  { ref:'COMBLES-DEBARRAS-DOUBLE', id:'P0007', u:'m²' },
  SOUF_ROCHE_R4:    { ref:'SOUF-ROCHE-R4',      id:'P0045', u:'m²' },
  SOUF_ROCHE_R7:    { ref:'SOUF-ROCHE-R7',      id:'P0018', u:'m²' },
  SOUF_ROCHE_R8:    { ref:'SOUF-ROCHE-R8',      id:'P0019', u:'m²' },
  SOUF_VERRE_R7:    { ref:'SOUF-VERRE-R7',      id:'P0041', u:'m²' },
  SOUF_VERRE_R10:   { ref:'SOUF-VERRE-R10',     id:'P0039', u:'m²' },
  SOUF_OUATE_R7:    { ref:'SOUF-OUATE-R7',      id:'P0052', u:'m²' },
  SOUF_BOIS:        { ref:'SOUF-BOIS',          id:'P0051', u:'m²' },
  ROULEAU_200:      { ref:'ROULEAU-KIFIT-200',  id:'P0034', u:'m²' },
  ECART_FEU:        { ref:'ECART-FEU',          id:'P0246', u:'u' },
  OSB:              { ref:'PLANCHER-OSB',       id:'P0144', u:'m²' },
  REHAUSSE:         { ref:'PLANCHER-REHAUSSE',  id:'P0140', u:'m²' },
  SOLIVBOX:         { ref:'SOLIVBOX',           id:'P0026', u:'m²' },
  DEPOSE_PLANCHER:  { ref:'PLANCHER-DEPOSE',    id:'P0141', u:'m²' },
  VMC_REMP_COMPACT_MW:  { ref:'VMC-REMP-COMPACT-MW',  id:'P0252', u:'forfait' },
  VMC_REMP_COMPACT_HP:  { ref:'VMC-REMP-COMPACT-HP',  id:'P0254', u:'forfait' },
  VMC_REMP_PREMIUM_MW:  { ref:'VMC-REMP-PREMIUM-MW',  id:'P0247', u:'forfait' },
  VMC_REMP_PREMIUM_HP:  { ref:'VMC-REMP-PREMIUM-HP',  id:'P0257', u:'forfait' },
  VMC_CREA_COMPACT_MW:  { ref:'VMC-CREA-COMPACT-MW',  id:'P0251', u:'forfait' },
  VMC_CREA_COMPACT_HP:  { ref:'VMC-CREA-COMPACT-HP',  id:'P0255', u:'forfait' },
  VMC_CREA_PREMIUM_MW:  { ref:'VMC-CREA-PREMIUM-MW',  id:'P0256', u:'forfait' },
  VMC_CREA_PREMIUM_HP:  { ref:'VMC-CREA-PREMIUM-HP',  id:'P0248', u:'forfait' },
  ENTREE_AIR:       { ref:'ENTREE-AIR',         id:'P0268', u:'u' },
  EXTRACTEUR_SOLAIRE:{ ref:'EXTRACTEUR-SOLAIRE',id:'P0253', u:'forfait' },
  // Toiture — dépose / charpente
  DEPOSE_MECA:      { ref:'TOIT-DEPOSE-MECA',   id:'P0114', u:'m²' },
  DEPOSE_PLATE:     { ref:'TOIT-DEPOSE-PLATE',  id:'P0158', u:'m²' },
  CHEVRON:          { ref:'TOIT-CHEVRON',       id:'P0129', u:'ml' },
  DEMI_CHEVRON:     { ref:'TOIT-DEMI-CHEVRON',  id:'P0139', u:'ml' },
  PANNE:            { ref:'TOIT-PANNE',         id:'P0135', u:'u' },
  TRAIT_CHARPENTE:  { ref:'TRAIT-BOIS-PULV',    id:'P0265', u:'m²' },
  // Toiture — isolation (sarking)
  SARKING_SEUL:     { ref:'SARKING-NRJ132',            id:'P0157', u:'m²' },
  SARKING_ROCK75:   { ref:'SARKING-NRJ132-ROCK75',     id:'P0138', u:'m²' },
  SARKING_ACOU75:   { ref:'SARKING-NRJ132-ACOU75',     id:'P0151', u:'m²' },
  SARKING_STEICO80: { ref:'SARKING-NRJ132-STEICO80',   id:'P0162', u:'m²' },
  EFIGREEN:         { ref:'EFIGREEN-ALU',              id:'P0163', u:'m²' },
  ACTIS:            { ref:'ACTIS-TRISO',               id:'P0038', u:'m²' },
  // Toiture — couverture
  HPV:              { ref:'TOIT-HPV',           id:'P0122', u:'m²' },
  LITEAUX_CONTRE:   { ref:'TOIT-LITEAUX-CL',    id:'P0115', u:'m²' },
  LITEAUX:          { ref:'TOIT-LITEAUX',       id:'P0134', u:'m²' },
  TUILE_MECA:       { ref:'TUILE-MECA',         id:'P0116', u:'m²' },
  TUILE_MECA_PLATE: { ref:'TUILE-MECA-PLATE',   id:'P0174', u:'m²' },
  TUILE_BETON:      { ref:'TUILE-BETON',        id:'P0136', u:'m²' },
  TUILE_PAYS:       { ref:'TUILE-PLATE-PAYS',   id:'P0128', u:'m²' },
  FAITAGE_CLOSOIR:      { ref:'FAITAGE-CLOSOIR',       id:'P0120', u:'ml' },
  FAITAGE_CLOSOIR_PAYS: { ref:'FAITAGE-CLOSOIR-PAYS',  id:'P0169', u:'ml' },
  FAITAGE_COQ:      { ref:'FAITAGE-CRETE-COQ',  id:'P0149', u:'ml' },
  ARETIER_CLOSOIR:      { ref:'ARETIER-CLOSOIR',       id:'P0153', u:'ml' },
  ARETIER_CLOSOIR_PAYS: { ref:'ARETIER-CLOSOIR-PAYS',  id:'P0168', u:'ml' },
  ARETIER_COQ:      { ref:'ARETIER-CRETE-COQ',  id:'P0156', u:'ml' },
  ARETIER_ZINC:     { ref:'ARETIER-ZINC',       id:'P0127', u:'ml' },
  RIVES_UNIV:       { ref:'RIVES-UNIV',         id:'P0117', u:'ml' },
  RIVES_UNIV_PAYS:  { ref:'RIVES-UNIV-PAYS',    id:'P0171', u:'ml' },
  RIVES_INDIV:      { ref:'RIVES-INDIV',        id:'P0165', u:'ml' },
  RIVES_INDIV_PAYS: { ref:'RIVES-INDIV-PAYS',   id:'P0170', u:'ml' },
  RIVES_MACON:      { ref:'RIVES-MACONNEE',     id:'P0150', u:'ml' },
  ABOUT_FAITAGE:    { ref:'ABOUT-FAITAGE',      id:'P0133', u:'u' },
  ABOUT_RIVE:       { ref:'ABOUT-RIVE',         id:'P0137', u:'u' },
  NOUE:             { ref:'NOUE-ZINC',          id:'P0125', u:'ml' },
  SOLIN:            { ref:'SOLIN-ZINC',         id:'P0126', u:'ml' },
  CHATIERE:         { ref:'TUILE-CHATIERE',     id:'P0118', u:'u' },
  DOUILLE:          { ref:'TUILE-DOUILLE',      id:'P0119', u:'u' },
  CHEMINEE_ETANCH:  { ref:'CHEMINEE-ETANCH',    id:'P0130', u:'u' },
  CHEMINEE_DEPOSE:  { ref:'CHEMINEE-DEPOSE',    id:'P0152', u:'u' },
  // Gouttières / zinguerie
  GOUTT_ZINC_250:   { ref:'GOUTTIERE-ZINC-250', id:'P0154', u:'ml' },
  GOUTT_ZINC_330:   { ref:'GOUTTIERE-ZINC-330', id:'P0121', u:'ml' },
  GOUTT_PVC_250:    { ref:'GOUTTIERE-PVC-250',  id:'P0147', u:'ml' },
  GOUTT_PVC_330:    { ref:'GOUTTIERE-PVC-330',  id:'P0172', u:'ml' },
  DESC_ZINC_80:     { ref:'DESCENTE-ZINC-80',   id:'P0124', u:'ml' },
  DESC_ZINC_100:    { ref:'DESCENTE-ZINC-100',  id:'P0155', u:'ml' },
  DESC_PVC_80:      { ref:'DESCENTE-PVC-80',    id:'P0146', u:'ml' },
  DESC_PVC_100:     { ref:'DESCENTE-PVC-100',   id:'P0173', u:'ml' },
  CHENEAU:          { ref:'CHENEAU-ZINC',       id:'P0160', u:'ml' },
  PLANCHE_RIVE:     { ref:'PLANCHE-RIVE',       id:'P0123', u:'ml' },
  SOUSFACE_PVC:     { ref:'SOUSFACE-PVC',       id:'P0259', u:'m²' },
  SOUSFACE_BOIS:    { ref:'SOUSFACE-BOIS',      id:'P0258', u:'m²' },
  PEINTURE_SOUSFACE:{ ref:'PEINTURE-SOUSFACE',  id:'P0263', u:'ml' },
  // Traitement de toiture
  NETTOYAGE:        { ref:'TOIT-NETTOYAGE',     id:'P0111', u:'m²' },
  HYDRO_INCOLORE:   { ref:'HYDRO-INCOLORE',     id:'P0112', u:'m²' },
  HYDRO_CLASSIQUE:  { ref:'HYDRO-COLORE',       id:'P0113', u:'m²' },
  HYDRO_PREMIUM:    { ref:'HYDRO-PREMIUM',      id:'P0175', u:'m²' },
  HYDRO_REFLECHISSANT:{ ref:'HYDRO-REFLECHISSANT', id:'P0161', u:'m²' },
};

const MODES = {
  COMBLES:        { label:'Combles perdus',                       section:'Isolation des combles perdus' },
  CHANGEMENT:     { label:'Changement de toiture',                section:'Changement de toiture' },
  CHANGEMENT_ISOL:{ label:'Changement de toiture avec isolation', section:'Changement de toiture avec isolation' },
  TRAITEMENT:     { label:'Traitement de toiture',                section:'Traitement de toiture' },
};

const ISOLANTS_COMBLES = [
  { k:'roche7',  label:'Laine de roche soufflée R7', p:'SOUF_ROCHE_R7',  R:7,  ep:'31,5 cm' },
  { k:'roche8',  label:'Laine de roche soufflée R8', p:'SOUF_ROCHE_R8',  R:8,  ep:'36 cm' },
  { k:'verre7',  label:'Laine de verre soufflée R7', p:'SOUF_VERRE_R7',  R:7,  ep:'≈ 32 cm' },
  { k:'verre10', label:'Laine de verre soufflée R10',p:'SOUF_VERRE_R10', R:10, ep:'≈ 45 cm' },
  { k:'ouate7',  label:'Ouate de cellulose R7',      p:'SOUF_OUATE_R7',  R:7,  ep:'≈ 28 cm' },
  { k:'bois',    label:'Laine de bois soufflée',     p:'SOUF_BOIS',      R:7,  ep:'≈ 30 cm' },
  { k:'rouleau', label:'Laine en rouleaux (KIFIT 200 mm)', p:'ROULEAU_200', R:6.25, ep:'20 cm' },
  { k:'roche4',  label:'Laine de roche soufflée R4 (complément)', p:'SOUF_ROCHE_R4', R:4, ep:'≈ 18 cm' },
];

const SARKINGS = [
  { k:'seul',    label:'Sarking NRJ+ 132 seul',              p:'SARKING_SEUL' },
  { k:'rock75',  label:'Sarking NRJ+ 132 + Rockplus 75',     p:'SARKING_ROCK75' },
  { k:'acou75',  label:'Sarking NRJ+ 132 + Acoustiplus 75',  p:'SARKING_ACOU75' },
  { k:'steico80',label:'Sarking NRJ+ 132 + STEICOflex 80',   p:'SARKING_STEICO80' },
  { k:'efigreen',label:'Efigreen Alu+',                      p:'EFIGREEN' },
  { k:'actis',   label:'Isolant mince ACTIS Triso-Super 12', p:'ACTIS' },
];

const TUILES = [
  { k:'meca',  label:'Tuile mécanique terre cuite', p:'TUILE_MECA' },
  { k:'mecaPlate', label:'Tuile mécanique plate', p:'TUILE_MECA_PLATE' },
  { k:'beton', label:'Tuile béton (Double Romane)', p:'TUILE_BETON' },
  { k:'pays',  label:'Tuile plate de pays', p:'TUILE_PAYS' },
];

const FORME_LBL = { rect:'rectangle', trapeze:'trapèze', triangle:'triangle' };
function numF(v){ return parseFloat(String(v==null?'':v).replace(',','.'))||0; }
function r1(n){ return (Math.round(n*10)/10).toLocaleString('fr-FR'); }
function uid(){ return 'x'+Math.random().toString(36).slice(2,8); }
function esc(x){ return String(x==null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function eur(n){ return (Math.round(n*100)/100).toLocaleString("fr-FR",{minimumFractionDigits:2, maximumFractionDigits:2}) + " €"; }
function fmtDatePdf(d){ return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit", month:"2-digit", year:"numeric"}); }

// Surface d'un pan de toiture (mesures en rampant)
function surfacePan(p){
  const b = numF(p.base), bh = numF(p.baseHaute), r = numF(p.rampant);
  if(p.forme==='triangle') return b*r/2;
  if(p.forme==='trapeze')  return (b+bh)/2*r;
  return b*r;
}
// Longueur d'un bord incliné (arêtier) d'un pan triangle / trapèze
function bordIncline(p){
  const b = numF(p.base), bh = numF(p.baseHaute), r = numF(p.rampant);
  if(p.forme==='triangle') return Math.sqrt(r*r + (b/2)*(b/2));
  if(p.forme==='trapeze')  return Math.sqrt(r*r + ((b-bh)/2)*((b-bh)/2));
  return 0;
}

export function mountWizardToiture(container, opts) {
  injectCssT();
  const { catalogue, client, baremesCEE, onGenerate, onExit, mode: modeInit } = opts;

  const state = {
    famille: modeInit==='COMBLES' ? 'COMBLES' : 'TOITURE',
    mode: modeInit==='COMBLES' ? 'COMBLES' : null,   // COMBLES | CHANGEMENT | CHANGEMENT_ISOL | TRAITEMENT
    zones: [],   // combles : [{id, nom, longueur, largeur}]
    pans: [],    // toiture : [{id, nom, forme, base, baseHaute, rampant}]
    lin: { faitage:'', aretiers:'', noues:'', rives:'', egout:'' },
    _linInit: false,
    q: {},
  };
  let cur = null;          // id de l'écran courant
  const hist = [];         // pile des écrans précédents
  let loopSub = null, loopItem = null;   // sous-étape des boucles zones/pans

  container.classList.add('wizardRoot');
  container.innerHTML = `
    <header>
      <div class="headrow">
        <button id="backBtn">←</button>
        <div class="headlabel" id="headLabel"></div>
        <button id="exitBtn" style="background:none;border:none;color:#9AA0A6;font-size:12px;cursor:pointer;">Quitter</button>
      </div>
    </header>
    <main><div class="qcard" id="app"></div></main>
  `;
  const $ = (sel)=> container.querySelector(sel);
  $('#exitBtn').addEventListener('click', ()=> onExit && onExit());
  $('#backBtn').addEventListener('click', goBack);

  // ── Calculs
  const totalZones = ()=> state.zones.reduce((s,z)=> s + numF(z.longueur)*numF(z.largeur), 0);
  const totalPans  = ()=> state.pans.reduce((s,p)=> s + surfacePan(p), 0);
  const isChangement = ()=> state.mode==='CHANGEMENT' || state.mode==='CHANGEMENT_ISOL';
  const tuileDePays = ()=> state.q.tuile==='pays';
  function suggestionsLineaires(){
    let faitage=0, rives=0, egout=0, aretiers=0;
    state.pans.forEach(p=>{
      egout += numF(p.base);
      if(p.forme==='rect'){ faitage += numF(p.base)/2; rives += 2*numF(p.rampant); }
      if(p.forme==='trapeze'){ faitage += numF(p.baseHaute)/2; aretiers += bordIncline(p); } // 2 bords inclinés par pan, chaque arêtier partagé par 2 pans → ×2÷2
      if(p.forme==='triangle'){ aretiers += bordIncline(p); }
    });
    return { faitage, rives, egout, aretiers };
  }
  function calcMontantCEE(){
    const q = state.q;
    if(q.renovationGlobale===1 || q.ceeApplicable!==1) return 0;
    if(state.mode==='COMBLES'){
      const iso = ISOLANTS_COMBLES.find(i=>i.k===q.isolant);
      if(!iso || iso.R<7) return 0;
      const tarif = Number((baremesCEE && baremesCEE.comblesPerdus && baremesCEE.comblesPerdus[q.ceePrecaire==='precaire'?'p':'np'])||0);
      return Math.round(totalZones()*tarif);
    }
    if(state.mode==='CHANGEMENT_ISOL'){
      if(q.ceeR!==1) return 0;
      const tarif = Number((baremesCEE && baremesCEE.rampants && baremesCEE.rampants[q.ceePrecaire==='precaire'?'p':'np'])||0);
      return Math.round(totalPans()*tarif);
    }
    return 0;
  }

  // ─────────────────────────────────────────────────────────
  // Liste des écrans (même principe que les QUESTIONS de l'ITE)
  // only: modes concernés · skip: condition pour sauter
  // ─────────────────────────────────────────────────────────
  const C = ['COMBLES'], T = ['CHANGEMENT','CHANGEMENT_ISOL','TRAITEMENT'], CH = ['CHANGEMENT','CHANGEMENT_ISOL'], CHI = ['CHANGEMENT_ISOL'], TR = ['TRAITEMENT'];
  const SCREENS = [
    // — Toiture : type de travaux
    {id:'mode', type:'custom', only:null, skip:()=> state.famille!=='TOITURE'},
    {id:'demandeur', type:'choice', only:CH, key:'demandeur', eyebrow:'Administratif',
      q:"Qui dépose la déclaration préalable (DP) ?", sub:"Un changement de toiture nécessite une DP → ligne « Organisation de chantier » facturée une seule fois.",
      options:[["🏢 Nous (KORÉO) → Organisation chantier + DP","nous"],["🙋 Le client → Organisation chantier classique","client"]]},

    // — COMBLES : zones
    {id:'zones', type:'zones', only:C},
    {id:'acces', type:'choice', only:C, key:'acces', eyebrow:'Accès',
      q:"Comment accède-t-on aux combles ?", options:[["Trappe intérieure","trappe"],["Pas de trappe → accès par la toiture (détuilage)","toiture"]],
      sub:"Accès par la toiture → ligne « Accès toiture » au forfait."},
    {id:'existant', type:'choice', only:C, key:'existant', eyebrow:'Existant',
      q:"Y a-t-il un ancien isolant à retirer ?", options:[["Non — on souffle par-dessus / rien à retirer","aucun"],["Oui — une couche (mono-couche)","mono"],["Oui — deux couches (double couche)","double"]]},
    {id:'grenier', type:'toggle', only:C, key:'grenier', eyebrow:'Préparation', q:"Le grenier est-il encombré (affaires du client à déplacer) ?", sub:"Oui → « Forfait grenier encombré »."},
    {id:'isolant', type:'isolantCombles', only:C},
    {id:'spots', type:'toggle', only:C, key:'spots', eyebrow:'Sécurité', q:"Y a-t-il des spots encastrés dans le plafond sous les combles ?", sub:"Chaque spot doit recevoir un capot de protection."},
    {id:'spotsNb', type:'number', only:C, key:'spotsNb', unit:'u', q:"Combien de spots ?", skip:q=>q.spots!==1},
    {id:'conduit', type:'toggle', only:C, key:'conduit', eyebrow:'Sécurité', q:"Y a-t-il un conduit de cheminée / poêle qui traverse les combles ?", sub:"Écart au feu obligatoire → cadre + déflecteur."},
    {id:'conduitNb', type:'number', only:C, key:'conduitNb', unit:'u', q:"Combien de conduits ?", skip:q=>q.conduit!==1},
    {id:'plancher', type:'choice', only:C, key:'plancher', eyebrow:'Stockage',
      q:"Le client veut-il garder un espace de rangement dans les combles ?",
      options:[["Non — combles 100 % isolés","aucun"],["Oui — réhausse de plancher","rehausse"],["Oui — plancher OSB seul","osb"],["Oui — Solivbox (isolant porteur)","solivbox"]]},
    {id:'plancherDepose', type:'toggle', only:C, key:'plancherDepose', q:"Faut-il déposer un ancien plancher ?", skip:q=>!q.plancher||q.plancher==='aucun'},
    {id:'plancherM2', type:'number', only:C, key:'plancherM2', unit:'m²', q:"Surface de la zone de rangement ?", skip:q=>!q.plancher||q.plancher==='aucun', sub:'{{plancherSub}}'},
    {id:'vmc', type:'choice', only:C, key:'vmc', eyebrow:'Ventilation', q:"VMC : quelque chose à prévoir ?", options:[["Rien","aucune"],["Remplacement de la VMC existante","remp"],["Création d'une VMC","crea"]]},
    {id:'vmcGamme', type:'choice', only:C, key:'vmcGamme', q:"Quelle gamme de VMC ?", skip:q=>!q.vmc||q.vmc==='aucune',
      options:[["Compact MW","COMPACT_MW"],["Compact HP+","COMPACT_HP"],["Premium MW","PREMIUM_MW"],["Premium HP+","PREMIUM_HP"]]},
    {id:'entreesAir', type:'number', only:C, key:'entreesAir', unit:'u', q:"Combien d'entrées d'air hygroréglables à créer ?", sub:"0 si aucune. Sur menuiseries des pièces principales.", skip:q=>!q.vmc||q.vmc==='aucune'},

    // — TOITURE : pans
    {id:'pans', type:'pans', only:T},
    {id:'lineaires', type:'lineaires', only:CH},
    {id:'echaf', type:'choice', only:T, key:'echaf', eyebrow:'Accès chantier', q:"Quel échafaudage ?",
      options:[["Forfait maison individuelle","forfait"],["Au m² — classique","classique"],["Au m² — voirie","voirie"],["Aucun (nacelle / accès direct)","aucun"]]},
    {id:'echafM2', type:'number', only:T, key:'echafM2', unit:'m²', q:"Combien de m² d'échafaudage ?", skip:q=>q.echaf!=='classique'&&q.echaf!=='voirie'},
    {id:'evac', type:'choice', only:CH, key:'evac', eyebrow:'Évacuation', q:"Évacuation des tuiles et gravats ?", options:[["Benne 6 m³","benne"],["Camion benne","camion"],["Rien à prévoir","aucun"]]},
    {id:'monteCharge', type:'toggle', only:CH, key:'monteCharge', q:"Faut-il un monte-charge ?"},
    {id:'existante', type:'choice', only:CH, key:'existante', eyebrow:'Dépose', q:"Quelle est la couverture actuelle ?", sub:'Dépose calculée sur la surface des pans : {{surfacePans}} m²',
      options:[["Tuile mécanique","meca"],["Tuile plate","plate"]]},
    {id:'chevrons', type:'number', only:CH, key:'chevronsMl', unit:'ml', eyebrow:'Charpente', q:"Chevrons à remplacer (ml) ?", sub:"0 si la charpente est saine."},
    {id:'demiChevrons', type:'number', only:CH, key:'demiChevronsMl', unit:'ml', eyebrow:'Charpente', q:"Demi-chevrons à poser (ml) ?", sub:"0 si aucun."},
    {id:'pannes', type:'number', only:CH, key:'pannesNb', unit:'u', eyebrow:'Charpente', q:"Pannes à remplacer (nombre) ?", sub:"0 si aucune."},
    {id:'traitCharpente', type:'toggle', only:CH, key:'traitCharpente', eyebrow:'Charpente', q:"Traitement de la charpente (insecticide / fongicide) ?", sub:'Calculé sur la surface des pans : {{surfacePans}} m²'},
    {id:'sarking', type:'sarking', only:CHI},
    {id:'hpv', type:'toggle', only:CH, key:'hpv', eyebrow:'Couverture', q:"Pose d'un écran sous-toiture HPV ?", sub:'{{surfacePans}} m²'},
    {id:'liteaux', type:'choice', only:CH, key:'liteaux', eyebrow:'Couverture', q:"Liteaux ?", options:[["Liteaux + contre-liteaux","lcl"],["Liteaux seuls","l"]]},
    {id:'tuile', type:'choice', only:CH, key:'tuile', eyebrow:'Couverture', q:"Quelle tuile neuve ?", options:TUILES.map(t=>[t.label,t.k])},
    {id:'tuileTeinte', type:'text', only:CH, key:'tuileTeinte', eyebrow:'Couverture', q:"Teinte de la tuile ?", unit:'ex : rouge vieilli, ardoisé…'},
    {id:'faitageType', type:'choice', only:CH, key:'faitageType', eyebrow:'Faîtage', q:"Type de faîtage ?", sub:'{{faitageSub}}', skip:()=>numF(state.lin.faitage)<=0,
      options:[["Closoir ventilé (à sec)","closoir"],["Crête de coq scellée à la chaux","coq"]]},
    {id:'aretierType', type:'choice', only:CH, key:'aretierType', eyebrow:'Arêtiers', q:"Type d'arêtier ?", sub:'{{aretierSub}}', skip:()=>numF(state.lin.aretiers)<=0,
      options:[["Closoir ventilé (à sec)","closoir"],["Crête de coq scellée","coq"],["Zinc","zinc"]]},
    {id:'rivesType', type:'choice', only:CH, key:'rivesType', eyebrow:'Rives', q:"Type de rives ?", sub:'{{rivesSub}}', skip:()=>numF(state.lin.rives)<=0,
      options:[["Rives universelles","univ"],["Rives individuelles","indiv"],["Rives maçonnées","macon"]]},
    {id:'aboutsFaitage', type:'number', only:CH, key:'aboutsFaitage', unit:'u', q:"Combien d'abouts de faîtage ?", sub:"En général 2 par faîtage (un à chaque bout).", skip:()=>numF(state.lin.faitage)<=0, def:()=>2},
    {id:'aboutsRives', type:'number', only:CH, key:'aboutsRives', unit:'u', q:"Combien d'abouts de rive ?", sub:"En général 2 par rive (bas + haut). Inclus avec les rives universelles.", skip:q=>numF(state.lin.rives)<=0 || q.rivesType==='univ'},
    {id:'chatieres', type:'number', only:CH, key:'chatieres', unit:'u', eyebrow:'Ventilation', q:"Combien de tuiles chatières ?", sub:"Ventilation de la sous-toiture. 0 si aucune."},
    {id:'douilles', type:'number', only:CH, key:'douilles', unit:'u', eyebrow:'Ventilation', q:"Combien de tuiles à douille (sortie VMC / hotte) ?", sub:"0 si aucune."},
    {id:'solin', type:'number', only:CH, key:'solinMl', unit:'ml', eyebrow:'Zinguerie', q:"Solins zinc (contre un mur / une souche) — combien de ml ?", sub:"0 si aucun."},
    {id:'cheminee', type:'choice', only:CH, key:'cheminee', eyebrow:'Cheminée', q:"Cheminée sur le toit ?", options:[["Pas de cheminée / rien à faire","aucune"],["Réfection de l'étanchéité","etanch"],["Dépose de la cheminée","depose"]]},
    {id:'chemineeNb', type:'number', only:CH, key:'chemineeNb', unit:'u', q:"Combien de cheminées ?", skip:q=>!q.cheminee||q.cheminee==='aucune', def:()=>1},

    // — Traitement de toiture
    {id:'hydro', type:'choice', only:TR, key:'hydro', eyebrow:'Traitement', q:"Quel hydrofuge après le nettoyage ?", sub:'Nettoyage anti-mousse inclus automatiquement sur {{surfacePans}} m².',
      options:[["Hydrofuge incolore","incolore"],["Hydrofuge coloré — classique","classique"],["Hydrofuge coloré — premium","premium"],["Hydrofuge coloré — réfléchissant","reflechissant"],["Pas d'hydrofuge (nettoyage seul)","aucun"]]},
    {id:'hydroTeinte', type:'text', only:TR, key:'hydroTeinte', q:"Teinte de l'hydrofuge coloré ?", unit:'ex : rouge tuile', skip:q=>!q.hydro||q.hydro==='incolore'||q.hydro==='aucun'},

    // — Gouttières / sous-faces (toutes toitures)
    {id:'gouttieres', type:'choice', only:T, key:'gouttieres', eyebrow:'Gouttières', q:"Changement des gouttières ?",
      options:[["Non","non"],["Zinc 250 mm","ZINC_250"],["Zinc 330 mm","ZINC_330"],["PVC 250 mm","PVC_250"],["PVC 330 mm","PVC_330"]]},
    {id:'gouttieresMl', type:'number', only:T, key:'gouttieresMl', unit:'ml', q:"Combien de ml de gouttière ?", sub:'{{egoutSub}}', skip:q=>!q.gouttieres||q.gouttieres==='non', def:()=> numF(state.lin.egout) || r1(suggestionsLineaires().egout).replace(/\s/g,'')},
    {id:'descentes', type:'choice', only:T, key:'descentes', eyebrow:'Gouttières', q:"Changement des descentes ?",
      options:[["Non","non"],["Zinc 80 mm","ZINC_80"],["Zinc 100 mm","ZINC_100"],["PVC 80 mm","PVC_80"],["PVC 100 mm","PVC_100"]]},
    {id:'descentesMl', type:'number', only:T, key:'descentesMl', unit:'ml', q:"Combien de ml de descente ?", skip:q=>!q.descentes||q.descentes==='non'},
    {id:'cheneau', type:'number', only:CH, key:'cheneauMl', unit:'ml', eyebrow:'Gouttières', q:"Chéneau zinc à créer — combien de ml ?", sub:"0 si aucun."},
    {id:'planchesRive', type:'number', only:CH, key:'planchesRiveMl', unit:'ml', eyebrow:'Bois', q:"Planches de rive à changer — combien de ml ?", sub:"0 si aucune."},
    {id:'sousFace', type:'choice', only:T, key:'sousFace', eyebrow:'Sous-faces', q:"Sous-faces de toit (débords) ?",
      options:[["Rien à faire","aucune"],["Nouvelle sous-face PVC blanche","pvc"],["Nouvelle sous-face bois + lasure","bois"],["Peinture des sous-faces bois existantes","peinture"]]},
    {id:'sousFaceQte', type:'number', only:T, key:'sousFaceQte', unit:'', q:"Quantité de sous-face ?", sub:'{{sousFaceSub}}', skip:q=>!q.sousFace||q.sousFace==='aucune'},

    // — CEE
    {id:'renovationGlobale', type:'toggle', only:['COMBLES','CHANGEMENT_ISOL'], key:'renovationGlobale', eyebrow:'Aides',
      q:"S'agit-il d'une rénovation globale ?", sub:"En rénovation globale, l'aide est MaPrimeRénov' — pas de CEE sur ce devis."},
    {id:'ceeApplicable', type:'toggle', only:['COMBLES','CHANGEMENT_ISOL'], key:'ceeApplicable', eyebrow:'Aides',
      q:"Y a-t-il des CEE sur ce chantier ?", sub:'{{ceeSub}}', skip:q=>q.renovationGlobale===1},
    {id:'ceeR', type:'toggle', only:CHI, key:'ceeR', eyebrow:'Aides', q:"La résistance thermique atteint-elle R ≥ 6 ?", sub:"Condition CEE pour les rampants / toiture avec isolation.", skip:q=>q.renovationGlobale===1||q.ceeApplicable!==1},
    {id:'ceePrecaire', type:'choice', only:['COMBLES','CHANGEMENT_ISOL'], key:'ceePrecaire', eyebrow:'Aides', q:"Le foyer est-il en situation de précarité énergétique ?",
      sub:"Détermine le barème CEE (précaire ou classique).", options:[["Précaire","precaire"],["Non précaire (classique)","classique"]],
      skip:q=>q.renovationGlobale===1||q.ceeApplicable!==1||(state.mode==='CHANGEMENT_ISOL'&&q.ceeR!==1)},

    {id:'recap', type:'recap', only:null},
  ];

  function screenOk(s){
    if(s.id==='mode') return state.famille==='TOITURE';
    if(s.only && !s.only.includes(state.mode)) return false;
    if(s.skip && s.skip(state.q)) return false;
    return true;
  }
  function firstScreen(){ return SCREENS.find(screenOk).id; }
  function visibleScreens(){ return SCREENS.filter(screenOk); }
  function go(id){ if(cur) hist.push({ id:cur, sub:loopSub }); cur=id; loopSub=null; render(); }
  function advance(){
    const idx = SCREENS.findIndex(s=>s.id===cur);
    for(let i=idx+1;i<SCREENS.length;i++){ if(screenOk(SCREENS[i])){ go(SCREENS[i].id); return; } }
  }
  function goBack(){
    // dans une boucle : on recule d'abord à l'intérieur de la boucle
    if((cur==='zones'||cur==='pans') && loopBack()) return;
    const prev = hist.pop();
    if(!prev) return;
    cur = prev.id; loopSub = prev.sub || null;
    if(cur==='zones' || cur==='pans'){ loopSub='again'; }
    render();
  }

  // ─────────────────────────────────────────────────────────
  // Rendu
  // ─────────────────────────────────────────────────────────
  function render(){
    const app = $('#app');
    const vis = visibleScreens();
    const pos = Math.max(0, vis.findIndex(s=>s.id===cur));
    const titre = state.famille==='COMBLES' ? 'DÉCOUVERTE COMBLES' : 'DÉCOUVERTE TOITURE';
    $('#headLabel').innerHTML = titre+' — <b>'+esc((client.nom||'')+' '+(client.prenom||''))+'</b> · '+(pos+1)+'/'+vis.length;
    $('#backBtn').classList.toggle('show', hist.length>0 || ((cur==='zones'||cur==='pans') && loopSub && loopSub!=='nom'));
    const s = SCREENS.find(x=>x.id===cur);
    if(!s) return;
    if(s.type==='custom' && s.id==='mode') return renderMode(app);
    if(s.type==='zones') return renderZones(app);
    if(s.type==='pans') return renderPans(app);
    if(s.type==='lineaires') return renderLineaires(app);
    if(s.type==='isolantCombles') return renderIsolantCombles(app);
    if(s.type==='sarking') return renderSarking(app);
    if(s.type==='recap') return renderRecap(app);
    return renderGeneric(app, s, pos, vis.length);
  }

  function fillSub(sub){
    if(!sub) return '';
    const sp = totalPans();
    const sugg = suggestionsLineaires();
    const map = {
      '{{surfacePans}}': r1(sp),
      '{{plancherSub}}': 'Surface totale des combles : '+r1(totalZones())+' m². Le soufflage sera fait sur toute la surface ; le plancher seulement sur cette zone.',
      '{{faitageSub}}': numF(state.lin.faitage)+' ml de faîtage'+(tuileDePays()?' · tarif tuile plate de pays appliqué':''),
      '{{aretierSub}}': numF(state.lin.aretiers)+' ml d\'arêtiers'+(tuileDePays()?' · tarif tuile plate de pays appliqué':''),
      '{{rivesSub}}': numF(state.lin.rives)+' ml de rives'+(tuileDePays()?' · tarif tuile plate de pays appliqué':''),
      '{{egoutSub}}': numF(state.lin.egout)>0 ? 'Longueur d\'égout saisie : '+numF(state.lin.egout)+' ml' : 'Total des longueurs à l\'égout des pans : '+r1(sugg.egout)+' ml',
      '{{sousFaceSub}}': state.q.sousFace==='peinture' ? 'En mètres linéaires (ml).' : 'En m² (longueur × largeur du débord).',
      '{{ceeSub}}': state.mode==='COMBLES' ? 'Combles perdus : il faut R ≥ 7. Surface : '+r1(totalZones())+' m².' : 'Toiture avec isolation : il faut R ≥ 6. Surface : '+r1(sp)+' m².',
    };
    return Object.entries(map).reduce((t,[k,v])=> t.split(k).join(v), sub);
  }

  function backRow(nextHtml){ return `<div style="display:flex; gap:10px; margin-top:16px;"><button class="btn btn-ghost" data-back>Précédent</button>${nextHtml||''}</div>`; }
  function wireBack(app){ app.querySelectorAll('[data-back]').forEach(b=> b.addEventListener('click', goBack)); }

  function renderGeneric(app, s, pos, n){
    const sub = fillSub(s.sub);
    const head = `<div class="eyebrow">${s.eyebrow?esc(s.eyebrow)+' · ':''}Question ${pos+1} / ${n}</div><div class="qtitle">${s.q}</div>${sub?`<div class="qsub">${sub}</div>`:''}`;
    if(s.type==='choice'){
      const opts = s.options.map(o=> Array.isArray(o)?o:[o,o]);
      app.innerHTML = head + `<div class="choices">${opts.map(([l,v],i)=>`<button type="button" class="choice-btn wide ${state.q[s.key]===v?'sel':''}" data-i="${i}">${l}</button>`).join('')}</div>` + backRow();
      app.querySelectorAll('[data-i]').forEach(b=> b.addEventListener('click', ()=>{ state.q[s.key]=opts[+b.dataset.i][1]; advance(); }));
      wireBack(app); return;
    }
    if(s.type==='toggle'){
      app.innerHTML = head + `<div class="choices"><button type="button" class="choice-btn ${state.q[s.key]===0?'sel':''}" id="tNon">Non</button><button type="button" class="choice-btn ${state.q[s.key]===1?'sel':''}" id="tOui">Oui</button></div>` + backRow();
      $('#tNon').addEventListener('click', ()=>{ state.q[s.key]=0; advance(); });
      $('#tOui').addEventListener('click', ()=>{ state.q[s.key]=1; advance(); });
      wireBack(app); return;
    }
    // number / text
    let val = state.q[s.key];
    if((val===undefined||val==='') && s.def) val = s.def();
    app.innerHTML = head + `<input class="finput" id="qInput" type="text" inputmode="${s.type==='number'?'decimal':'text'}" value="${esc(val==null?'':val)}" placeholder="${esc(s.unit||'')}"/>` + backRow(`<button class="btn btn-primary" id="qNext">Suivant</button>`);
    const inp = $('#qInput'); inp.focus();
    const ok = ()=>{ state.q[s.key]=inp.value; advance(); };
    $('#qNext').addEventListener('click', ok);
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter') ok(); });
    wireBack(app);
  }

  // — Choix du type de travaux toiture
  function renderMode(app){
    const opts = [
      ['CHANGEMENT','🏚️','Changement de toiture','Dépose + nouvelle couverture, sans isolation'],
      ['CHANGEMENT_ISOL','🧱','Changement de toiture avec isolation','Dépose + sarking / isolant + nouvelle couverture (CEE possibles)'],
      ['TRAITEMENT','🧽','Traitement de toiture','Nettoyage anti-mousse + hydrofuge'],
    ];
    app.innerHTML = `
      <div class="eyebrow">Type de travaux</div>
      <div class="qtitle">Quel chantier de toiture ?</div>
      <div class="choices">${opts.map(([k,ic,l,d])=>`<button type="button" class="choice-btn wide ${state.mode===k?'sel':''}" data-k="${k}"><span class="icon">${ic}</span>${l}<span class="desc">${d}</span></button>`).join('')}</div>`;
    app.querySelectorAll('[data-k]').forEach(b=> b.addEventListener('click', ()=>{ state.mode=b.dataset.k; advance(); }));
  }

  // — Boucle zones de combles (comme les façades de l'ITE)
  function loopBack(){
    if(cur==='zones'){
      const z = loopItem;
      if(loopSub==='longueur'){ loopSub='nom'; render(); return true; }
      if(loopSub==='largeur'){ loopSub='longueur'; render(); return true; }
      if(loopSub==='nom' && state.zones.length>0 && z && !state.zones.includes(z)){ loopSub='again'; render(); return true; }
      if(loopSub==='again'){ loopItem = state.zones.pop(); loopSub='largeur'; render(); return true; }
      return false;
    }
    if(cur==='pans'){
      const p = loopItem;
      if(loopSub==='forme'){ loopSub='nom'; render(); return true; }
      if(loopSub==='base'){ loopSub='forme'; render(); return true; }
      if(loopSub==='baseHaute'){ loopSub='base'; render(); return true; }
      if(loopSub==='rampant'){ loopSub = p.forme==='trapeze'?'baseHaute':'base'; render(); return true; }
      if(loopSub==='nom' && state.pans.length>0 && p && !state.pans.includes(p)){ loopSub='again'; render(); return true; }
      if(loopSub==='again'){ loopItem = state.pans.pop(); loopSub='rampant'; render(); return true; }
      return false;
    }
    return false;
  }

  function numStep(app, eyebrow, title, sub, val, placeholder, onOk, showBack=true){
    app.innerHTML = `<div class="eyebrow">${eyebrow}</div><div class="qtitle">${title}</div>${sub?`<div class="qsub">${sub}</div>`:''}
      <input class="finput" id="lInput" type="text" inputmode="decimal" value="${esc(val||'')}" placeholder="${placeholder}"/>
      <div style="display:flex; gap:10px; margin-top:16px;">${showBack?'<button class="btn btn-ghost" data-back>Précédent</button>':''}<button class="btn btn-primary" id="lNext">Suivant</button></div>`;
    const inp = $('#lInput'); inp.focus();
    const ok = ()=> onOk(inp.value);
    $('#lNext').addEventListener('click', ok);
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter') ok(); });
    wireBack(app);
  }

  function renderZones(app){
    if(!loopSub){ loopSub = state.zones.length ? 'again' : 'nom'; }
    if(loopSub==='nom' && (!loopItem || state.zones.includes(loopItem))) loopItem = { id:uid(), nom:'', longueur:'', largeur:'' };
    const z = loopItem, n = state.zones.length + (state.zones.includes(z)?0:1);
    const deja = state.zones.length ? `<div class="okline">✓ Déjà mesuré : ${state.zones.map(x=>esc(x.nom||'Zone')+' '+r1(numF(x.longueur)*numF(x.largeur))+' m²').join(' · ')}</div>` : '';
    if(loopSub==='nom'){
      app.innerHTML = `<div class="eyebrow">Combles · Zone ${n}</div><div class="qtitle">Nom de cette zone de combles ?</div>
        <div class="qsub">Ex : Combles maison, Combles garage, Extension… Mesure au sol (surface du plafond en dessous).</div>${deja}
        <input class="finput" id="lInput" type="text" value="${esc(z.nom)}" placeholder="ex : Combles maison"/>
        ${backRow('<button class="btn btn-primary" id="lNext">Suivant</button>')}`;
      const inp=$('#lInput'); inp.focus();
      const ok=()=>{ z.nom=inp.value; loopSub='longueur'; render(); };
      $('#lNext').addEventListener('click', ok); inp.addEventListener('keydown', e=>{ if(e.key==='Enter') ok(); });
      wireBack(app); return;
    }
    if(loopSub==='longueur') return numStep(app, 'Combles · '+esc(z.nom||'Zone '+n), 'Longueur ?', '', z.longueur, 'ex : 10,50', v=>{ z.longueur=v; loopSub='largeur'; render(); });
    if(loopSub==='largeur') return numStep(app, 'Combles · '+esc(z.nom||'Zone '+n), 'Largeur ?', 'Longueur saisie : '+esc(z.longueur)+' m', z.largeur, 'ex : 8,20', v=>{
      z.largeur=v; state.zones.push(z); loopSub='again'; render(); });
    if(loopSub==='again'){
      app.innerHTML = `<div class="eyebrow">Combles</div><div class="qtitle">Faut-il ajouter une autre zone ?</div>${deja}
        <div style="margin-top:12px; padding:12px; background:#FFF7E6; border:1px dashed #E0B23C; border-radius:3px;">
          <div class="recap-line" style="font-weight:700;"><span>Surface totale à isoler</span><span class="mono">${r1(totalZones())} m²</span></div>
        </div>
        <div class="choices" style="margin-top:14px;"><button type="button" class="choice-btn" id="aNon">Non, continuer</button><button type="button" class="choice-btn" id="aOui">Oui, ajouter une zone</button></div>
        ${backRow()}`;
      $('#aNon').addEventListener('click', ()=>{ if(totalZones()<=0){ alert('Surface nulle — vérifie les mesures.'); return; } advance(); });
      $('#aOui').addEventListener('click', ()=>{ loopItem=null; loopSub='nom'; render(); });
      wireBack(app);
    }
  }

  function renderPans(app){
    if(!loopSub){ loopSub = state.pans.length ? 'again' : 'nom'; }
    if(loopSub==='nom' && (!loopItem || state.pans.includes(loopItem))) loopItem = { id:uid(), nom:'', forme:'rect', base:'', baseHaute:'', rampant:'' };
    const p = loopItem, n = state.pans.length + (state.pans.includes(p)?0:1);
    const lib = 'Pan '+n+(p.nom?' — '+esc(p.nom):'');
    const deja = state.pans.length ? `<div class="okline">✓ Pans déjà mesurés : ${state.pans.map(x=>esc(x.nom||'Pan')+' '+r1(surfacePan(x))+' m²').join(' · ')}</div>` : '';
    if(loopSub==='nom'){
      app.innerHTML = `<div class="eyebrow">Toiture · Pan ${n}</div><div class="qtitle">Nom / orientation de ce pan ?</div>
        <div class="qsub">Ex : Pan rue, Pan jardin, Croupe gauche… Toutes les mesures se prennent <b>dans la pente</b> (en rampant).</div>${deja}
        <input class="finput" id="lInput" type="text" value="${esc(p.nom)}" placeholder="ex : Pan rue"/>
        ${backRow('<button class="btn btn-primary" id="lNext">Suivant</button>')}`;
      const inp=$('#lInput'); inp.focus();
      const ok=()=>{ p.nom=inp.value; loopSub='forme'; render(); };
      $('#lNext').addEventListener('click', ok); inp.addEventListener('keydown', e=>{ if(e.key==='Enter') ok(); });
      wireBack(app); return;
    }
    if(loopSub==='forme'){
      const F = [
        ['rect','Rectangle','Pan classique (toit à 2 pentes)','<rect x="6" y="14" width="44" height="28" fill="none" stroke="#15181C" stroke-width="3"/>'],
        ['trapeze','Trapèze','Grand pan d\'un toit à 4 pentes','<path d="M4 42 L16 14 H40 L52 42 Z" fill="none" stroke="#15181C" stroke-width="3"/>'],
        ['triangle','Triangle','Croupe (petit côté d\'un toit à 4 pentes)','<path d="M6 42 L28 12 L50 42 Z" fill="none" stroke="#15181C" stroke-width="3"/>'],
      ];
      app.innerHTML = `<div class="eyebrow">Toiture · ${lib}</div><div class="qtitle">Forme du pan ?</div>
        <div class="choices">${F.map(([k,l,d,svg])=>`<button type="button" class="choice-btn visualcard ${p.forme===k?'sel':''}" data-k="${k}"><div class="shape"><svg viewBox="0 0 56 56">${svg}</svg></div><b>${l}</b><span class="desc">${d}</span></button>`).join('')}</div>
        ${backRow()}`;
      app.querySelectorAll('[data-k]').forEach(b=> b.addEventListener('click', ()=>{ p.forme=b.dataset.k; loopSub='base'; render(); }));
      wireBack(app); return;
    }
    if(loopSub==='base') return numStep(app, 'Toiture · '+lib, p.forme==='trapeze'?'Longueur en bas du pan (à l\'égout) ?':'Longueur à l\'égout (bas du pan) ?', 'Le long de la gouttière.', p.base, 'ex : 10,50', v=>{ p.base=v; loopSub = p.forme==='trapeze'?'baseHaute':'rampant'; render(); });
    if(loopSub==='baseHaute') return numStep(app, 'Toiture · '+lib, 'Longueur en haut du pan (au faîtage) ?', 'Longueur en bas : '+esc(p.base)+' m', p.baseHaute, 'ex : 6,00', v=>{ p.baseHaute=v; loopSub='rampant'; render(); });
    if(loopSub==='rampant') return numStep(app, 'Toiture · '+lib, 'Longueur du rampant ?', 'De l\'égout jusqu\'au faîtage, en suivant la pente (débord compris).', p.rampant, 'ex : 5,40', v=>{
      p.rampant=v; state.pans.push(p); state._linInit=false; loopSub='again'; render(); });
    if(loopSub==='again'){
      app.innerHTML = `<div class="eyebrow">Toiture</div><div class="qtitle">Faut-il ajouter un autre pan ?</div>${deja}
        <div style="margin-top:12px; padding:12px; background:#FFF7E6; border:1px dashed #E0B23C; border-radius:3px;">
          ${state.pans.map(x=>`<div class="recap-line"><span>${esc(x.nom||'Pan')} (${FORME_LBL[x.forme]||x.forme})</span><span class="mono">${r1(surfacePan(x))} m²</span></div>`).join('')}
          <div class="recap-line" style="font-weight:700;"><span>Surface totale de toiture (en rampant)</span><span class="mono">${r1(totalPans())} m²</span></div>
        </div>
        <div class="choices" style="margin-top:14px;"><button type="button" class="choice-btn" id="aNon">Non, continuer</button><button type="button" class="choice-btn" id="aOui">Oui, ajouter un pan</button></div>
        ${backRow()}`;
      $('#aNon').addEventListener('click', ()=>{ if(totalPans()<=0){ alert('Surface nulle — vérifie les mesures.'); return; } advance(); });
      $('#aOui').addEventListener('click', ()=>{ loopItem=null; loopSub='nom'; render(); });
      wireBack(app);
    }
  }

  // — Linéaires (faîtage, arêtiers, noues, rives, égout) pré-remplis par calcul
  function renderLineaires(app){
    const sg = suggestionsLineaires();
    if(!state._linInit){
      state.lin = { faitage: r1(sg.faitage).replace(/\s/g,''), aretiers: sg.aretiers>0 ? r1(sg.aretiers).replace(/\s/g,'') : '0', noues:'0', rives: r1(sg.rives).replace(/\s/g,''), egout: r1(sg.egout).replace(/\s/g,'') };
      state._linInit = true;
    }
    const L = [
      ['faitage','Faîtage','Ligne du haut, entre 2 pans'],
      ['aretiers','Arêtiers','Lignes inclinées entre 2 pans (toit à 4 pentes)'],
      ['noues','Noues','Angles rentrants (raccord en creux)'],
      ['rives','Rives','Bords latéraux des pans (pignons)'],
      ['egout','Égout','Bas des pans, le long des gouttières'],
    ];
    app.innerHTML = `<div class="eyebrow">Toiture · Linéaires</div><div class="qtitle">Vérifie les longueurs (ml)</div>
      <div class="qsub">Pré-calculé à partir des pans — <b>corrige si besoin</b> (toit en L, appentis, croupes irrégulières…).</div>
      <div class="lin-grid">${L.map(([k,l,h])=>`<label for="lin_${k}">${l}<span class="hint">${h}</span></label><input class="finput" id="lin_${k}" type="text" inputmode="decimal" value="${esc(state.lin[k])}"/>`).join('')}</div>
      ${backRow('<button class="btn btn-primary" id="lNext">Suivant</button>')}`;
    $('#lNext').addEventListener('click', ()=>{ L.forEach(([k])=>{ state.lin[k] = $('#lin_'+k).value; }); advance(); });
    wireBack(app);
  }

  function renderIsolantCombles(app){
    const m2 = totalZones();
    app.innerHTML = `<div class="eyebrow">Isolation</div><div class="qtitle">Quel isolant ?</div>
      <div class="qsub">Soufflé sur ${r1(m2)} m². Prix réel repris du catalogue à la génération du devis.</div>
      <div class="choices">${ISOLANTS_COMBLES.map(i=>{
        const prod = findProd(P[i.p]); const prix = prod ? Number(prod.prixHT)||0 : 0;
        return `<button type="button" class="choice-btn wide ${state.q.isolant===i.k?'sel':''}" data-k="${i.k}">${i.label}
          <span class="desc">R ${String(i.R).replace('.',',')} · ${i.ep}${prix?` · ${prix} €/m² → ≈ ${Math.round(prix*m2).toLocaleString('fr-FR')} €`:''}${i.R<7?' · ⚠️ pas de CEE (R &lt; 7)':''}</span></button>`; }).join('')}</div>
      ${backRow()}`;
    app.querySelectorAll('[data-k]').forEach(b=> b.addEventListener('click', ()=>{ state.q.isolant=b.dataset.k; advance(); }));
    wireBack(app);
  }

  function renderSarking(app){
    const m2 = totalPans();
    app.innerHTML = `<div class="eyebrow">Isolation de toiture</div><div class="qtitle">Quelle isolation sous la couverture ?</div>
      <div class="qsub">Posée sur ${r1(m2)} m² (surface des pans).</div>
      <div class="choices">${SARKINGS.map(i=>{
        const prod = findProd(P[i.p]); const prix = prod ? Number(prod.prixHT)||0 : 0;
        return `<button type="button" class="choice-btn wide ${state.q.sarking===i.k?'sel':''}" data-k="${i.k}">${i.label}<span class="desc">${prix?`${prix} €/m² → ≈ ${Math.round(prix*m2).toLocaleString('fr-FR')} €`:''}</span></button>`; }).join('')}</div>
      ${backRow()}`;
    app.querySelectorAll('[data-k]').forEach(b=> b.addEventListener('click', ()=>{ state.q.sarking=b.dataset.k; advance(); }));
    wireBack(app);
  }

  // ─────────────────────────────────────────────────────────
  // Construction des lignes de devis
  // ─────────────────────────────────────────────────────────
  function findProd(def){
    if(!def) return null;
    return catalogue.find(p=>p && p.ref===def.ref) || catalogue.find(p=>p && p.id===def.id) || null;
  }

  function buildDevisLignes(){
    const lignes = [], missing = [];
    const q = state.q;
    function add(key, quantite, complement){
      const def = P[key];
      quantite = Math.round((Number(quantite)||0)*100)/100;
      if(!def || quantite<=0) return;
      const prod = findProd(def);
      if(!prod){ const lbl = def.ref+' ('+def.id+')'; if(!missing.includes(lbl)) missing.push(lbl); return; }
      lignes.push({
        id: uid(), produitId: prod.id, designation: prod.designation + (complement?' — '+complement:''), description: prod.description||'',
        unite: prod.unite||def.u||'unité', tva: prod.tva||10, prixTTC: Number(prod.prixHT)||0, quantite,
      });
    }

    if(state.mode==='COMBLES'){
      const m2 = totalZones();
      add('PROTECTION', 1);
      if(q.acces==='toiture') add('ACCES_TOITURE', 1);
      if(q.grenier===1) add('GRENIER', 1);
      if(q.existant==='mono') add('DEBARRAS_MONO', m2);
      if(q.existant==='double') add('DEBARRAS_DOUBLE', m2);
      if(q.plancher && q.plancher!=='aucun' && q.plancherDepose===1) add('DEPOSE_PLANCHER', numF(q.plancherM2));
      const iso = ISOLANTS_COMBLES.find(i=>i.k===q.isolant);
      if(iso) add(iso.p, m2);
      if(q.spots===1) add('CACHE_SPOT', numF(q.spotsNb));
      if(q.conduit===1) add('ECART_FEU', numF(q.conduitNb));
      if(q.plancher==='rehausse') add('REHAUSSE', numF(q.plancherM2));
      if(q.plancher==='osb') add('OSB', numF(q.plancherM2));
      if(q.plancher==='solivbox') add('SOLIVBOX', numF(q.plancherM2));
      if(q.vmc && q.vmc!=='aucune' && q.vmcGamme) add('VMC_'+(q.vmc==='remp'?'REMP':'CREA')+'_'+q.vmcGamme, 1);
      if(q.vmc && q.vmc!=='aucune') add('ENTREE_AIR', numF(q.entreesAir));
    } else {
      const m2 = totalPans();
      const pays = tuileDePays();
      if(isChangement()) add(q.demandeur==='nous' ? 'ORGA_DP' : 'ORGA_CLASSIQUE', 1);
      else add('ORGA_CLASSIQUE', 1);
      if(q.echaf==='forfait') add('ECHAF_FORFAIT', 1);
      if(q.echaf==='classique') add('ECHAF_CLASSIQUE', numF(q.echafM2));
      if(q.echaf==='voirie') add('ECHAF_VOIRIE', numF(q.echafM2));

      if(isChangement()){
        if(q.evac==='benne') add('BENNE', 1);
        if(q.evac==='camion') add('CAMION_BENNE', 1);
        if(q.monteCharge===1) add('MONTE_CHARGE', 1);
        add(q.existante==='plate' ? 'DEPOSE_PLATE' : 'DEPOSE_MECA', m2);
        add('CHEVRON', numF(q.chevronsMl));
        add('DEMI_CHEVRON', numF(q.demiChevronsMl));
        add('PANNE', numF(q.pannesNb));
        if(q.traitCharpente===1) add('TRAIT_CHARPENTE', m2);
        if(state.mode==='CHANGEMENT_ISOL'){ const s = SARKINGS.find(x=>x.k===q.sarking); if(s) add(s.p, m2); }
        if(q.hpv===1) add('HPV', m2);
        add(q.liteaux==='l' ? 'LITEAUX' : 'LITEAUX_CONTRE', m2);
        const t = TUILES.find(x=>x.k===q.tuile);
        if(t) add(t.p, m2, q.tuileTeinte ? 'teinte '+q.tuileTeinte : '');
        const fait = numF(state.lin.faitage), aret = numF(state.lin.aretiers), rives = numF(state.lin.rives), noues = numF(state.lin.noues);
        if(fait>0) add(q.faitageType==='coq' ? 'FAITAGE_COQ' : (pays?'FAITAGE_CLOSOIR_PAYS':'FAITAGE_CLOSOIR'), fait);
        if(aret>0) add(q.aretierType==='coq' ? 'ARETIER_COQ' : q.aretierType==='zinc' ? 'ARETIER_ZINC' : (pays?'ARETIER_CLOSOIR_PAYS':'ARETIER_CLOSOIR'), aret);
        if(rives>0) add(q.rivesType==='macon' ? 'RIVES_MACON' : q.rivesType==='indiv' ? (pays?'RIVES_INDIV_PAYS':'RIVES_INDIV') : (pays?'RIVES_UNIV_PAYS':'RIVES_UNIV'), rives);
        if(noues>0) add('NOUE', noues);
        if(fait>0) add('ABOUT_FAITAGE', numF(q.aboutsFaitage));
        if(rives>0 && q.rivesType!=='univ') add('ABOUT_RIVE', numF(q.aboutsRives));
        add('CHATIERE', numF(q.chatieres));
        add('DOUILLE', numF(q.douilles));
        add('SOLIN', numF(q.solinMl));
        if(q.cheminee==='etanch') add('CHEMINEE_ETANCH', numF(q.chemineeNb));
        if(q.cheminee==='depose') add('CHEMINEE_DEPOSE', numF(q.chemineeNb));
        add('CHENEAU', numF(q.cheneauMl));
        add('PLANCHE_RIVE', numF(q.planchesRiveMl));
      }
      if(state.mode==='TRAITEMENT'){
        add('NETTOYAGE', m2);
        const H = { incolore:'HYDRO_INCOLORE', classique:'HYDRO_CLASSIQUE', premium:'HYDRO_PREMIUM', reflechissant:'HYDRO_REFLECHISSANT' };
        if(H[q.hydro]) add(H[q.hydro], m2, q.hydroTeinte ? 'teinte '+q.hydroTeinte : '');
      }
      if(q.gouttieres && q.gouttieres!=='non') add('GOUTT_'+q.gouttieres, numF(q.gouttieresMl));
      if(q.descentes && q.descentes!=='non') add('DESC_'+q.descentes, numF(q.descentesMl));
      if(q.sousFace==='pvc') add('SOUSFACE_PVC', numF(q.sousFaceQte));
      if(q.sousFace==='bois') add('SOUSFACE_BOIS', numF(q.sousFaceQte));
      if(q.sousFace==='peinture') add('PEINTURE_SOUSFACE', numF(q.sousFaceQte));
    }
    return { lignes, missing };
  }

  // ─────────────────────────────────────────────────────────
  // Récap + génération
  // ─────────────────────────────────────────────────────────
  let genStatus='idle', genMissing=[], genError='', genNumero='', genLignes=[], genDevis=null, genClient=null;

  function renderRecap(app){
    const { lignes, missing } = buildDevisLignes();
    const total = lignes.reduce((s,l)=> s + l.prixTTC*l.quantite, 0);
    const cee = calcMontantCEE();
    const mesures = state.mode==='COMBLES'
      ? state.zones.map(z=>`<div class="recap-line"><span>${esc(z.nom||'Zone')} — ${esc(z.longueur)} × ${esc(z.largeur)} m</span><span class="mono">${r1(numF(z.longueur)*numF(z.largeur))} m²</span></div>`).join('') +
        `<div class="recap-line" style="font-weight:700;"><span>Surface totale combles</span><span class="mono">${r1(totalZones())} m²</span></div>`
      : state.pans.map(p=>`<div class="recap-line"><span>${esc(p.nom||'Pan')} (${FORME_LBL[p.forme]||p.forme})</span><span class="mono">${r1(surfacePan(p))} m²</span></div>`).join('') +
        `<div class="recap-line" style="font-weight:700;"><span>Surface totale toiture</span><span class="mono">${r1(totalPans())} m²</span></div>` +
        (isChangement() ? `<div class="recap-line"><span>Faîtage · Arêtiers · Noues · Rives · Égout</span><span class="mono">${['faitage','aretiers','noues','rives','egout'].map(k=>numF(state.lin[k])).join(' · ')} ml</span></div>` : '');
    app.innerHTML = `
      <div class="eyebrow">Récapitulatif</div>
      <div class="qtitle">${esc(MODES[state.mode].label)}</div>
      <div class="recap-group"><h4>Mesures</h4>${mesures}</div>
      <div class="recap-group"><h4>Lignes du devis</h4>
        ${lignes.map(l=>`<div class="recap-line"><span>${esc(l.designation)}</span><span class="mono">${l.quantite.toLocaleString('fr-FR')} ${esc(l.unite)} · ${eur(l.prixTTC*l.quantite)}</span></div>`).join('')}
        <div class="recap-total"><span>Total</span><span>${eur(total)}</span></div>
        ${cee>0 ? `<div class="recap-line" style="color:var(--ok); font-weight:700;"><span>Prime CEE (${state.q.ceePrecaire==='precaire'?'précaire':'classique'})</span><span class="mono">− ${eur(cee)}</span></div>` : ''}
        ${state.q.ceeApplicable===1 && cee===0 && state.q.renovationGlobale!==1 ? `<div class="warnline">⚠️ CEE demandées mais montant à 0 € : isolant sous le R minimum, ou barème CEE non renseigné dans le CRM (Admin → Réglages → Barèmes CEE).</div>` : ''}
      </div>
      ${missing.length ? `<div class="warnline">❌ ${missing.length} produit(s) introuvable(s) dans le catalogue : <span class="mono">${esc(missing.join(', '))}</span></div>` : ''}
      <div id="genZone"></div>
      ${backRow()}`;
    wireBack(app);
    renderGenZone();
  }

  function renderGenZone(){
    const zone = $('#genZone'); if(!zone) return;
    if(genStatus==='idle'){
      zone.innerHTML = `<div style="margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;"><button class="btn btn-primary" id="genBtn">🧾 Générer le devis</button></div>`;
      $('#genBtn').addEventListener('click', genererDevis);
    } else if(genStatus==='checking'){
      zone.innerHTML = `<div class="okline">⏳ Génération du devis en cours…</div>`;
    } else if(genStatus==='missing'){
      zone.innerHTML = `<div class="warnline">❌ Référence(s) introuvable(s) dans le catalogue :<br/><span class="mono">${esc(genMissing.join(', '))}</span><br/><br/>Ajoute-les dans Admin → Catalogue produits du CRM, puis réessaie.</div>
        <div style="margin-top:12px;"><button class="btn btn-ghost" id="genRetry">↺ Réessayer</button></div>`;
      $('#genRetry').addEventListener('click', ()=>{ genStatus='idle'; renderGenZone(); });
    } else if(genStatus==='error'){
      zone.innerHTML = `<div class="warnline">❌ Erreur lors de la génération : ${esc(genError)}</div><div style="margin-top:12px;"><button class="btn btn-ghost" id="genRetry">↺ Réessayer</button></div>`;
      $('#genRetry').addEventListener('click', ()=>{ genStatus='idle'; renderGenZone(); });
    } else if(genStatus==='success'){
      zone.innerHTML = `<div class="okline">✅ Devis ${esc(genNumero)} généré et enregistré sur la fiche du client.</div>
        <div style="margin-top:16px; display:flex; gap:10px;"><button class="btn btn-ghost" id="genPdf">📄 Voir le PDF</button><button class="btn btn-primary" id="genDone">Terminé</button></div>`;
      $('#genPdf').addEventListener('click', ()=> genererPDFDevis(genDevis, genClient || client));
      $('#genDone').addEventListener('click', ()=> onExit && onExit());
    }
  }

  async function genererDevis(){
    const { lignes, missing } = buildDevisLignes();
    if(missing.length){ genStatus='missing'; genMissing=missing; renderGenZone(); return; }
    if(!lignes.length){ genStatus='error'; genError='Aucune ligne de devis.'; renderGenZone(); return; }
    genStatus='checking'; renderGenZone();
    try{
      const montantCEE = calcMontantCEE();
      let ceeInfo = null;
      if(montantCEE>0){
        const key = state.mode==='COMBLES' ? 'comblesPerdus' : 'rampants';
        const m2 = state.mode==='COMBLES' ? totalZones() : totalPans();
        ceeInfo = { surfaces:{ [key]: Math.round(m2*10)/10 }, resistances:{ [key]: 'oui' }, precaire: state.q.ceePrecaire==='precaire', montant: montantCEE };
      }
      const result = await onGenerate({
        missingRefs: [],
        devisSections: [{ id: uid(), type: MODES[state.mode].section, lignes }],
        montantCEE,
        ceeInfo,
      });
      if(result && result.ok){ genStatus='success'; genNumero=result.devisNumero||''; genLignes=lignes; genDevis=result.devis||null; genClient=result.client||client; }
      else if(result && result.missingRefs && result.missingRefs.length){ genStatus='missing'; genMissing=result.missingRefs; }
      else { genStatus='error'; genError=(result && result.error) || 'Erreur inconnue.'; }
    } catch(e){ genStatus='error'; genError=String(e); }
    // on bloque le retour arrière une fois le devis enregistré (évite un doublon)
    if(genStatus==='success'){ hist.length=0; $('#backBtn').classList.remove('show'); container.querySelectorAll('[data-back]').forEach(b=>b.remove()); }
    renderGenZone();
  }

  // Démarrage
  cur = firstScreen();
  render();
} // fin mountWizardToiture

// Génère le PDF du devis — même gabarit visuel que le CRM (copié du wizard ITE).
function genererPDFDevis(dv, cl){
  cl = cl || {};
  if(!dv){ alert("Aucun devis généré pour l'instant."); return; }

  const comNom = "KORÉO";
  const comMail = "contact@koreo.fr";

  const rows = (dv.sections||[]).map(sec=>{
    const lg = (sec.lignes||[]).map((l,idx)=>{
      const ttc = (Number(l.prixTTC)||0)*(Number(l.quantite)||0);
      const ht = ttc/(1+(Number(l.tva)||0)/100);
      const q = (Number(l.quantite)||0).toLocaleString("fr-FR");
      return `<tr class="${idx%2?'zebre':''}">
        <td class="l desig"><div class="titre">${esc(l.designation)}</div>${l.description?`<div class="corps">${esc(l.description)}</div>`:''}</td>
        <td>${q} ${esc(l.unite||'')}</td>
        <td>${eur(Number(l.prixTTC)||0)}</td>
        <td>${eur(ht)}</td>
        <td class="cell-ttc">${eur(ttc)}<span class="tva">dont TVA à ${String(l.tva).replace('.',',')} %</span></td>
      </tr>`;
    }).join('');
    return `<tr class="section-row"><td colspan="5">${esc(sec.type)}</td></tr>${lg}`;
  }).join('');

  const lignesTTC = (sec)=> (sec.lignes||[]).reduce((a,l)=>a+(Number(l.prixTTC)||0)*(Number(l.quantite)||0),0);
  const totalTTC = (dv.sections||[]).reduce((a,sec)=>a+lignesTTC(sec),0);
  const totalHT = (dv.sections||[]).reduce((a,sec)=>a+(sec.lignes||[]).reduce((b,l)=>{ const ttc=(Number(l.prixTTC)||0)*(Number(l.quantite)||0); return b+ttc/(1+(Number(l.tva)||0)/100); },0),0);
  const remisePct = Number(dv.remisePct)||0;
  const remiseTTC = totalTTC*remisePct/100;
  const netTTC = totalTTC-remiseTTC;
  const cee = Math.min(Number(dv.cee)||0, netTTC);
  const reste = Math.max(0, netTTC-cee);
  const netHT = totalHT*(1-remisePct/100);
  const tvaMontant = netTTC-netHT;

  const remiseRow = remiseTTC>0 ? `<div class="lg muted"><span>Remise TTC</span><span>− ${eur(remiseTTC)}</span></div>` : '';
  const ceeRow = cee>0 ? `<div class="lg cee"><span>Montant prime CEE</span><span>− ${eur(cee)}</span></div>` : '';

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Devis ${esc(dv.numero)} — ${esc(cl.nom)}</title>
<style>
  :root{--vert:#0E7A56;--vert-fonce:#0B5E43;--orange:#F0662B;--encre:#1f2937;--gris:#6b7280;--gris-clair:#9ca3af;--trait:#e5e7eb;--zebre:#f3f6f5;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:"Helvetica Neue",Arial,sans-serif;color:var(--encre);font-size:11px;line-height:1.4;}
  .page{padding:14mm 13mm;display:flex;flex-direction:column;min-height:100vh;}
  .content{flex:1;}
  .head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;}
  .logo{font-size:34px;font-weight:800;letter-spacing:1px;color:#1f2937;line-height:1;}
  .slogan{margin-top:6px;font-size:12px;font-weight:600;line-height:1.25;}
  .slogan .hl{background:var(--orange);color:#fff;padding:0 4px;border-radius:2px;}
  .meta{text-align:right;font-size:11px;}
  .meta .num b{font-weight:800;} .meta .num span{color:var(--gris);}
  .meta .exp,.meta .pg{color:var(--gris);font-size:10px;}
  .meta .cli{font-weight:800;margin-top:8px;} .meta .date{color:var(--gris);font-size:10px;}
  .infos{display:flex;justify-content:space-between;gap:20px;margin-bottom:24px;}
  .etabli{font-size:11px;line-height:1.7;width:40%;} .etabli b{font-weight:800;}
  .adr{font-size:11px;line-height:1.55;} .adr h4{font-size:12px;font-weight:800;margin-bottom:6px;} .adr .nom{font-weight:700;} .adr .cp{margin-top:8px;}
  table{width:100%;border-collapse:collapse;}
  thead th{background:var(--vert);color:#fff;font-size:10px;font-weight:700;padding:8px 10px;text-align:right;}
  thead th.l{text-align:left;}
  .section-row td{background:#eaf3ef;color:var(--vert-fonce);font-weight:800;font-size:10.5px;text-transform:uppercase;letter-spacing:.3px;padding:7px 10px;}
  tbody td{padding:10px;font-size:10.5px;border-bottom:1px solid var(--trait);vertical-align:top;text-align:right;}
  tbody td.l{text-align:left;} tbody tr.zebre td{background:var(--zebre);}
  .desig .titre{font-weight:800;font-size:11px;} .desig .corps{color:var(--gris);font-size:9.5px;line-height:1.45;margin-top:3px;max-width:360px;}
  .cell-ttc{font-weight:700;} .cell-ttc .tva{display:block;color:var(--gris-clair);font-size:8.5px;font-weight:400;margin-top:2px;}
  .totaux-wrap{display:flex;justify-content:flex-end;margin-top:6px;}
  .totaux{width:52%;}
  .lg{display:flex;justify-content:space-between;padding:5px 12px;font-size:11px;color:#374151;}
  .lg.entete{background:var(--vert);color:#fff;font-weight:800;font-size:13px;padding:9px 12px;}
  .lg.muted{color:var(--gris);} .lg.cee{color:var(--vert);font-weight:700;}
  .reste{background:var(--vert-fonce);color:#fff;font-weight:800;font-size:15px;padding:11px 12px;display:flex;justify-content:space-between;margin-top:4px;}
  .mentions{margin-top:18px;font-size:8px;color:var(--gris);line-height:1.5;text-align:justify;} .mentions p{margin-bottom:6px;}
  .datesign{font-size:11px;margin-top:14px;} .accord{font-size:10px;color:#374151;margin-top:8px;}
  .signatures{display:flex;gap:40px;margin-top:10px;font-size:11px;} .sign{flex:1;} .sign .lbl{margin-bottom:40px;} .sign .rep{font-style:italic;text-align:center;color:#374151;}
  .footer{margin-top:auto;padding-top:12px;border-top:2px solid var(--vert);display:flex;justify-content:space-between;gap:14px;font-size:8.5px;line-height:1.55;color:#374151;}
  .footer b{display:block;font-size:11px;color:#111827;margin-bottom:3px;font-weight:800;}
  .footer .contacts span{display:block;}
  @media print{@page{size:A4;margin:0;} .page{min-height:auto;} .closeBtn{display:none;}}
  .closeBtn{position:fixed;top:14px;right:14px;width:38px;height:38px;border-radius:50%;background:#1f2937;color:#fff;border:none;font-size:18px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);z-index:9999;}
</style></head><body>
<button class="closeBtn" onclick="window.close()" title="Fermer">✕</button>
<div class="page"><div class="content">
  <div class="head">
    <div><div class="logo">KOREO</div><div class="slogan">Du conseil<br>à la <span class="hl">réalisation</span><br>de vos travaux</div></div>
    <div class="meta"><div class="num"><b>Devis gratuit</b> <span>n°${esc(dv.numero)}</span></div><div class="exp">Exemplaire client</div><div class="cli">${esc(cl.civilite||'')} ${esc(cl.prenom||'')} ${esc(cl.nom||'')}</div><div class="date">Le ${fmtDatePdf(dv.date)}</div></div>
  </div>
  <div class="infos">
    <div class="etabli">
      <div><b>Établi par :</b> ${esc(comNom)}</div>
      <div><b>Adresse mail :</b> ${esc(comMail)}</div>
      <div><b>Tel :</b> 01 64 43 30 00</div>
      <div><b>Web :</b> www.koreo.fr</div>
      <div style="margin-top:8px;"><b>Devis valable jusqu'au :</b> ${fmtDatePdf(dv.validite)}</div>
    </div>
    <div class="adr"><h4>Adresse des travaux</h4><p class="nom">${esc(cl.civilite||'')} ${esc(cl.prenom||'')} ${esc(cl.nom||'')}</p><p>${esc(cl.adresse||'')}</p><p class="cp">${esc(cl.codePostal||'')} ${esc(cl.ville||'')}</p></div>
    <div class="adr"><h4>Adresse de facturation</h4><p class="nom">${esc(cl.civilite||'')} ${esc(cl.prenom||'')} ${esc(cl.nom||'')}</p><p>${esc(cl.adresse||'')}</p><p class="cp">${esc(cl.codePostal||'')} ${esc(cl.ville||'')}</p></div>
  </div>
  <table><thead><tr><th class="l">Désignation</th><th>Quantité</th><th>PU TTC</th><th>Total HT</th><th>Total TTC</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="totaux-wrap"><div class="totaux">
    <div class="lg entete"><span>MONTANT TOTAL TTC</span><span>${eur(totalTTC)}</span></div>
    ${remiseRow}
    <div class="lg"><span>Total net TTC</span><span>${eur(netTTC)}</span></div>
    ${ceeRow}
    <div class="lg muted"><span>Dont TVA</span><span>${eur(tvaMontant)}</span></div>
    <div class="lg"><span>Total net HT</span><span>${eur(netHT)}</span></div>
    <div class="reste"><span>Reste à régler</span><span>${eur(reste)}</span></div>
  </div></div>
  <div class="mentions">
    <p>Selon les informations fournies par vos soins, ce devis vous est présenté avec un taux de T.V.A. réduit. Ce taux ne s'applique que sur un local de plus de deux ans, affecté totalement à l'habitation (plus de 50 % de la superficie). Il ne pourra être effectivement appliqué qu'après renvoi de l'attestation jointe.</p>
    <p>Nos prix sont établis sur la base des taux de TVA en vigueur à la date de la remise de l'offre. Toute variation ultérieure de ces taux, imposée par la loi, sera répercutée sur le prix.</p>
    <p>Conformément à l'article L 611-1 du code de la consommation, le consommateur est informé qu'il a la possibilité de saisir un médiateur de la consommation. Coordonnées : Association MEDIMMOCONSO, 1 Allée du Parc de Mesemena — Bât A — CS25222 — 44505 LA BAULE CEDEX ; contact@medimmoconso.fr</p>
  </div>
  <div class="datesign">Date : ............/............/............ à : ........................................................................</div>
  <div class="accord">Le client déclare avoir pris connaissance et accepter les termes et conditions générales de vente sur les deux volets.</div>
  <div class="signatures"><div class="sign"><div class="lbl">Signature client</div></div><div class="sign"><div class="lbl">Signature du représentant KORÉO</div><div class="rep">${esc(comNom)}</div></div></div>
</div>
  <div class="footer">
    <div><b>SAS KORÉO</b>24, Rue Clément ADER<br>Zac de la Clé Saint Pierre — Bâtiment D2<br>91280 SAINT-PIERRE-DU-PERRAY</div>
    <div><b>&nbsp;</b>SAS au capital de 50 000,00 €<br>TVA intra FR29920767688<br>Siret : 92076768800061 · RCS EVRY</div>
    <div><b>IBAN</b>FR56 3000 2069 0700 0007 0104 L54<br><b style="margin-top:3px;">BIC</b>CRLYFRPP</div>
    <div class="contacts"><b>&nbsp;</b><span>Tel 01 64 43 30 00</span><span>contact@koreo.fr</span><span>www.koreo.fr</span></div>
  </div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script>
</body></html>`;

  const w = window.open("", "_blank");
  if(!w){ alert("Autorise les fenêtres pop-up pour générer le PDF."); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
