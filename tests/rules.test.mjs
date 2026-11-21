/* Testes das regras do Firestore (versão pública). Rodam no Firebase Emulator.
   Como rodar (precisa de Node 18+ e Java 11+):
     npm i -D firebase-tools @firebase/rules-unit-testing firebase
     npx firebase emulators:exec --only firestore --project demo-expedicoes "node tests/rules.test.mjs"
*/
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, collection, query, where, getDocs, serverTimestamp, increment } from "firebase/firestore";

const env = await initializeTestEnvironment({ projectId: "demo-expedicoes", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
const anon = env.authenticatedContext("anon1", { firebase: { sign_in_provider: "anonymous", identities: {} } }).firestore();
const goog = env.authenticatedContext("g1", { firebase: { sign_in_provider: "google.com", identities: { "google.com": ["123"] } } }).firestore();
const adult = env.authenticatedContext("g2", { ageVerified: true, firebase: { sign_in_provider: "google.com", identities: { "google.com": ["456"] } } }).firestore();
const other = env.authenticatedContext("o1", { firebase: { sign_in_provider: "anonymous", identities: {} } }).firestore();
const guest = env.unauthenticatedContext().firestore();
const pub = { v: 2, kind: "mission", nick: "Ana", pet: "surucua", xp: 50, claps: 0, missionId: "cheirin" };
let n = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); n++; console.log("ok  ", name); } catch (e) { fail++; console.log("FALHOU", name, e.message); } };

async function publish(db, uid, pid, withStats) {
  const b = writeBatch(db);
  b.set(doc(db, "users/" + uid), { nick: "Ana", lastPostAt: serverTimestamp(), lastPostId: pid }, { merge: true });
  b.set(doc(db, "posts/" + pid), Object.assign({ createdAt: serverTimestamp() }, pub));
  b.set(doc(db, "posts_private/" + pid), { uid, createdAt: serverTimestamp(), route: [1, 2, 3, 4] });
  if (withStats) b.update(doc(db, "stats/city"), { photos: increment(1) });
  return b.commit();
}
await env.withSecurityRulesDisabled(async c => {
  const db = c.firestore();
  await setDoc(doc(db, "stats/city"), { photos: 0 });
  await setDoc(doc(db, "posts/OLDPOST1"), { uid: "anon1", kind: "mission", nick: "Velho", pet: "surucua", xp: 10, claps: 0, photo: "x", createdAt: 1 });
});

await t("visitante sem login não lê posts", () => assertFails(getDocs(collection(guest, "posts"))));
await t("conta anônima não publica", () => assertFails(publish(anon, "anon1", "AAAAAA1", false)));
await t("Google sem idade verificada não publica", () => assertFails(publish(goog, "g1", "BBBBBB1", false)));
await t("cliente não grava lastPostAt sem permissão", () => assertFails(setDoc(doc(goog, "users/g1"), { nick: "Ana", lastPostAt: serverTimestamp() })));
await t("Google + ageVerified publica (com contador)", () => assertSucceeds(publish(adult, "g2", "CCCCCC1", true)));
await t("contador não sobe sem post novo", () => assertFails((() => { const b = writeBatch(adult); b.set(doc(adult, "users/g2"), { nick: "Ana", lastPostAt: serverTimestamp(), lastPostId: "CCCCCC1" }, { merge: true }); b.update(doc(adult, "stats/city"), { photos: increment(1) }); return b.commit(); })()));
await t("post público com foto/uid é recusado", () => assertFails((() => { const b = writeBatch(adult); b.set(doc(adult, "users/g2"), { nick: "Ana", lastPostAt: serverTimestamp(), lastPostId: "DDDDDD1" }, { merge: true }); b.set(doc(adult, "posts/DDDDDD1"), Object.assign({ createdAt: serverTimestamp(), uid: "g2" }, pub)); b.set(doc(adult, "posts_private/DDDDDD1"), { uid: "g2", createdAt: serverTimestamp() }); return b.commit(); })()));
await t("feed fechado: outra pessoa não lê post novo", () => assertFails(getDoc(doc(other, "posts/CCCCCC1"))));
await t("dono lê o próprio post e a parte privada", async () => { await assertSucceeds(getDoc(doc(adult, "posts/CCCCCC1"))); await assertSucceeds(getDocs(query(collection(adult, "posts_private"), where("uid", "==", "g2")))); });
await t("outra pessoa não lê a parte privada", () => assertFails(getDoc(doc(other, "posts_private/CCCCCC1"))));
await t("post antigo: só o dono lê", async () => { await assertFails(getDoc(doc(other, "posts/OLDPOST1"))); await assertSucceeds(getDocs(query(collection(anon, "posts"), where("uid", "==", "anon1")))); });
await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), "config/public"), { feedOpen: true }));
await t("feed aberto: lê posts v2", () => assertSucceeds(getDocs(query(collection(other, "posts"), where("v", "==", 2)))));
await t("feed aberto: post antigo continua fechado", () => assertFails(getDoc(doc(other, "posts/OLDPOST1"))));
await t("feed aberto: aplaudir funciona", () => { const b = writeBatch(other); b.update(doc(other, "posts/CCCCCC1"), { claps: increment(1) }); b.set(doc(other, "posts/CCCCCC1/claps/o1"), { at: serverTimestamp() }); return assertSucceeds(b.commit()); });
await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), "config/public"), { feedOpen: false }));
await t("dono apaga aplausos, parte privada e post (mesmo sem poder publicar)", async () => {
  await assertSucceeds(deleteDoc(doc(adult, "posts/CCCCCC1/claps/o1")));
  const b = writeBatch(adult); b.delete(doc(adult, "posts_private/CCCCCC1")); b.delete(doc(adult, "posts/CCCCCC1")); await assertSucceeds(b.commit()); });
await t("dono apaga post antigo", () => assertSucceeds(deleteDoc(doc(anon, "posts/OLDPOST1"))));
await t("conta anônima não marca lugar", () => assertFails(setDoc(doc(anon, "places/PLACE01"), { uid: "anon1", nick: "Ana", name: "Praça", type: "praca", lat: -22.4, lng: -43.4, confirms: 1, createdAt: serverTimestamp() })));
await t("ninguém grava config/public pelo app", () => assertFails(setDoc(doc(adult, "config/public"), { feedOpen: true })));
await t("perfil próprio pode ser apagado", () => assertSucceeds(deleteDoc(doc(adult, "users/g2"))));
await env.cleanup();
console.log(`\n${n} passaram, ${fail} falharam`); process.exit(fail ? 1 : 0);
