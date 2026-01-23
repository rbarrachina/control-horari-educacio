# Control horari Educació

Aplicació web personal per portar el **control horari** (jornades, bossa de flexibilitat, vacances i assumptes personals) **a partir de dades d’ATRI**.  
Funciona **100% al navegador** (sense servidor) i es pot desplegar fàcilment a **GitHub Pages** o publicar des de **Lovable**.

> 🧩 **App (Lovable)**: https://control-horari-educacio.lovable.app/  
> 🌐 **Demo (GitHub Pages)**: https://rbarrachina.github.io/control-horari-educacio/ *(si està desplegat)*

---

## ✅ Estat del projecte

Ara mateix el projecte està en fase **MVP / TODO** (pendent d’acabar i polir funcionalitats).  
Aquest README deixa clar:

- què vol ser l’app 🎯
- com executar-la en local 🧪
- com publicar-la 🚀
- on guarda les dades 🔐

---

## ✨ Objectiu i funcionalitats (roadmap)

**Objectiu:** tenir una eina personal, ràpida i privada per controlar el còmput d’hores.

Funcionalitats previstes (a completar):

- Configuració de l’usuari (nom/cognom, dies de vacances, hores d’assumptes personals)
- Definició de dies **presencials** i de **teletreball** (dl–dv)
- Gestió de la **flexibilitat horària** (0–25 h)
- Registre de jornades amb càlculs automàtics
- Exportació / importació (JSON) per moure dades entre navegadors

> Quan l’app estigui més avançada, podem marcar què està **✅ fet**, **🧪 en proves** i **🛠️ pendent**.

---

## 🧱 Tecnologies

- Vite + React + TypeScript
- Tailwind CSS
- (Opcional) components UI (p. ex. shadcn/ui)

---

## 🚀 Com començar (local)

Requisits: **Node.js** (recomanat via nvm)

```bash
# 1) Clona el repositori
git clone <URL_DEL_REPO>

# 2) Entra a la carpeta
cd <NOM_CARPETA>

# 3) Instal·la dependències
npm install

# 4) Engega el servidor de desenvolupament
npm run dev
```

Altres scripts útils:

```bash
npm run build     # genera /dist
npm run preview   # previsualitza el build localment
```

---

## 🔎 Com provar un PR a GitHub (preview abans del merge)

Si obres un **Pull Request**, hi ha un workflow que genera una **preview de GitHub Pages** per comprovar els canvis sense fer merge.

### Passos ràpids
1. Obre o actualitza el PR.
2. Ves a la pestanya **Actions** del repositori.
3. Obre el workflow **“Preview Vite on GitHub Pages (PR)”**.
4. A l’execució del job **deploy**, trobaràs un enllaç **“View deployment”** amb la URL de la preview.

### Què pots fer per provar-ho ràpid
- Fes un canvi petit (p. ex. en un text de la UI).
- Obre un PR amb aquest canvi.
- Espera que el workflow acabi i obre la URL de preview.

---

## 🔐 On es guarden les dades?

L’aplicació **guarda la informació al navegador** (sense backend).  
A la pràctica, això acostuma a ser **Local Storage** o **IndexedDB** (depèn de com estigui implementat).

### Què implica això?
- ✅ Les dades queden **al teu dispositiu** i al **perfil** del navegador
- ⚠️ Si canvies d’ordinador o de perfil, **no hi seran** (a menys que exportis/importis)

### Com comprovar-ho (Brave / Chrome)
1. Obre l’app
2. Fes clic dret → **Inspecciona**
3. Ves a **Application**
4. Mira:
   - **Local Storage** → `https://control-horari-educacio.lovable.app`
   - **IndexedDB**
   - **Session Storage**

Si vols, després podem documentar aquí les **claus exactes** (keys) quan sàpigues quines són.

---

## 🌍 Desplegament

### Opció A — Publicar des de Lovable
A Lovable: **Share → Publish**.

### Opció B — GitHub Pages (Vite) ✅

Com que és Vite, cal tenir en compte el **base path** (si publiques a `https://usuari.github.io/nom-repo/`).

#### 1) Configura el `base` a `vite.config.ts`
Si el repo es diu `control-horari-educacio`:

```ts
export default defineConfig({
  base: "/control-horari-educacio/",
});
```

#### 2) Build
```bash
npm run build
```
Això crea la carpeta `dist/`.

#### 3) Deploy amb GitHub Actions
A **Settings → Pages**:
- **Build and deployment**: “GitHub Actions”

I usa un workflow que desplegui `dist/` a Pages.

> Si el teu Pages ja funciona, genial 🙌 Si mai torna a fallar, normalment és per `base` o per la configuració de Pages.

---

## 📸 Captures
*(pendent)*

---

## 🤝 Contribuir
Issues i PRs són benvinguts. Si obres un PR, explica:
- què resol
- com provar-ho
- captures (si afecta UI)

## 🧾 Llicència i atribució

Aquest projecte es distribueix sota la **Apache License 2.0**.

- Llicència: `LICENSE` (Apache-2.0)
- Atribució: `NOTICE` (crèdits i avisos)

Autoria: **Rafa Barrachina** (GitHub: `@rbarrachina`)

Si redistribueixes el projecte (o una derivació), cal conservar aquests avisos i el crèdit de l’autor.
