// wizardITE.js — moteur du wizard découverte ITE, connecté au vrai catalogue Firebase.
// Porté depuis le prototype validé avec Mathias (decouverte-ite-v2-prototype.html).

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
let _cssInjected = false;
function injectCss() {
  if (_cssInjected) return;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  _cssInjected = true;
}

export function mountWizardITE(container, opts) {
  injectCss();
  const { catalogue, client, baremesCEE, onGenerate, onExit } = opts;

  container.classList.add('wizardRoot');
  container.innerHTML = `
    <header>
      <div class="headrow">
        <button id="backBtn">←</button>
        <div class="headlabel" id="headLabel">DÉCOUVERTE ITE — <b>${(client.nom||'')+' '+(client.prenom||'')}</b></div>
        <button id="exitBtn" style="background:none;border:none;color:#9AA0A6;font-size:12px;cursor:pointer;">Quitter</button>
      </div>
    </header>
    <main><div class="qcard" id="app"></div></main>
    <footer id="footer" style="display:none">
      <button class="btn btn-ghost" id="prevBtnFooter">Précédent</button>
      <button class="btn btn-primary" id="nextBtn">Suivant</button>
    </footer>
  `;
  container.querySelector('#exitBtn').addEventListener('click', () => onExit && onExit());

const state = {
  demandeur: null,          // 'nous' | 'client'
  forme: null,               // 'rect' | 'L' | 'U' | 'complexe'
  echafs: [],                // [{id,type:'classique'|'voirie'|'copro'|'voisin', m2}]
  _echafType: null, _echafM2:'', _echafSubStep:'type',
  facades: [],
  _facCurrent: null, _facFenIndex: 0, _facPorteIndex: 0, _facSubStep: 'nom',
};
let step = 0;
const STEPS = ['demandeur','facades','forme','echaf','questions','recap'];

function uid(){ return 'f'+Math.random().toString(36).slice(2,8); }
function wid(){ return 'w'+Math.random().toString(36).slice(2,8); }

function newFacadeObj(){ return { id:uid(), nom:'', pignon:false, longueur:'', hauteur:'', fenetres:[], portes:[] }; }

function facRecapBack(){
  const f = state._facCurrent;
  if(f.portes.length===0){ state._facSubStep='nbPortes'; }
  else { state._facPorteIndex = f.portes.length-1; state._facSubStep='porteHauteur'; }
  render();
}
function facAgain(yes){
  state.facades.push(state._facCurrent);
  if(yes){ state._facCurrent = newFacadeObj(); state._facFenIndex=0; state._facPorteIndex=0; state._facSubStep='nom'; render(); }
  else { nextStep(); }
}

function numF(v){ return parseFloat(String(v||'').replace(',','.'))||0; }

function calcFacade(f){
  const hFacade = numF(f.hauteur);
  const lFacade = numF(f.longueur);
  const surfaceBrute = f.pignon ? (lFacade*hFacade)/2 : lFacade*hFacade;

  let baguettesFenetres=0, gouttesEauFenetres=0, surfaceFenetres=0;
  f.fenetres.forEach(w=>{
    const wh = numF(w.hauteur);
    const wl = numF(w.largeur);
    baguettesFenetres += wh*2;
    gouttesEauFenetres += wl;
    surfaceFenetres += wh*wl;
  });

  // Portes : mêmes règles que les fenêtres pour baguettes d'angle et gouttes d'eau.
  // Seuls les appuis de fenêtre (auto, calcAppuisAuto) ne concernent que les fenêtres.
  let baguettesPortes=0, gouttesEauPortes=0, surfacePortes=0;
  (f.portes||[]).forEach(p=>{
    const ph = numF(p.hauteur);
    const pl = numF(p.largeur);
    baguettesPortes += ph*2;
    gouttesEauPortes += pl;
    surfacePortes += ph*pl;
  });

  const gouttesEau = gouttesEauFenetres + gouttesEauPortes;
  const surfaceOuvertures = surfaceFenetres + surfacePortes;
  const surfaceNette = Math.max(0, surfaceBrute - surfaceOuvertures);
  const baguettesTotal = hFacade + baguettesFenetres + baguettesPortes;
  const repriseTableaux = gouttesEau + baguettesFenetres + baguettesPortes;
  return { surfaceBrute, surfaceFenetres, surfacePortes, surfaceOuvertures, surfaceNette, baguettesTotal, baguettesFenetres, baguettesPortes, gouttesEau, repriseTableaux };
}

function totalSurfaceBruteFacades(){
  return state.facades.reduce((s,f)=> s + calcFacade(f).surfaceBrute, 0);
}
function totalEchafDejaAttribue(){
  return state.echafs.reduce((s,e)=> s + numF(e.m2), 0);
}

function calcCouvertineTaille(){
  const rail = parseInt(state.q.railTaille) || 0;
  return rail ? rail + 20 : null;
}

function calcRailDepart(){
  return state.facades.reduce((sum,f)=> sum + numF(f.longueur), 0);
}

function goStep(i){ step=i; render(); }
function nextStep(){ if(step<STEPS.length-1){ step++; if(STEPS[step]==='facades'){ state._facCurrent=newFacadeObj(); state._facFenIndex=0; state._facPorteIndex=0; state._facSubStep='nom'; } if(STEPS[step]==='echaf'){ state._echafType=null; state._echafM2=''; state._echafSubStep='type'; } if(STEPS[step]==='questions'){ qCurrent=0; qHistory=[]; } render(); } }
function prevStep(){ if(step>0){ step--; render(); } }
function goBack(){ if(STEPS[step]==='questions' && qHistory.length>0){ qGoBack(); } else { prevStep(); } }

function render(){
  const app = document.getElementById('app');
  const footer = document.getElementById('footer');
  const backBtn = document.getElementById('backBtn');
  backBtn.classList.toggle('show', step>0);
  document.getElementById('headLabel').innerHTML = 'DÉCOUVERTE ITE — <b>'+(step+1)+'/'+STEPS.length+'</b>';
  footer.style.display = (STEPS[step]==='facades'||STEPS[step]==='questions'||STEPS[step]==='echaf') ? 'none' : 'flex';
  backBtn.classList.toggle('show', step>0 || (STEPS[step]==='questions' && qHistory.length>0));

  if(STEPS[step]==='demandeur'){
    app.innerHTML = `
      <div class="eyebrow">Étape unique · Administratif</div>
      <div class="qtitle">Qui dépose la demande de travaux ?</div>
      <div class="qsub">Détermine le type d'organisation de chantier facturé (une seule fois sur le devis, quel que soit le nombre de façades).</div>
      <div class="choices">
        <button class="choice-btn ${state.demandeur==='nous'?'sel':''}" onclick="setDemandeur('nous')">
          <span class="icon">🏢</span> Nous (KORÉO)
          <span class="desc">→ Organisation de chantier DP (avec dépôt de la déclaration préalable)</span>
        </button>
        <button class="choice-btn ${state.demandeur==='client'?'sel':''}" onclick="setDemandeur('client')">
          <span class="icon">🙋</span> Le client
          <span class="desc">→ Organisation de chantier classique</span>
        </button>
      </div>
      ${state.demandeur ? `<div class="okline">✓ Ligne devis : Organisation de chantier ${state.demandeur==='nous'?'DP':'classique'} <span class="mono">(1×, une seule fois)</span></div>` : ''}
    `;
    document.getElementById('nextBtn').disabled = !state.demandeur;
    return;
  }

  if(STEPS[step]==='forme'){
    const shapes = [
      {k:'rect', label:'Rectangulaire', desc:'Maison simple, 4 façades droites', svg:'<rect x="8" y="14" width="40" height="30" fill="none" stroke="#15181C" stroke-width="3"/>'},
      {k:'L', label:'En L', desc:'Extension ou décroché', svg:'<path d="M8 14 H36 V26 H48 V44 H8 Z" fill="none" stroke="#15181C" stroke-width="3"/>'},
      {k:'U', label:'En U', desc:'Cour intérieure / patio', svg:'<path d="M8 14 V44 H20 V24 H36 V44 H48 V14 Z" fill="none" stroke="#15181C" stroke-width="3"/>'},
      {k:'complexe', label:'Complexe', desc:'Plusieurs pans, forme irrégulière', svg:'<path d="M8 20 L20 8 L34 16 L48 10 L48 44 L8 44 Z" fill="none" stroke="#15181C" stroke-width="3"/>'},
    ];
    app.innerHTML = `
      <div class="eyebrow">Étape unique · Complexité chantier</div>
      <div class="qtitle">Quelle est la forme de la maison ?</div>
      <div class="qsub">Une forme complexe augmente le temps de pose (angles, raccords) → majoration automatique du devis.</div>
      <div class="choices">
        ${shapes.map(s=>`
          <button class="choice-btn visualcard ${state.forme===s.k?'sel':''}" onclick="setForme('${s.k}')">
            <div class="shape"><svg viewBox="0 0 56 56">${s.svg}</svg></div>
            <b>${s.label}</b>
            <span class="desc">${s.desc}</span>
          </button>`).join('')}
      </div>
      ${state.forme && state.forme!=='rect' ? `<div class="warnline">⚠️ Forme "${shapes.find(s=>s.k===state.forme).label}" → <b>+3% majoration</b> appliquée sur le total du devis (angles/raccords supplémentaires)</div>` : ''}
      ${state.forme==='rect' ? `<div class="okline">✓ Maison rectangulaire → aucune majoration, prix catalogue standard</div>` : ''}
      <div class="note">📝 À confirmer avec Mathias : le +3% s'applique-t-il sur le total du devis, ou uniquement sur les postes ITE (isolant+pose), hors échafaudage/organisation chantier ?</div>
    `;
    document.getElementById('nextBtn').disabled = !state.forme;
    return;
  }

  if(STEPS[step]==='echaf'){
    const ECHAF_LABELS = { classique:'🏠 Classique (individuelle)', voirie:'🚧 Voirie', copro:'🏘️ Copropriété', voisin:'🤝 Chez le voisin' };
    const already = state.echafs.length ? `<div class="okline">✓ Déjà ajoutés : ${state.echafs.map(e=>ECHAF_LABELS[e.type].replace(/^\S+\s/,'')+' '+e.m2+'m²').join(' · ')}</div>` : '';

    if(state._echafSubStep==='type'){
      app.innerHTML = `
        <div class="eyebrow">Échafaudage${state.echafs.length?' #'+(state.echafs.length+1):''}</div>
        <div class="qtitle">Quel type d'échafaudage ?</div>
        ${already}
        <div class="choices">
          ${Object.keys(ECHAF_LABELS).map(k=>`<button type="button" class="choice-btn wide" onclick="echafSetType('${k}')">${ECHAF_LABELS[k]}</button>`).join('')}
        </div>
        <div style="margin-top:16px;"><button class="btn btn-ghost" onclick="${state.echafs.length>0 ? "state._echafSubStep='again'; render();" : "prevStep();"}">Précédent</button></div>
      `;
      return;
    }
    if(state._echafSubStep==='m2'){
      const totalFacades = totalSurfaceBruteFacades();
      const dejaAttribue = totalEchafDejaAttribue();
      const restant = totalFacades - dejaAttribue;
      app.innerHTML = `
        <div class="eyebrow">Échafaudage ${ECHAF_LABELS[state._echafType]}</div>
        <div class="qtitle">Combien de m² ?</div>
        <div class="qsub okline" style="display:block;">
          🧮 Surface totale des façades : <b>${totalFacades.toFixed(1)} m²</b><br/>
          Déjà attribué à d'autres échafaudages : <b>${dejaAttribue.toFixed(1)} m²</b><br/>
          <b>Disponible restant : ${restant.toFixed(1)} m²</b>
        </div>
        <input class="finput" id="echafM2Input" type="text" inputmode="decimal" placeholder="ex: ${restant.toFixed(1)}" value="${state._echafM2}"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="state._echafSubStep='type'; render();">Précédent</button>
          <button class="btn btn-primary" onclick="echafSetM2(document.getElementById('echafM2Input').value)">Suivant</button>
        </div>
      `;
      document.getElementById('echafM2Input').focus();
      return;
    }
    if(state._echafSubStep==='again'){
      const restant = totalSurfaceBruteFacades() - totalEchafDejaAttribue() - numF(state._echafM2);
      app.innerHTML = `
        <div class="eyebrow">Échafaudage</div>
        <div class="qtitle">Faut-il ajouter un autre échafaudage ?</div>
        ${already}
        <div class="okline">✓ ${ECHAF_LABELS[state._echafType]} — ${numF(state._echafM2).toFixed(1)} m² (vient d'être ajouté)</div>
        ${Math.abs(restant)>0.5 ? `<div class="warnline">⚠️ Il reste ${restant.toFixed(1)} m² de façade non couvert par un échafaudage — pense à l'ajouter si besoin.</div>` : `<div class="okline">✓ Toute la surface des façades est couverte.</div>`}
        <div class="choices">
          <button type="button" class="choice-btn" onclick="echafAgain(false)">Non, continuer</button>
          <button type="button" class="choice-btn" onclick="echafAgain(true)">Oui, en ajouter un</button>
        </div>
        <div style="margin-top:16px;"><button class="btn btn-ghost" onclick="state._echafSubStep='m2'; render();">Précédent</button></div>
      `;
      return;
    }
  }

  if(STEPS[step]==='facades'){
    const f = state._facCurrent;
    const already = state.facades.length ? `<div class="okline">✓ Façades déjà ajoutées : ${state.facades.map((x,i)=>(x.nom||'Façade '+(i+1))).join(' · ')}</div>` : '';
    const facBackFromNom = state.facades.length>0 ? "state._facSubStep='again'; render();" : "prevStep();";

    if(state._facSubStep==='nom'){
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1}</div>
        <div class="qtitle">Nom / orientation de cette façade ?</div>
        <div class="qsub">Ex: Sud-Ouest, Façade rue, Façade jardin...</div>
        ${already}
        <input class="finput" id="facInput" type="text" value="${f.nom}" placeholder="ex: Sud-Ouest"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="${facBackFromNom}">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{ f.nom=document.getElementById('facInput').value; state._facSubStep='pignon'; render(); });
      return;
    }
    if(state._facSubStep==='pignon'){
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1}${f.nom?' — '+f.nom:''}</div>
        <div class="qtitle">Est-ce un pignon (partie triangulaire) ?</div>
        <div class="qsub">Si oui, la surface sera calculée en triangle (longueur × hauteur ÷ 2) au lieu d'un rectangle.</div>
        <div class="choices">
          <button type="button" class="choice-btn" id="pignonNon">Non — façade classique</button>
          <button type="button" class="choice-btn" id="pignonOui">Oui — pignon (triangle)</button>
        </div>
        <div style="margin-top:16px;"><button class="btn btn-ghost" onclick="state._facSubStep='nom'; render();">Précédent</button></div>
      `;
      document.getElementById('pignonNon').addEventListener('click', ()=>{ f.pignon=false; state._facSubStep='longueur'; render(); });
      document.getElementById('pignonOui').addEventListener('click', ()=>{ f.pignon=true; state._facSubStep='longueur'; render(); });
      return;
    }
    if(state._facSubStep==='longueur'){
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1}${f.nom?' — '+f.nom:''}${f.pignon?' (pignon)':''}</div>
        <div class="qtitle">Longueur ${f.pignon?'de la base du pignon':'de la façade'} ?</div>
        <input class="finput" id="facInput" type="text" inputmode="decimal" placeholder="ex: 5,20" value="${f.longueur}"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="state._facSubStep='pignon'; render();">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{ f.longueur=document.getElementById('facInput').value; state._facSubStep='hauteur'; render(); });
      return;
    }
    if(state._facSubStep==='hauteur'){
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1}${f.nom?' — '+f.nom:''}${f.pignon?' (pignon)':''}</div>
        <div class="qtitle">Hauteur ${f.pignon?'au faîtage du pignon':'de la façade'} ?</div>
        <input class="finput" id="facInput" type="text" inputmode="decimal" placeholder="ex: 2,50" value="${f.hauteur}"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="state._facSubStep='longueur'; render();">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{ f.hauteur=document.getElementById('facInput').value; state._facSubStep='nbFenetres'; render(); });
      return;
    }
    if(state._facSubStep==='nbFenetres'){
      const surfaceBrute = f.pignon ? (numF(f.longueur)*numF(f.hauteur))/2 : numF(f.longueur)*numF(f.hauteur);
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1}${f.nom?' — '+f.nom:''}</div>
        <div class="qtitle">Combien de fenêtres sur cette façade ?</div>
        <div class="qsub">Surface façade brute${f.pignon?' (triangle)':''} = ${surfaceBrute.toFixed(1)} m². Ne compte pas les portes ici.</div>
        <input class="finput" id="facInput" type="number" value="${f.fenetres.length}" placeholder="0"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="state._facSubStep='hauteur'; render();">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{
        const n = Math.max(0, parseInt(document.getElementById('facInput').value)||0);
        f.fenetres = Array.from({length:n}, (_,i)=> f.fenetres[i] || {id:wid(), largeur:'', hauteur:''});
        state._facFenIndex = 0;
        state._facSubStep = n>0 ? 'fenLargeur' : 'nbPortes';
        render();
      });
      return;
    }
    if(state._facSubStep==='fenLargeur'){
      const w = f.fenetres[state._facFenIndex];
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1} — Fenêtre ${state._facFenIndex+1}/${f.fenetres.length}</div>
        <div class="qtitle">Largeur de cette fenêtre ?</div>
        <input class="finput" id="facInput" type="text" inputmode="decimal" placeholder="ex: 1,20" value="${w.largeur}"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="state._facSubStep='nbFenetres'; render();">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{ w.largeur=document.getElementById('facInput').value; state._facSubStep='fenHauteur'; render(); });
      return;
    }
    if(state._facSubStep==='fenHauteur'){
      const w = f.fenetres[state._facFenIndex];
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1} — Fenêtre ${state._facFenIndex+1}/${f.fenetres.length}</div>
        <div class="qtitle">Hauteur de cette fenêtre ?</div>
        <input class="finput" id="facInput" type="text" inputmode="decimal" placeholder="ex: 1,40" value="${w.hauteur}"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="state._facSubStep='fenLargeur'; render();">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{
        w.hauteur=document.getElementById('facInput').value;
        if(state._facFenIndex < f.fenetres.length-1){ state._facFenIndex++; state._facSubStep='fenLargeur'; }
        else { state._facSubStep='nbPortes'; }
        render();
      });
      return;
    }
    if(state._facSubStep==='nbPortes'){
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1}${f.nom?' — '+f.nom:''}</div>
        <div class="qtitle">Combien de portes sur cette façade ?</div>
        <div class="qsub">Dissocié des fenêtres — les portes n'ont ni goutte d'eau ni appui de fenêtre.</div>
        <input class="finput" id="facInput" type="number" value="${f.portes.length}" placeholder="0"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="${f.fenetres.length>0 ? "state._facFenIndex="+(f.fenetres.length-1)+"; state._facSubStep='fenHauteur'; render();" : "state._facSubStep='nbFenetres'; render();"}">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{
        const n = Math.max(0, parseInt(document.getElementById('facInput').value)||0);
        f.portes = Array.from({length:n}, (_,i)=> f.portes[i] || {id:wid(), largeur:'', hauteur:''});
        state._facPorteIndex = 0;
        state._facSubStep = n>0 ? 'porteLargeur' : 'recapFacade';
        render();
      });
      return;
    }
    if(state._facSubStep==='porteLargeur'){
      const p = f.portes[state._facPorteIndex];
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1} — Porte ${state._facPorteIndex+1}/${f.portes.length}</div>
        <div class="qtitle">Largeur de cette porte ?</div>
        <input class="finput" id="facInput" type="text" inputmode="decimal" placeholder="ex: 0,90" value="${p.largeur}"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="state._facSubStep='nbPortes'; render();">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{ p.largeur=document.getElementById('facInput').value; state._facSubStep='porteHauteur'; render(); });
      return;
    }
    if(state._facSubStep==='porteHauteur'){
      const p = f.portes[state._facPorteIndex];
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1} — Porte ${state._facPorteIndex+1}/${f.portes.length}</div>
        <div class="qtitle">Hauteur de cette porte ?</div>
        <input class="finput" id="facInput" type="text" inputmode="decimal" placeholder="ex: 2,10" value="${p.hauteur}"/>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="state._facSubStep='porteLargeur'; render();">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facInput').focus();
      document.getElementById('facNext').addEventListener('click', ()=>{
        p.hauteur=document.getElementById('facInput').value;
        if(state._facPorteIndex < f.portes.length-1){ state._facPorteIndex++; state._facSubStep='porteLargeur'; }
        else { state._facSubStep='recapFacade'; }
        render();
      });
      return;
    }
    if(state._facSubStep==='recapFacade'){
      const c = calcFacade(f);
      app.innerHTML = `
        <div class="eyebrow">Façade ${state.facades.length+1}${f.nom?' — '+f.nom:''}${f.pignon?' (pignon)':''}</div>
        <div class="qtitle">Récapitulatif calculé de cette façade</div>
        <div style="margin-top:12px; padding:12px; background:#FFF7E6; border:1px dashed #E0B23C; border-radius:3px;">
          <div class="recap-line"><span>Surface ouvertures — fenêtres + portes (à déduire)</span><span class="mono">− ${c.surfaceOuvertures.toFixed(1)} m²</span></div>
          <div class="recap-line" style="font-weight:700;"><span>Surface isolant ITE à poser (vide pour plein)</span><span class="mono">${c.surfaceNette.toFixed(1)} m²</span></div>
          <div class="recap-line"><span>Baguettes d'angle (façade + fenêtres + portes)</span><span class="mono">${c.baguettesTotal.toFixed(1)} m</span></div>
          <div class="recap-line"><span>Gouttes d'eau (fenêtres + portes)</span><span class="mono">${c.gouttesEau.toFixed(1)} m</span></div>
          <div class="recap-line"><span>Reprise tableaux intérieurs</span><span class="mono">${c.repriseTableaux.toFixed(1)} m</span></div>
        </div>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-ghost" onclick="facRecapBack()">Précédent</button>
          <button class="btn btn-primary" id="facNext">Suivant</button>
        </div>
      `;
      document.getElementById('facNext').addEventListener('click', ()=>{ state._facSubStep='again'; render(); });
      return;
    }
    if(state._facSubStep==='again'){
      app.innerHTML = `
        <div class="eyebrow">Façades</div>
        <div class="qtitle">Faut-il ajouter une autre façade ?</div>
        ${already}
        <div class="choices">
          <button type="button" class="choice-btn" onclick="facAgain(false)">Non, continuer</button>
          <button type="button" class="choice-btn" onclick="facAgain(true)">Oui, en ajouter une</button>
        </div>
        <div style="margin-top:16px;"><button class="btn btn-ghost" onclick="state._facSubStep='recapFacade'; render();">Précédent</button></div>
      `;
      return;
    }
  }

  if(STEPS[step]==='questions'){ renderQuestions(); return; }

  if(STEPS[step]==='recap'){
    const majo = state.forme!=='rect';
    app.innerHTML = `
      <div class="eyebrow">Récapitulatif</div>
      <div class="qtitle">Devis — structure façade par façade</div>
      ${majo ? `<div class="warnline">⚠️ +3% appliqué (forme "${state.forme}")</div>` : ''}
      <div class="recap-group">
        <h4>Une seule fois — chantier global</h4>
        <div class="recap-line"><span>Organisation de chantier ${state.demandeur==='nous'?'DP':'classique'}</span><span class="mono">1×</span></div>
        ${state.echafs.map(e=>`<div class="recap-line"><span>Échafaudage ${e.type}</span><span class="mono">${e.m2||0} m²</span></div>`).join('')}
        <div class="recap-line"><span>Rail de départ ${state.q.railTaille||''} (total des longueurs de façades)</span><span class="mono">${calcRailDepart().toFixed(2)} m</span></div>
        ${state.q.isolants.map(i=>`<div class="recap-line"><span>Isolant ${i.type} ${i.epaisseur}mm</span><span class="mono">${i.m2} m²</span></div>`).join('')}
        ${state.q.repriseTableaux?`<div class="recap-line"><span>Reprise tableaux — ${state.q.repriseTableaux}${state.q.repriseEpaisseur?' ('+state.q.repriseEpaisseur+')':''}</span><span class="mono">✓</span></div>`:''}
        ${state.q.volets===1?`<div class="recap-line"><span>Volets — gonds (${state.q.voletsGondsPetits==='oui'?'TRAWIK-PLUS':'TRAWIK'})</span><span class="mono">${state.q.voletsGonds||0}×</span></div>`:''}
        ${state.q.volets===1?`<div class="recap-line"><span>Accroches volets (ZYRILLO)</span><span class="mono">${state.q.voletsAccroches||0}×</span></div>`:''}
        ${state.q.storeBanne===1?`<div class="recap-line"><span>Accroches store banne (UMP TRI)</span><span class="mono">${state.q.storeAccroches||0}×</span></div>`:''}
        ${state.q.robinets===1?`<div class="recap-line"><span>Prolongation robinet</span><span class="mono">${state.q.robinetsNb||0}×</span></div>`:''}
        ${state.q.marquises===1?`<div class="recap-line"><span>Marquises</span><span class="mono">${state.q.marquisesNb||0}×</span></div>`:''}
        ${state.q.couvertineChoix && state.q.couvertineChoix!=='aucun'?`<div class="recap-line"><span>${state.q.couvertineChoix==='couvertine'?'Couvertine '+(calcCouvertineTaille()?calcCouvertineTaille()+'mm':''):'Prolongation toiture'+(state.q.toitureCouleur?' — '+state.q.toitureCouleur:'')}</span><span class="mono">${state.q.couvertineMl||0} ml</span></div>`:''}
        ${state.q.descentesConcernees===1?`<div class="recap-line"><span>Descentes gouttière${state.q.descentesChange===1?' — '+(state.q.descentesMateriau||'')+' '+(state.q.descentesTaille||''):''}</span><span class="mono">${state.q.descentesMl||0} ml</span></div>`:''}
        ${(()=>{ const c=calcAppuisAuto(); return Object.entries(c).filter(([,n])=>n>0).map(([taille,n])=>`<div class="recap-line"><span>Appui de fenêtre ${taille}</span><span class="mono">${n}×</span></div>`).join(''); })()}
        ${state.q.depose===1?`<div class="recap-line"><span>Dépose ancienne isolation</span><span class="mono">${state.q.deposeM2||0} m²</span></div>`:''}
        ${state.q.bouches===1?`<div class="recap-line"><span>Prolongation bouche chaudière</span><span class="mono">${state.q.bouchesNb||0}×</span></div>`:''}
        ${state.q.elecNb>0?`<div class="recap-line"><span>Points électriques (ELDOLINE)</span><span class="mono">${state.q.elecNb}×</span></div>`:''}
        ${state.q.seuils===1?`<div class="recap-line"><span>Seuils de porte</span><span class="mono">${state.q.seuilsNb||0}×</span></div>`:''}
        ${state.q.gardecorps===1?`<div class="recap-line"><span>Garde-corps</span><span class="mono">${state.q.gardecorpsNb||0}×</span></div>`:''}
        ${state.q.railLateral===1?`<div class="recap-line"><span>Rail latéral</span><span class="mono">${state.q.railLateralMl||0} ml</span></div>`:''}
        ${state.q.protegePac===1?`<div class="recap-line"><span>Protection PAC</span><span class="mono">1×</span></div>`:''}
        ${state.q.grillesAeration===1?`<div class="recap-line"><span>Grille d'aération</span><span class="mono">${state.q.grillesAerationNb||0}×</span></div>`:''}
        ${state.q.modenatures===1?`<div class="recap-line"><span>Modénatures (${state.q.modenaturesType})</span><span class="mono">${state.q.modenaturesMl||0} ml</span></div>`:''}
        ${state.q.briquettes===1?`<div class="recap-line"><span>Briquettes (${state.q.briquettesType})</span><span class="mono">${state.q.briquettesM2||0} m²</span></div>`:''}
        ${state.q.peintureSousFace===1?`<div class="recap-line"><span>Peinture sous-face (${state.q.peintureSousFaceCouleur||''})</span><span class="mono">${state.q.peintureSousFaceMl||0} ml</span></div>`:''}
        ${state.q.finitionType && state.q.finitionType!=='classique'?`<div class="recap-line"><span>Finition — ${FINITIONS.find(f=>f.id===state.q.finitionType).label}</span><span class="mono">✓</span></div>`:''}
        ${state.q.facadeCouleur?`<div class="recap-line"><span>Couleur façade — ${state.q.facadeCouleur}${state.q.facadeCouleurOption?' (option)':' (incluse)'}</span><span class="mono">${state.q.facadeCouleurOption?'+8€/m²':'—'}</span></div>`:''}
        ${state.q.facadeCouleurBicolore && state.q.facadeCouleur2?`<div class="recap-line"><span>Bicolore — 2ème teinte ${state.q.facadeCouleur2}${state.q.facadeCouleur2Option?' (option)':' (incluse)'}</span><span class="mono">+10€/m²</span></div>`:''}
        ${state.q.ceeApplicable===1?`<div class="recap-line"><span>CEE (${state.q.ceePrecaire==='precaire'?'précaire':'classique'})</span><span class="mono">− ${calcMontantCEE().toLocaleString('fr-FR')} €</span></div>`:''}
      </div>
      ${state.facades.map((f,i)=>{ const c=calcFacade(f); return `
        <div class="recap-group">
          <h4>Façade ${i+1}${f.nom?' — '+f.nom:''}</h4>
          <div class="recap-line"><span>Isolant ITE — surface nette (vide pour plein)</span><span class="mono">${f.longueur&&f.hauteur?c.surfaceNette.toFixed(1)+' m²':'—'}</span></div>
          <div class="recap-line"><span>Fenêtres à traiter</span><span class="mono">${f.fenetres.length}×</span></div>
          ${c.baguettesTotal>0?`<div class="recap-line"><span>Baguette d'angle</span><span class="mono">${c.baguettesTotal.toFixed(1)} m</span></div>`:''}
          ${c.gouttesEau>0?`<div class="recap-line"><span>Goutte d'eau</span><span class="mono">${c.gouttesEau.toFixed(1)} m</span></div>`:''}
          ${c.repriseTableaux>0?`<div class="recap-line"><span>Reprise tableaux intérieurs</span><span class="mono">${c.repriseTableaux.toFixed(1)} m</span></div>`:''}
        </div>
      `; }).join('')}
      <div id="genZone"></div>
    `;
    renderGenZone();
    return;
  }
}

function renderGenZone(){
  const zone = document.getElementById('genZone');
  if(!zone) return;
  if(genStatus==='idle'){
    zone.innerHTML = `
      <div style="margin-top:18px; display:flex; gap:10px;">
        <button class="btn btn-ghost" id="genRestartBtn">↺ Recommencer</button>
        <button class="btn btn-primary" id="genBtn">🧾 Générer le devis</button>
      </div>
    `;
    document.getElementById('genRestartBtn').addEventListener('click', ()=>{ location.reload(); });
    document.getElementById('genBtn').addEventListener('click', genererDevis);
  } else if(genStatus==='checking'){
    zone.innerHTML = `<div class="okline">⏳ Génération du devis en cours…</div>`;
  } else if(genStatus==='missing'){
    zone.innerHTML = `
      <div class="warnline">
        ❌ ${genMissing.length} référence(s) introuvable(s) dans le catalogue :<br/>
        <span class="mono">${genMissing.join(', ')}</span><br/><br/>
        Va dans Admin → Catalogue produits du CRM pour les ajouter, puis reviens ici.
      </div>
      <div style="margin-top:12px;"><button class="btn btn-ghost" id="genRetryBtn">↺ Réessayer</button></div>
    `;
    document.getElementById('genRetryBtn').addEventListener('click', ()=>{ genStatus='idle'; renderGenZone(); });
  } else if(genStatus==='error'){
    zone.innerHTML = `
      <div class="warnline">❌ Erreur lors de la génération : ${genError}</div>
      <div style="margin-top:12px;"><button class="btn btn-ghost" id="genRetryBtn">↺ Réessayer</button></div>
    `;
    document.getElementById('genRetryBtn').addEventListener('click', ()=>{ genStatus='idle'; renderGenZone(); });
  } else if(genStatus==='success'){
    const totalTTC = genLignes.reduce((s,l)=> s + l.prixTTC*l.quantite, 0);
    zone.innerHTML = `
      <div class="okline">✅ Devis ${genDevisNumero} généré et enregistré sur la fiche du client.</div>
      <div style="margin-top:16px; background:var(--panel); border:1.5px solid var(--line); border-radius:4px; padding:16px;">
        <div style="font-family:'Oswald',sans-serif; text-transform:uppercase; font-size:13px; letter-spacing:.03em; color:var(--amber-deep); margin-bottom:10px; border-bottom:2px solid var(--ink); padding-bottom:6px;">Détail du devis</div>
        ${genLignes.map(l=>`
          <div style="display:flex; justify-content:space-between; gap:10px; font-size:12.5px; padding:6px 0; border-bottom:1px solid var(--concrete-2);">
            <span style="flex:1;">${l.designation}<br/><span class="mono" style="color:var(--ink-soft); font-size:11px;">${l.quantite} ${l.unite} × ${l.prixTTC.toFixed(2)}€</span></span>
            <span class="mono" style="flex-shrink:0; font-weight:700;">${(l.prixTTC*l.quantite).toFixed(2)} €</span>
          </div>
        `).join('')}
        <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:700; padding-top:14px; margin-top:6px; border-top:3px solid var(--ink);">
          <span>Total</span><span>${totalTTC.toFixed(2)} €</span>
        </div>
      </div>
      <div style="margin-top:16px; display:flex; gap:10px;">
        <button class="btn btn-ghost" id="genPdfBtn">📄 Voir le PDF</button>
        <button class="btn btn-primary" id="genDoneBtn">Terminé</button>
      </div>
    `;
    document.getElementById('genPdfBtn').addEventListener('click', genererPDFConfigurateur);
    document.getElementById('genDoneBtn').addEventListener('click', ()=>{ onExit && onExit(); });
  }
}

let genStatus = 'idle';
let genMissing = [];
let genError = '';
let genDevisNumero = '';
let genLignes = [];
let genDevis = null;
let genClientApres = null;

function matchProduct(refCode){ return catalogue.find(p=>p.ref===refCode); }

function buildDevisLignes(){
  const lignes = [];
  const missing = [];
  function addLine(refCode, quantite){
    if(!refCode || !quantite || quantite<=0) return;
    const prod = matchProduct(refCode);
    if(!prod){ if(!missing.includes(refCode)) missing.push(refCode); return; }
    lignes.push({
      id: uid(), produitId: prod.id, designation: prod.designation, description: prod.description||'',
      unite: prod.unite||'unité', tva: prod.tva||10, prixTTC: Number(prod.prixHT)||0,
      quantite: Math.round(quantite*100)/100,
    });
  }

  addLine(state.demandeur==='nous' ? 'ORGA-DP' : 'ORGA-CLASSIQUE', 1);

  const echafTotals = {};
  state.echafs.forEach(e=>{
    let refCode = null;
    if(e.type==='classique' || e.type==='voisin') refCode='ECHAF-CLASSIQUE';
    else if(e.type==='voirie' || e.type==='copro') refCode='ECHAF-VOIRIE';
    if(!refCode) return;
    echafTotals[refCode] = (echafTotals[refCode]||0) + numF(e.m2);
  });
  Object.entries(echafTotals).forEach(([refCode,m2])=> addLine(refCode, m2));

  if(state.q.railTaille){
    const mm = parseInt(state.q.railTaille);
    addLine('RAIL-DEP-'+mm, calcRailDepart());
  }

  const ISOL_TYPE_MAP = {'Laine de bois':'BOIS','Laine de roche':'LAINEROCHE','Résol':'RESOL','Polystyrène':'POLYSTYRENE'};
  state.q.isolants.forEach(i=>{
    const t = ISOL_TYPE_MAP[i.type];
    if(!t) return;
    addLine('ISOL-'+t+'-'+i.epaisseur, numF(i.m2));
  });

  const repriseTotal = state.facades.reduce((s,f)=> s + calcFacade(f).repriseTableaux, 0);
  if(state.q.repriseTableaux==='ravalement') addLine('REPRISE-RAVAL', repriseTotal);
  else if(state.q.repriseTableaux==='isolant' && state.q.repriseEpaisseur){
    const ep = state.q.repriseEpaisseur.replace(' cm','CM').replace(' ','');
    addLine('REPRISE-ISOL-'+ep, repriseTotal);
  }

  const baguettesTotal = state.facades.reduce((s,f)=> s + calcFacade(f).baguettesTotal, 0);
  const gouttesTotal = state.facades.reduce((s,f)=> s + calcFacade(f).gouttesEau, 0);
  addLine('ARM-ANGLE', baguettesTotal);
  addLine('GOUTTE-EAU', gouttesTotal);

  if(state.q.volets===1){
    addLine(state.q.voletsGondsPetits==='oui' ? 'TRAWIK-PLUS' : 'TRAWIK', numF(state.q.voletsGonds));
    addLine('ZYRILLO', numF(state.q.voletsAccroches));
  }
  let umpTri = 0;
  if(state.q.storeBanne===1) umpTri += numF(state.q.storeAccroches);
  if(state.q.marquises===1){
    umpTri += numF(state.q.marquisesAccroches);
    addLine('MARQUISE', numF(state.q.marquisesNb));
  }
  addLine('UMP-TRI', umpTri);

  if(state.q.robinets===1) addLine('ROBINET-PROLONG', numF(state.q.robinetsNb));

  if(state.q.couvertineChoix==='couvertine'){
    const taille = calcCouvertineTaille();
    if(taille) addLine('COUVERTINE-'+taille, numF(state.q.couvertineMl));
  } else if(state.q.couvertineChoix==='toiture'){
    addLine('TOIT-PROLONG', numF(state.q.couvertineMl));
  }

  if(state.q.descentesConcernees===1){
    if(state.q.descentesChange===1 && state.q.descentesMateriau && state.q.descentesTaille){
      const mat = state.q.descentesMateriau.toUpperCase();
      const taille = parseInt(state.q.descentesTaille);
      addLine('GOUTT-CHANGE-'+mat+'-'+taille, numF(state.q.descentesMl));
    } else {
      addLine('GOUTT-DEPOSE', numF(state.q.descentesMl));
    }
    addLine('ZYRILLO', numF(state.q.descentesFixations));
  }

  const appuis = calcAppuisAuto();
  Object.entries(appuis).forEach(([taille,n])=>{
    if(n>0) addLine('APPUI-FEN-'+parseInt(taille), n);
  });

  if(state.q.depose===1) addLine('DEPOSE-ISOL', numF(state.q.deposeM2));
  if(state.q.bouches===1) addLine('BOUCHE-CHAUD', numF(state.q.bouchesNb));
  if(numF(state.q.elecNb)>0) addLine('ELDOLINE', numF(state.q.elecNb));
  if(state.q.seuils===1) addLine('SEUIL-PROLONG', numF(state.q.seuilsNb));
  if(state.q.gardecorps===1) addLine('GC-PROLONG', numF(state.q.gardecorpsNb));
  if(state.q.railLateral===1) addLine('RAIL-LATERAL', numF(state.q.railLateralMl));
  if(state.q.protegePac===1) addLine('PROTECTION-PAC', 1);
  if(state.q.grillesAeration===1) addLine('GRILLE-AERATION', numF(state.q.grillesAerationNb));

  if(state.q.modenatures===1 && state.q.modenaturesType){
    const MODEN_MAP = {trompe:'TROMPE','1.5mm':'1.5MM','1cm':'1CM','2cm':'2CM'};
    const t = MODEN_MAP[state.q.modenaturesType];
    if(t) addLine('MODENATURE-'+t, numF(state.q.modenaturesMl));
  }
  if(state.q.briquettes===1 && state.q.briquettesType){
    addLine('BRIQUETTE-'+state.q.briquettesType.toUpperCase(), numF(state.q.briquettesM2));
  }
  if(state.q.peintureSousFace===1) addLine('PEINTURE-SF', numF(state.q.peintureSousFaceMl));

  const surfaceNetteTotal = totalSurfaceNetteFacades();
  if(state.q.finitionType==='silco') addLine('FINITION-SILCO', surfaceNetteTotal);
  else if(state.q.finitionType==='lotusan') addLine('FINITION-LOTUSAN', surfaceNetteTotal);

  if(state.q.facadeCouleurOption) addLine('COULEUR-OPTION', surfaceNetteTotal);
  if(state.q.facadeCouleurBicolore) addLine('COULEUR-BICOLORE', surfaceNetteTotal);

  if(missing.length===0 && state.forme!=='rect'){
    const sousTotal = lignes.reduce((s,l)=> s + l.prixTTC*l.quantite, 0);
    const majoration = Math.round(sousTotal*0.03*100)/100;
    if(majoration>0){
      lignes.push({ id:uid(), produitId:null, designation:"Majoration forme de bâtiment complexe (+3%)", description:"Forme: "+state.forme, unite:'forfait', tva:10, prixTTC:majoration, quantite:1 });
    }
  }

  return { lignes, missing };
}

async function genererDevis(){
  const { lignes, missing } = buildDevisLignes();
  if(missing.length){ genStatus='missing'; genMissing=missing; renderGenZone(); return; }
  genStatus='checking'; renderGenZone();
  try{
    const montantCEE = calcMontantCEE();
    const ceeInfo = state.q.ceeApplicable===1 ? {
      surfaces: { murs: totalSurfaceNetteFacades() },
      resistances: { murs: true },
      precaire: state.q.ceePrecaire==='precaire',
      montant: montantCEE,
    } : null;
    const result = await onGenerate({
      missingRefs: [],
      devisSections: [{ id: uid(), type: "Isolation des murs par l'extérieur", lignes }],
      montantCEE,
      ceeInfo,
    });
    if(result && result.ok){
      genStatus='success'; genDevisNumero=result.devisNumero||''; genLignes=lignes;
      genDevis = result.devis || null; genClientApres = result.client || client;
    }
    else if(result && result.missingRefs && result.missingRefs.length){ genStatus='missing'; genMissing=result.missingRefs; }
    else { genStatus='error'; genError=(result && result.error) || 'Erreur inconnue.'; }
  } catch(e){
    genStatus='error'; genError=String(e);
  }
  renderGenZone();
}

function setDemandeur(v){ state.demandeur=v; render(); }

function esc(x){ return String(x==null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function eur(n){ return (Math.round(n*100)/100).toLocaleString("fr-FR",{minimumFractionDigits:2, maximumFractionDigits:2}) + " €"; }
function fmtDatePdf(d){ return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit", month:"2-digit", year:"numeric"}); }

// Génère le PDF du devis — même gabarit visuel exact que le CRM (DevisBuilder → genererPDF).
function genererPDFConfigurateur(){
  const dv = genDevis;
  const cl = genClientApres || client;
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
  @media print{@page{size:A4;margin:0;} .page{min-height:auto;}}
</style></head><body><div class="page"><div class="content">
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
function setForme(v){ state.forme=v; render(); }
function echafSetType(k){ state._echafType=k; state._echafSubStep='m2'; render(); }
function echafSetM2(v){ state._echafM2=v; state._echafSubStep='again'; render(); }
function echafAgain(yes){
  state.echafs.push({ id:uid(), type:state._echafType, m2:state._echafM2 });
  if(yes){ state._echafType=null; state._echafM2=''; state._echafSubStep='type'; render(); }
  else { nextStep(); }
}

// ============================================================
// PHASE "QUESTIONS" — reprend le wizard d'origine, en RETIRANT
// tout ce qui est déjà calculé automatiquement via les façades :
// échafaudage (déjà demandé), rail (longueur déjà connue, on ne
// redemande que la taille), gouttes d'eau / armatures d'angle /
// reprise tableaux (déjà calculés facade par facade).
// ============================================================
state.q = {
  isolants: [], _isolantType:null, _isolantM2:null, _isolantAgain:null,
  finitionType:null, facadeCouleur:null, facadeCouleurOption:false, facadeCouleurBicolore:false, facadeCouleur2:null, facadeCouleur2Option:false,
};
let qCurrent = 0;
let qHistory = [];

function totalSurfaceNetteFacades(){
  return state.facades.reduce((s,f)=> s + calcFacade(f).surfaceNette, 0);
}
function totalIsolantM2Saisi(){
  return state.q.isolants.reduce((s,i)=> s + (parseFloat(i.m2)||0), 0);
}

// Reprend exactement la formule calcCEE() du CRM pour le poste "murs" (ITE/ITI).
// Barème stocké dans Firebase à crm/baremesCEE.murs = {p: €/m² précaire, np: €/m² non précaire}.
function calcMontantCEE(){
  if(state.q.ceeApplicable!==1) return 0;
  const m2 = totalSurfaceNetteFacades();
  if(m2<=0) return 0;
  const champ = state.q.ceePrecaire==='precaire' ? 'p' : 'np';
  const tarif = Number((baremesCEE && baremesCEE.murs && baremesCEE.murs[champ]) || 0);
  return Math.round(m2 * tarif);
}

const QUESTIONS = [
  // — RAIL DE DÉPART (longueur déjà connue, on ne demande que la taille)
  {id:'railTaille', type:'choice', q:"Taille du rail de départ ?", key:'railTaille',
    sub:`Longueur déjà calculée grâce aux façades : ${'{{railTotal}}'} m`,
    options:['80 mm','90 mm','100 mm','120 mm','130 mm','140 mm','145 mm','160 mm','180 mm','200 mm']},

  // — ISOLANT (boucle : type + épaisseur + m² ; "encore un ?")
  {id:'isolantType', type:'choice', q:"Quel isolant ?", key:'_isolantType', options:['Laine de bois','Laine de roche','Résol','Polystyrène']},
  {id:'isolantM2', type:'number', q:"Surface pour cet isolant ?", key:'_isolantM2', unit:'m²',
    sub:`Épaisseur reprise automatiquement du rail de départ choisi (${'{{railTaille}}'}). Surface nette totale calculée via les façades : ${'{{surfaceNette}}'} m² (vide pour plein)`},
  {id:'isolantAgain', type:'toggle', q:"Faut-il ajouter un autre isolant sur une autre façade (type différent) ?", key:'_isolantAgain'},

  // — REPRISE DES TABLEAUX (le ml est déjà calculé par façade, on garde juste le choix ravalement/isolant)
  {id:'repriseTableaux', type:'choice', q:"Reprise des tableaux de fenêtre : ravalement ou isolant ?", key:'repriseTableaux', options:[["Ravalement","ravalement"],["Isolant","isolant"]]},
  {id:'repriseEpaisseur', type:'choice', q:"Épaisseur d'isolant pour la reprise des tableaux ?", key:'repriseEpaisseur', options:['2 cm','4 cm','6 cm'], skip:q=>q.repriseTableaux!=='isolant'},

  // — VOLETS (+ nouvelle règle TRAWIK / TRAWIK+)
  {id:'volets', type:'toggle', q:"Faut-il remettre les volets battants ?", key:'volets'},
  {id:'voletsGondsPetits', type:'choice', q:"Les gonds sont-ils petits ?", key:'voletsGondsPetits', options:[["Oui — petits","oui"],["Non — standard","non"]],
    sub:"Petits → référence TRAWIK-PLUS · Standard → référence TRAWIK", skip:q=>q.volets!==1},
  {id:'voletsGonds', type:'number', q:"Combien de gonds de volet au total ?", key:'voletsGonds', unit:'u', skip:q=>q.volets!==1},
  {id:'voletsAccroches', type:'number', q:"Combien de points d'accroche au mur pour les volets ?", key:'voletsAccroches', unit:'u', sub:'→ génère la quantité de ZYRILLO', skip:q=>q.volets!==1},

  // — STORE BANNE
  {id:'storeBanne', type:'toggle', q:"Faut-il remettre le store banne, ou y a-t-il un projet d'en installer un ?", key:'storeBanne'},
  {id:'storeAccroches', type:'number', q:"Combien d'accroches pour le store banne ?", key:'storeAccroches', unit:'u', sub:'→ génère la quantité de UMP TRI', skip:q=>q.storeBanne!==1},

  // — ROBINETS
  {id:'robinets', type:'toggle', q:"Y a-t-il des robinets à prolonger ?", key:'robinets'},
  {id:'robinetsNb', type:'number', q:"Combien de robinets à prolonger ?", key:'robinetsNb', unit:'u', sub:"Seule la prolongation est facturée (référence unique).", skip:q=>q.robinets!==1},

  // — MARQUISES
  {id:'marquises', type:'toggle', q:"Y a-t-il une ou des marquises ?", key:'marquises'},
  {id:'marquisesNb', type:'number', q:"Combien de marquises ?", key:'marquisesNb', unit:'u', skip:q=>q.marquises!==1},
  {id:'marquisesRemettre', type:'toggle', q:"Faut-il les remettre ?", key:'marquisesRemettre', skip:q=>q.marquises!==1},
  {id:'marquisesAccroches', type:'number', q:"Combien d'accroches pour la/les marquise(s) ?", key:'marquisesAccroches', unit:'u', sub:'→ génère la quantité de UMP TRI', skip:q=>q.marquises!==1},

  // — COUVERTINE / TOITURE
  {id:'couvertineChoix', type:'choice', q:"Couvertine à poser, prolongation de toiture, ou rien (débord déjà suffisant) ?", key:'couvertineChoix', options:[["Couvertine","couvertine"],["Prolonger la toiture","toiture"],["Aucun — débord déjà OK","aucun"]]},
  {id:'couvertineMl', type:'number', q:"Combien de ml ?", key:'couvertineMl', unit:'ml', skip:q=>q.couvertineChoix==='aucun'},
  {id:'toitureCouleur', type:'choice', q:"Quelle couleur de tuile ?", key:'toitureCouleur', options:['Ton pierre','Blanc','Jaune','Gris','Gris clair'], skip:q=>q.couvertineChoix!=='toiture'},

  // — GOUTTIÈRES (descentes)
  {id:'descentesConcernees', type:'toggle', q:"Y a-t-il un changement de descente de gouttière ou une dépose/repose des gouttières ?", key:'descentesConcernees'},
  {id:'descentesMl', type:'number', q:"Combien de mètres linéaires de descente de gouttière ?", key:'descentesMl', unit:'ml', skip:q=>q.descentesConcernees!==1},
  {id:'descentesChange', type:'toggle', q:"S'agit-il d'un changement de matériau (et pas seulement d'une dépose/repose à l'identique) ?", key:'descentesChange', skip:q=>q.descentesConcernees!==1},
  {id:'descentesMateriau', type:'choice', q:"Zinc ou PVC ?", key:'descentesMateriau', options:['Zinc','PVC'], skip:q=>q.descentesConcernees!==1 || q.descentesChange!==1},
  {id:'descentesTaille', type:'choice', q:"Quelle taille ?", key:'descentesTaille', options:['80 mm','100 mm'], skip:q=>q.descentesConcernees!==1 || q.descentesChange!==1},
  {id:'descentesFixations', type:'number', q:"Combien d'accroches pour les descentes de gouttière ?", key:'descentesFixations', unit:'u', sub:'→ génère la quantité de ZYRILLO', skip:q=>q.descentesConcernees!==1},

  // — APPUIS DE FENÊTRE (boucle)
  {id:'appuisAuto', type:'info', q:"Appuis de fenêtre à prolonger"},

  // — DÉPOSE
  {id:'depose', type:'toggle', q:"Faut-il déposer une ancienne isolation ?", key:'depose'},
  {id:'deposeM2', type:'number', q:"Combien de m² ?", key:'deposeM2', unit:'m²', skip:q=>q.depose!==1},

  // — BOUCHES CHAUDIÈRE
  {id:'bouches', type:'toggle', q:"Y a-t-il une bouche de chaudière ?", key:'bouches'},
  {id:'bouchesNb', type:'number', q:"Combien de prolongations de bouche à prévoir ?", key:'bouchesNb', unit:'u', skip:q=>q.bouches!==1},

  // — ÉLECTRIQUE
  {id:'elecNb', type:'number', q:"Combien de points électriques (prise ou lumière) à déporter ?", key:'elecNb', unit:'u', sub:'→ génère la quantité de ELDOLINE'},

  // — SEUILS
  {id:'seuils', type:'toggle', q:"Faut-il prolonger un ou des seuils de porte ?", key:'seuils'},
  {id:'seuilsNb', type:'number', q:"Combien ?", key:'seuilsNb', unit:'u', skip:q=>q.seuils!==1},

  // — GARDE-CORPS
  {id:'gardecorps', type:'toggle', q:"Faut-il prolonger un ou des garde-corps ?", key:'gardecorps'},
  {id:'gardecorpsNb', type:'number', q:"Combien ?", key:'gardecorpsNb', unit:'u', skip:q=>q.gardecorps!==1},

  // — RAIL LATÉRAL
  {id:'railLateral', type:'toggle', q:"Faut-il mettre un rail latéral ?", key:'railLateral'},
  {id:'railLateralMl', type:'number', q:"Combien de ml de rail latéral ?", key:'railLateralMl', unit:'ml', skip:q=>q.railLateral!==1},

  // — PROTECTION PAC
  {id:'protegePac', type:'toggle', q:"Faut-il protéger la PAC (pompe à chaleur) ?", key:'protegePac'},

  // — GRILLES D'AÉRATION
  {id:'grillesAeration', type:'toggle', q:"Faut-il mettre des grilles d'aération ?", key:'grillesAeration'},
  {id:'grillesAerationNb', type:'number', q:"Combien de grilles d'aération ?", key:'grillesAerationNb', unit:'u', skip:q=>q.grillesAeration!==1},

  // — OPTIONS ESTHÉTIQUES
  {id:'modenatures', type:'toggle', q:"Faut-il faire ou refaire des modénatures ?", key:'modenatures'},
  {id:'modenaturesType', type:'choice', q:"Quel type de modénature ?", key:'modenaturesType', options:[["Trompe l'œil","trompe"],["Épaisseur 1,5 mm","1.5mm"],["Épaisseur 1 cm","1cm"],["Épaisseur 2 cm","2cm"]], skip:q=>q.modenatures!==1},
  {id:'modenaturesMl', type:'number', q:"Combien de mètres linéaires de modénature ?", key:'modenaturesMl', unit:'ml', skip:q=>q.modenatures!==1},
  {id:'briquettes', type:'toggle', q:"Faut-il reproduire ou poser des briquettes ?", key:'briquettes'},
  {id:'briquettesType', type:'choice', q:"Souple ou Stobrick ?", key:'briquettesType', options:['Souple','Stobrick'], skip:q=>q.briquettes!==1},
  {id:'briquettesM2', type:'number', q:"Combien de m² ?", key:'briquettesM2', unit:'m²', skip:q=>q.briquettes!==1},
  {id:'peintureSousFace', type:'toggle', q:"Faut-il repeindre les sous-faces (rives, débords de toit) ?", key:'peintureSousFace'},
  {id:'peintureSousFaceMl', type:'number', q:"Combien de ml de peinture sous face ?", key:'peintureSousFaceMl', unit:'ml', skip:q=>q.peintureSousFace!==1},
  {id:'peintureSousFaceCouleur', type:'text', q:"Quelle couleur pour la peinture sous face ?", key:'peintureSousFaceCouleur', skip:q=>q.peintureSousFace!==1},
  {id:'finitions', type:'finitions', q:"Finition de l'isolant"},
  // — CEE (Certificats d'Économie d'Énergie)
  {id:'ceeApplicable', type:'toggle', q:"Y a-t-il des CEE (Certificats d'Économie d'Énergie) sur ce chantier ?", key:'ceeApplicable'},
  {id:'ceePrecaire', type:'choice', q:"Le foyer est-il en situation de précarité énergétique ?", key:'ceePrecaire',
    sub:"Détermine le barème CEE applicable (précaire ou classique).",
    options:[["Précaire","precaire"],["Non précaire (classique)","classique"]], skip:q=>q.ceeApplicable!==1},

  {id:'facadeCouleur', type:'couleurFacade', q:"Quelle couleur de façade ?"},
];

const FINITIONS = [
  {id:'classique', label:'Enduit classique', priceM2:0, swatch:'linear-gradient(135deg,#E7E3D8,#CFC9BA)'},
  {id:'silco', label:'Silco', priceM2:3, swatch:'linear-gradient(135deg,#D8D4C8,#B0AA98)'},
  {id:'lotusan', label:'Lotusan', priceM2:5, swatch:'linear-gradient(135deg,#E4E7E1,#C3C9BC)'},
];

// Nuancier Sto — teintes façade (12 incluses) + teintes complémentaires (8, option +8€/m²)
const COULEURS_INCLUSES = [
  {label:'Bianco Carrara', code:'Y08 94 06', hex:'#F2EFE6'},
  {label:'Paille', code:'Y09 91 15', hex:'#F5E2CB'},
  {label:'Chanvre', code:'Y09 85 10', hex:'#E9D2BA'},
  {label:'Blanc os', code:'Y07 93 03', hex:'#F0EAE0'},
  {label:'Blanc de Vérone', code:'Y07 92 09', hex:'#EFE7DA'},
  {label:'Lencin', code:'Y08 87 08', hex:'#E4D5C2'},
  {label:'Craie de Rügen', code:'Y08 93 03', hex:'#EEE7DC'},
  {label:'Chamois', code:'Y11 85 10', hex:'#EAD3B8'},
  {label:'Gris nuage', code:'Y10 75 05', hex:'#CFC3B4'},
  {label:'Blanc opalin', code:'N00 93 00', hex:'#E9E5DD'},
  {label:'Blanc en neige', code:'Y08 90 03', hex:'#EDE8DD'},
  {label:'Perle', code:'Y08 80 03', hex:'#D9CFC2'},
];
const COULEURS_OPTION = [
  {label:'Savonnière', code:'Y10 82 16', hex:'#D9BB8E'},
  {label:'Biscuit', code:'Y10 75 15', hex:'#C9B399'},
  {label:'Glaise', code:'Y08 80 10', hex:'#D3B08C'},
  {label:'Greige', code:'Y09 70 10', hex:'#B49A80'},
  {label:'Torchis', code:'Y10 80 10', hex:'#D2AE85'},
  {label:'Terre crue', code:'Y12 69 21', hex:'#C08A55'},
  {label:'Pierre ponce', code:'Y08 70 03', hex:'#B7A996'},
  {label:'Gris orage', code:'B46 60 03', hex:'#8C8378'},
];

function calcAppuisAuto(){
  const counts = {'120 mm':0, '180 mm':0, '210 mm':0};
  state.facades.forEach(f=>{
    f.fenetres.forEach(w=>{
      const l = numF(w.largeur);
      if(l<=0) return;
      if(l<1.80) counts['120 mm']++;
      else if(l<2.10) counts['180 mm']++;
      else counts['210 mm']++;
    });
  });
  return counts;
}
function qIndexById(id){ return QUESTIONS.findIndex(s=>s.id===id); }
function qSkipOk(idx){ const s=QUESTIONS[idx]; return !s.skip || !s.skip(state.q); }
function qAdvanceFrom(fromIdx){
  qHistory.push(fromIdx);
  let idx = fromIdx+1;
  while(idx < QUESTIONS.length && !qSkipOk(idx)) idx++;
  qCurrent = idx;
  if(qCurrent >= QUESTIONS.length){ nextStep(); return; }
  render();
}
function qGoToIndexById(id, fromIdx){ qHistory.push(fromIdx); qCurrent = qIndexById(id); render(); }
function qGoBack(){ if(qHistory.length===0) return; qCurrent = qHistory.pop(); render(); }

function qHandleLoop(id){
  if(id==='isolantAgain'){
    if(state.q._isolantType) state.q.isolants.push({type:state.q._isolantType, epaisseur:(state.q.railTaille||'').replace(' mm',''), m2:state.q._isolantM2||0});
    if(state.q._isolantAgain===1){
      state.q._isolantType=null; state.q._isolantM2=null;
      qGoToIndexById('isolantType', qIndexById('isolantAgain'));
    } else { qAdvanceFrom(qIndexById('isolantAgain')); }
    return true;
  }
  return false;
}

function qAnswerChoice(id, key, val){
  state.q[key] = val;
  if(qHandleLoop(id)) return;
  qAdvanceFrom(qCurrent);
}

function renderQuestions(){
  const app = document.getElementById('app');
  const s = QUESTIONS[qCurrent];
  if(!s){ return; }
  let sub = s.sub || '';
  sub = sub.replace('{{railTotal}}', calcRailDepart().toFixed(2));
  sub = sub.replace('{{surfaceNette}}', totalSurfaceNetteFacades().toFixed(1));
  sub = sub.replace('{{railTaille}}', state.q.railTaille||'?');
  if(s.id==='couvertineMl' && state.q.couvertineChoix==='couvertine'){
    const taille = calcCouvertineTaille();
    sub = taille ? `Taille de couvertine calculée automatiquement : ${taille} mm (épaisseur isolant ${state.q.railTaille} + 2cm)` : `⚠️ Rail de départ pas encore choisi — impossible de calculer la taille de couvertine.`;
  }

  if(s.type==='choice'){
    const opts = s.options.map(o=> Array.isArray(o)?o:[o,o]);
    const modenaturePhotos = s.id==='modenaturesType' ? `
      <div class="row2" style="margin-bottom:16px;">
        <div style="text-align:center;">
          <img src="data:image/png;base64,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" style="width:100%; border-radius:4px; border:1.5px solid var(--line);"/>
          <div style="font-size:11px; font-weight:700; margin-top:4px;">Trompe l'œil (plat)</div>
        </div>
        <div style="text-align:center;">
          <img src="data:image/png;base64,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" style="width:100%; border-radius:4px; border:1.5px solid var(--line);"/>
          <div style="font-size:11px; font-weight:700; margin-top:4px;">Avec épaisseur (relief)</div>
        </div>
      </div>` : '';
    app.innerHTML = `
      <div class="eyebrow">Question ${qCurrent+1} / ${QUESTIONS.length}</div>
      <div class="qtitle">${s.q}</div>
      ${sub?`<div class="qsub">${sub}</div>`:''}
      ${modenaturePhotos}
      <div class="choices">${opts.map(([label,val],i)=>`<button type="button" class="choice-btn" data-i="${i}">${label}</button>`).join('')}</div>
      <div style="margin-top:16px;"><button class="btn btn-ghost" onclick="qGoBack()">Précédent</button></div>
    `;
    app.querySelectorAll('.choice-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{ const val = opts[parseInt(btn.dataset.i)][1]; qAnswerChoice(s.id, s.key, val); });
    });
    return;
  }
  if(s.type==='toggle'){
    app.innerHTML = `
      <div class="eyebrow">Question ${qCurrent+1} / ${QUESTIONS.length}</div>
      <div class="qtitle">${s.q}</div>
      ${sub?`<div class="qsub">${sub}</div>`:''}
      <div class="choices">
        <button type="button" class="choice-btn" id="qNon">Non</button>
        <button type="button" class="choice-btn" id="qOui">Oui</button>
      </div>
      <div style="margin-top:16px;"><button class="btn btn-ghost" onclick="qGoBack()">Précédent</button></div>
    `;
    document.getElementById('qNon').addEventListener('click', ()=>qAnswerChoice(s.id, s.key, 0));
    document.getElementById('qOui').addEventListener('click', ()=>qAnswerChoice(s.id, s.key, 1));
    return;
  }
  if(s.type==='number' || s.type==='text'){
    const existing = state.q[s.key];
    app.innerHTML = `
      <div class="eyebrow">Question ${qCurrent+1} / ${QUESTIONS.length}</div>
      <div class="qtitle">${s.q}</div>
      ${sub?`<div class="qsub">${sub}</div>`:''}
      <input class="finput" id="qInput" type="${s.type==='number'?'text':'text'}" inputmode="${s.type==='number'?'decimal':'text'}" value="${existing||''}" placeholder="${s.unit||''}"/>
      <div style="display:flex; gap:10px; margin-top:16px;">
        <button class="btn btn-ghost" onclick="qGoBack()">Précédent</button>
        <button class="btn btn-primary" id="qNextBtn">Suivant</button>
      </div>
    `;
    const inp = document.getElementById('qInput'); inp.focus();
    document.getElementById('qNextBtn').addEventListener('click', ()=>{ state.q[s.key]=inp.value; if(qHandleLoop(s.id)) return; qAdvanceFrom(qCurrent); });
    return;
  }
  if(s.type==='info' && s.id==='appuisAuto'){
    const counts = calcAppuisAuto();
    const total = counts['120 mm']+counts['180 mm']+counts['210 mm'];
    app.innerHTML = `
      <div class="eyebrow">Question ${qCurrent+1} / ${QUESTIONS.length}</div>
      <div class="qtitle">${s.q}</div>
      <div class="qsub">Calculé automatiquement à partir des largeurs de fenêtres déjà saisies dans les façades (moins de 1,80m → 120mm · entre 1,80m et 2,10m → 180mm · 2,10m et plus → 210mm).</div>
      <div style="margin-top:12px; padding:12px; background:#FFF7E6; border:1px dashed #E0B23C; border-radius:3px;">
        <div class="recap-line"><span>Appui de fenêtre 120 mm</span><span class="mono">${counts['120 mm']}×</span></div>
        <div class="recap-line"><span>Appui de fenêtre 180 mm</span><span class="mono">${counts['180 mm']}×</span></div>
        <div class="recap-line"><span>Appui de fenêtre 210 mm</span><span class="mono">${counts['210 mm']}×</span></div>
      </div>
      ${total===0?`<div class="warnline">⚠️ Aucune fenêtre saisie dans les façades — vérifie que les largeurs ont bien été renseignées.</div>`:''}
      <div style="display:flex; gap:10px; margin-top:16px;">
        <button class="btn btn-ghost" onclick="qGoBack()">Précédent</button>
        <button class="btn btn-primary" onclick="qAdvanceCurrent()">Suivant →</button>
      </div>
    `;
    return;
  }

  if(s.type==='couleurFacade'){
    const m2 = totalSurfaceNetteFacades();
    const ALL_COULEURS = [...COULEURS_INCLUSES.map(c=>({...c,option:false})), ...COULEURS_OPTION.map(c=>({...c,option:true}))];
    const renderSwatch = (c, isOption, keyName) => {
      const sel = state.q[keyName] === c.label;
      const price = isOption ? Math.round(8*m2) : 0;
      return `<button type="button" class="choice-btn swatch-btn ${sel?'sel':''}" data-label="${c.label}" data-option="${isOption?1:0}" data-key="${keyName}" style="display:flex; align-items:center; gap:10px; min-width:auto;">
        <span style="width:28px; height:28px; border-radius:4px; background:${c.hex}; border:1.5px solid var(--line); flex-shrink:0;"></span>
        <span style="display:flex; flex-direction:column;"><b>${c.label}</b><span class="desc">${c.code}${isOption?' · +'+price+'€ (+8€/m²)':' · inclus'}</span></span>
      </button>`;
    };
    const bicoloreCost = Math.round(10*m2);
    app.innerHTML = `
      <div class="eyebrow">Question ${qCurrent+1} / ${QUESTIONS.length}</div>
      <div class="qtitle">${s.q}</div>
      <div class="qsub">Nuancier Sto — couleurs indicatives, à valider sur nuancier physique avec le client. Surface façade : ${m2.toFixed(1)} m².</div>
      <div style="font-size:12px; font-weight:700; color:var(--ink-soft); text-transform:uppercase; margin:14px 0 6px;">Teintes incluses (12)</div>
      <div class="choices">${COULEURS_INCLUSES.map(c=>renderSwatch(c,false,'facadeCouleur')).join('')}</div>
      <div style="font-size:12px; font-weight:700; color:var(--amber-deep); text-transform:uppercase; margin:18px 0 6px;">Teintes en option — +8€/m² (8)</div>
      <div class="choices">${COULEURS_OPTION.map(c=>renderSwatch(c,true,'facadeCouleur')).join('')}</div>

      <div style="margin-top:20px; padding-top:16px; border-top:2px solid var(--line);">
        <div class="qtitle" style="font-size:16px;">Option bicolore ? <span class="desc" style="font-size:12px; font-weight:400;">(+10€/m² soit +${bicoloreCost}€)</span></div>
        <div class="choices" style="margin-top:8px;">
          <button type="button" class="choice-btn" id="bicoloreNon">Non</button>
          <button type="button" class="choice-btn" id="bicoloreOui">Oui</button>
        </div>
        ${state.q.facadeCouleurBicolore ? `
          <div style="font-size:12px; font-weight:700; color:var(--ink-soft); text-transform:uppercase; margin:16px 0 6px;">Choisir la 2ème couleur</div>
          <div class="choices">${ALL_COULEURS.map(c=>renderSwatch(c,c.option,'facadeCouleur2')).join('')}</div>
        ` : ''}
      </div>

      <div style="margin-top:16px; display:flex; gap:10px;">
        <button class="btn btn-ghost" onclick="qGoBack()">Précédent</button>
        <button class="btn btn-primary" onclick="qAdvanceCurrent()" ${(!state.q.facadeCouleur || (state.q.facadeCouleurBicolore && !state.q.facadeCouleur2))?'disabled':''}>Suivant →</button>
      </div>
    `;
    document.getElementById('bicoloreNon').addEventListener('click', ()=>{ state.q.facadeCouleurBicolore=false; state.q.facadeCouleur2=null; render(); });
    document.getElementById('bicoloreOui').addEventListener('click', ()=>{ state.q.facadeCouleurBicolore=true; render(); });
    if(state.q.facadeCouleurBicolore){
      document.getElementById('bicoloreOui').classList.add('sel');
    } else {
      document.getElementById('bicoloreNon').classList.add('sel');
    }
    app.querySelectorAll('.swatch-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const key = btn.dataset.key;
        state.q[key] = btn.dataset.label;
        if(key==='facadeCouleur') state.q.facadeCouleurOption = btn.dataset.option==='1';
        else state.q.facadeCouleur2Option = btn.dataset.option==='1';
        render();
      });
    });
    return;
  }

  if(s.type==='finitions'){
    const m2 = totalSurfaceNetteFacades();
    app.innerHTML = `
      <div class="eyebrow">Question ${qCurrent+1} / ${QUESTIONS.length}</div>
      <div class="qtitle">${s.q}</div>
      <div class="qsub">Choix unique. Calcul indicatif sur ${m2.toFixed(1)} m² d'isolant (surface nette façades) — prix réel repris du catalogue à la génération du devis.</div>
      <div class="choices">
        ${FINITIONS.map(f=>{ const price=Math.round(f.priceM2*m2); const sel=state.q.finitionType===f.id; return `
          <button type="button" class="choice-btn" data-id="${f.id}" style="border-left:6px solid ${sel?'var(--amber)':'var(--line)'};">
            ${f.label} <span class="desc">${f.priceM2>0 ? '+'+price+'€ ('+f.priceM2+'€/m²)' : 'inclus dans l\'isolant, pas de ligne devis séparée'}</span>
          </button>`; }).join('')}
      </div>
      <div style="display:flex; gap:10px; margin-top:16px;">
        <button class="btn btn-ghost" onclick="qGoBack()">Précédent</button>
        <button class="btn btn-primary" onclick="qAdvanceCurrent()" ${!state.q.finitionType?'disabled':''}>Suivant →</button>
      </div>
    `;
    app.querySelectorAll('[data-id]').forEach(tile=>{
      tile.addEventListener('click', ()=>{
        state.q.finitionType = tile.dataset.id;
        render();
      });
    });
    return;
  }
}

  // Expose sur window les fonctions référencées par les onclick inline du HTML généré dynamiquement.
  window.echafAgain = echafAgain;
  window.echafSetM2 = echafSetM2;
  window.echafSetType = echafSetType;
  window.facAgain = facAgain;
  window.facRecapBack = facRecapBack;
  window.goStep = goStep;
  window.qAdvanceFrom = qAdvanceFrom;
  window.qAdvanceCurrent = function(){ qAdvanceFrom(qCurrent); };
  window.state = state;
  window.qGoBack = qGoBack;
  window.render = render;
  window.setDemandeur = setDemandeur;
  window.setForme = setForme;

  container.querySelector('#backBtn').addEventListener('click', goBack);
  container.querySelector('#prevBtnFooter').addEventListener('click', prevStep);
  container.querySelector('#nextBtn').addEventListener('click', nextStep);

  state._facCurrent = newFacadeObj();
  render();
} // fin mountWizardITE
