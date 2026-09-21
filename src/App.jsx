import { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, runTransaction } from "firebase/database";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { mountWizardITE } from "./wizardITE.js";

// Même config Firebase que le CRM — même base de données, même projet.
const firebaseConfig = {
  apiKey: "AIzaSyB3UO6yIRuB-Ur_lOr1pt4YgLt3HxlVlo8",
  authDomain: "crm-renovation.firebaseapp.com",
  databaseURL: "https://crm-renovation-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "crm-renovation",
  storageBucket: "crm-renovation.firebasestorage.app",
  messagingSenderId: "1025954833282",
  appId: "1:1025954833282:web:7c12dd4f7d453040f3a59b",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

function normList(v) {
  if (Array.isArray(v)) return v.filter((x) => x != null);
  if (v && typeof v === "object") return Object.values(v).filter((x) => x != null);
  return [];
}

// ─────────────────────────────────────────────────────────
// Connexion (mêmes identifiants que le CRM)
// ─────────────────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const connexion = async () => {
    setErr(""); setInfo("");
    if (!email.trim() || !pass) { setErr("Renseigne ton email et ton mot de passe."); return; }
    setBusy(true);
    try { await signInWithEmailAndPassword(auth, email.trim(), pass); }
    catch (e) { setErr("Email ou mot de passe incorrect."); }
    setBusy(false);
  };
  const oubli = async () => {
    setErr(""); setInfo("");
    if (!email.trim()) { setErr("Tape d'abord ton email, puis clique à nouveau sur « Mot de passe oublié »."); return; }
    try { await sendPasswordResetEmail(auth, email.trim()); setInfo("Un email pour changer ton mot de passe vient d'être envoyé."); }
    catch (e) { setErr("Impossible d'envoyer l'email. Vérifie l'adresse."); }
  };
  return (
    <div style={styles.homeScreen}>
      <div style={styles.homeCenter}>
        <div style={styles.homeLogo}>KORÉO</div>
        <div style={styles.homeTitle}>Configurateur découverte</div>
        <div style={styles.homeSub}>Connecte-toi avec les mêmes identifiants que le CRM.</div>
        <div style={{ width: "100%", marginTop: 26, textAlign: "left" }}>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={styles.loginInput} />
          <input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") connexion(); }} placeholder="Mot de passe" style={{ ...styles.loginInput, marginTop: 10 }} />
          {err && <div style={styles.loginErr}>{err}</div>}
          {info && <div style={styles.loginInfo}>{info}</div>}
          <button onClick={oubli} style={styles.linkBtn}>Mot de passe oublié ?</button>
        </div>
      </div>
      <button onClick={connexion} disabled={busy} style={{ ...styles.homeBtn, opacity: busy ? 0.6 : 1 }}>{busy ? "Connexion…" : "Se connecter"}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Écran 1 : recherche client
// ─────────────────────────────────────────────────────────
function ClientSearch({ onSelect }) {
  const [clients, setClients] = useState(null); // null = chargement
  const [q, setQ] = useState("");
  const [err, setErr] = useState(null);

  useEffect(() => {
    get(ref(db, "crm/clients"))
      .then((snap) => {
        setClients(normList(snap.exists() ? snap.val() : []));
      })
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <div style={styles.centerMsg}>❌ Erreur de connexion à Firebase : {err}</div>;
  if (clients === null) return <div style={styles.centerMsg}>Chargement des clients…</div>;

  const ql = q.trim().toLowerCase();
  const filtered = ql.length < 2 ? [] : clients.filter((c) => {
    const blob = ((c.nom || "") + " " + (c.prenom || "") + " " + (c.telephone || "") + " " + (c.adresse || "")).toLowerCase();
    return blob.includes(ql);
  }).slice(0, 20);

  return (
    <div style={styles.screen}>
      <div style={styles.logo}>KORÉO</div>
      <div style={styles.title}>Configurateur découverte</div>
      <div style={styles.sub}>Tape le nom du client pour retrouver sa fiche</div>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Nom, prénom, téléphone, adresse..."
        style={styles.input}
      />
      {ql.length >= 2 && filtered.length === 0 && (
        <div style={styles.emptyMsg}>Aucun client trouvé. Vérifie l'orthographe, ou crée d'abord la fiche dans le CRM.</div>
      )}
      <div style={{ marginTop: 14 }}>
        {filtered.map((c) => (
          <button key={c.id} onClick={() => onSelect(c)} style={styles.clientBtn}>
            <div style={{ fontWeight: 700 }}>{c.civilite ? c.civilite + " " : ""}{c.nom} {c.prenom}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{c.telephone || ""} {c.adresse ? "· " + c.adresse : ""}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Écran 2 : choix du projet
// ─────────────────────────────────────────────────────────
function ProjectSelect({ client, onBack, onSelect }) {
  return (
    <div style={styles.screen}>
      <button onClick={onBack} style={styles.backBtn}>← Changer de client</button>
      <div style={styles.title}>{client.nom} {client.prenom}</div>
      <div style={styles.sub}>Quelle découverte veux-tu lancer ?</div>
      <button onClick={() => onSelect("ITE")} style={styles.projectBtn}>
        🏠 Isolation Thermique par l'Extérieur (ITE)
      </button>
      <div style={{ ...styles.projectBtn, opacity: 0.4, cursor: "default" }}>
        🏚️ Toiture — bientôt disponible
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Écran 3 : wizard (moteur vanilla monté dans un conteneur)
// ─────────────────────────────────────────────────────────
function WizardScreen({ client, project, onBack, onDone }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [catalogue, setCatalogue] = useState(null);
  const [baremesCEE, setBaremesCEE] = useState(null);

  // Étape 1 : charger le catalogue + les barèmes CEE (ne touche pas au DOM du wizard)
  useEffect(() => {
    let cancelled = false;
    Promise.all([get(ref(db, "catalogue")), get(ref(db, "crm/baremesCEE"))])
      .then(([snapCat, snapBaremes]) => {
        if (cancelled) return;
        const cat = snapCat.exists() ? snapCat.val() : [];
        if (!Array.isArray(cat) || cat.length === 0) {
          setError("Le catalogue produit est vide ou inaccessible.");
          setStatus("error");
          return;
        }
        setCatalogue(cat);
        setBaremesCEE(snapBaremes.exists() ? snapBaremes.val() : {});
        setStatus("ready");
      })
      .catch((e) => {
        if (!cancelled) {
          setError(String(e));
          setStatus("error");
        }
      });
    return () => { cancelled = true; };
  }, [client, project]);

  // Étape 2 : une fois status==='ready' ET le conteneur bien rendu à l'écran, on monte le wizard.
  useEffect(() => {
    if (status !== "ready" || !catalogue || !containerRef.current) return;
    mountWizardITE(containerRef.current, {
      catalogue,
      client,
      baremesCEE,
      onGenerate: async (payload) => {
          // payload = { missingRefs, devisSections, montantCEE, ceeInfo } fourni par le moteur
          if (payload.missingRefs && payload.missingRefs.length) {
            return { ok: false, missingRefs: payload.missingRefs };
          }
          try {
            const numeroInit = "DEV-" + String(Date.now()).slice(-6);
            const today = new Date();
            const plus30 = new Date(Date.now() + 30 * 864e5);
            const devis = JSON.parse(JSON.stringify({
              id: "d" + Date.now() + Math.random().toString(36).slice(2, 6),
              numero: numeroInit,
              date: today.toISOString().slice(0, 10),
              validite: plus30.toISOString().slice(0, 10),
              sections: payload.devisSections,
              remisePct: 0,
              cee: payload.montantCEE || 0,
              origine: "configurateur",
              updatedAt: Date.now(),
            }));

            // On ne touche QU'À ce client, fusionné avec la version la plus récente de la base
            // (plus de réécriture de toute la base → plus d'écrasement du travail des autres).
            let introuvable = false;
            let clientApres = null;
            const res = await runTransaction(ref(db, "crm/clients"), (cur) => {
              if (cur === null) return cur; // Firebase relancera avec les vraies données
              const arr = normList(cur);
              const idx = arr.findIndex((c) => c && c.id === client.id);
              if (idx === -1) { introuvable = true; return; } // annule
              introuvable = false;
              const avant = arr[idx];
              const apres = { ...avant, devis: [...normList(avant.devis), devis] };
              if (payload.ceeInfo) apres.cee = JSON.parse(JSON.stringify({ ...(avant.cee || {}), ...payload.ceeInfo }));
              clientApres = apres;
              arr[idx] = apres;
              return arr;
            });
            if (!res.committed) {
              return { ok: false, error: introuvable ? "Client introuvable (a-t-il été supprimé entre temps ?)" : "Enregistrement impossible, réessaie dans un instant." };
            }
            return { ok: true, devisNumero: numeroInit, devis, client: clientApres };
          } catch (e) {
            return { ok: false, error: String(e) };
          }
      },
      onExit: onDone,
    });
  }, [status, catalogue, baremesCEE, client, onDone]);

  if (status === "loading") return <div style={styles.centerMsg}>Chargement du catalogue produit…</div>;
  if (status === "error") return (
    <div style={styles.centerMsg}>
      ❌ {error}
      <div style={{ marginTop: 12 }}>
        <button onClick={onBack} style={styles.backBtn}>← Retour</button>
      </div>
    </div>
  );

  return <div ref={containerRef} style={{ overflow: "hidden" }} />;
}

// ─────────────────────────────────────────────────────────
// Écran 0 : accueil KORÉO
// ─────────────────────────────────────────────────────────
function Home({ onStart, user }) {
  return (
    <div style={styles.homeScreen}>
      <div style={styles.homeCenter}>
        <div style={styles.homeLogo}>KORÉO</div>
        <div style={styles.homeTitle}>Configurateur découverte</div>
        <div style={styles.homeSub}>Réalisez votre découverte chantier en présence du client, façade par façade.</div>
        {user && <div style={{ marginTop: 22, fontSize: 12, color: "#B9C9C2" }}>Connecté : {user.email} · <button onClick={() => signOut(auth)} style={{ ...styles.linkBtn, color: "#F2A900", marginTop: 0, padding: 0 }}>Se déconnecter</button></div>}
      </div>
      <button onClick={onStart} style={styles.homeBtn}>Commencer</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────
export default function App() {
  const [started, setStarted] = useState(false);
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = vérification en cours

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u || null);
    if (!u) { setStarted(false); setClient(null); setProject(null); }
  }), []);

  if (user === undefined) return <div style={styles.centerMsg}>Chargement…</div>;
  if (!user) return <Login />;
  if (!started) return <Home user={user} onStart={() => setStarted(true)} />;
  if (!client) return <ClientSearch onSelect={setClient} />;
  if (!project) return <ProjectSelect client={client} onBack={() => setClient(null)} onSelect={setProject} />;
  return (
    <WizardScreen
      client={client}
      project={project}
      onBack={() => setProject(null)}
      onDone={() => { setStarted(false); setClient(null); setProject(null); }}
    />
  );
}

const styles = {
  homeScreen: { minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", background: "#043C35", padding: "calc(40px + env(safe-area-inset-top)) 24px calc(40px + env(safe-area-inset-bottom))", boxSizing: "border-box", fontFamily: "'IBM Plex Sans', sans-serif" },
  homeCenter: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", maxWidth: 380 },
  homeLogo: { fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 34, letterSpacing: 4, color: "#fff" },
  homeTitle: { fontSize: 18, fontWeight: 600, color: "#F2E9DC", marginTop: 14 },
  homeSub: { fontSize: 14, color: "#B9C9C2", marginTop: 10, lineHeight: 1.5 },
  homeBtn: { width: "100%", maxWidth: 380, padding: "16px", fontSize: 16, fontWeight: 700, color: "#043C35", background: "#F2A900", border: "none", borderRadius: 8, cursor: "pointer" },
  screen: { maxWidth: 480, margin: "0 auto", padding: "40px 20px", fontFamily: "'IBM Plex Sans', sans-serif", minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box" },
  logo: { fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 2, color: "#0B5E43" },
  title: { fontSize: 22, fontWeight: 700, marginTop: 6, marginBottom: 4 },
  sub: { fontSize: 13, color: "#6b7280", marginBottom: 18 },
  input: { width: "100%", padding: "14px 16px", fontSize: 15, border: "1.5px solid #D4D1C8", borderRadius: 6, boxSizing: "border-box" },
  emptyMsg: { marginTop: 14, fontSize: 13, color: "#9ca3af" },
  clientBtn: { display: "block", width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8, background: "#fff", border: "1.5px solid #E1DFD9", borderRadius: 6, cursor: "pointer" },
  backBtn: { background: "none", border: "none", color: "#0B5E43", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 18 },
  projectBtn: { display: "block", width: "100%", textAlign: "left", padding: "16px", marginBottom: 10, background: "#0B5E43", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  loginInput: { width: "100%", padding: "14px 16px", fontSize: 16, border: "1.5px solid #2E5E55", borderRadius: 8, boxSizing: "border-box", background: "#0A4A42", color: "#fff", outline: "none" },
  loginErr: { marginTop: 10, fontSize: 13, color: "#FFB4A6", fontWeight: 600 },
  loginInfo: { marginTop: 10, fontSize: 13, color: "#A7E3C0", fontWeight: 600 },
  linkBtn: { background: "none", border: "none", color: "#B9C9C2", fontSize: 13, cursor: "pointer", padding: 0, marginTop: 14, textDecoration: "underline" },
  centerMsg: { minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Sans', sans-serif", padding: 20, textAlign: "center" },
};
