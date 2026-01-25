# Control horari

Aplicació web personal per portar el **control horari** (jornades, bossa de flexibilitat, vacances i assumptes personals) per a personal d’educació.  
Funciona **100% al navegador** (sense servidor) i es pot desplegar fàcilment a **GitHub Pages**.

> ✅ **App (Vercel)**: https://control-horari-educacio.vercel.app/  
> 🌐 **App (GitHub Pages)**: https://rbarrachina.github.io/control-horari-educacio/

---

## ✅ Estat del projecte

Aplicació **operativa** amb configuració inicial guiada i calendari interactiu per a l’any seleccionat (per defecte **2026**)....
Aquest README explica:

- què fa l’app 🎯
- com executar-la en local 🧪
- com publicar-la 🚀
- on guarda les dades 🔐

---

## ✨ Funcionalitats actuals

**Objectiu:** tenir una eina personal, ràpida i privada per controlar el còmput d’hores i incidències.

**Inclou actualment:**

- Assistència d’onboarding amb configuració guiada (Personal → Horari → Festius)
- Configuració personal (nom, any de calendari, dies de vacances, hores d’AP)
- Definició de dies **presencials** i de **teletreball** per setmana
- Franges **estiu/hivern** amb períodes configurables que cobreixen tot l’any
- Calendari anual amb detall per dia (inici/fi, doble torn, notes)
- Estats de dia: laboral, festiu, vacances, assumptes propis, flexibilitat i altres
- Resums setmanals amb còmput d’hores i flexibilitat guanyada
- Gestió de **flexibilitat** (acumulada fins a 25h) i consum per dia
- Exportació / importació (JSON) i **reset** complet de dades

---

## 🧱 Tecnologies

- Vite + React + TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI
- TanStack Query + React Router

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
npm run test      # executa tests amb Vitest
```

---

## 🔐 On es guarden les dades?

L’aplicació **guarda la informació al navegador** (sense backend), via **localStorage**.

Claus utilitzades:

- `control-horari-config`
- `control-horari-days`
- `control-horari-onboarding-step`

### Què implica això?
- ✅ Les dades queden **al teu dispositiu** i al **perfil** del navegador
- ⚠️ Si canvies d’ordinador o de perfil, **no hi seran** (a menys que exportis/importis)

### Com comprovar-ho (Brave / Chrome)
1. Obre l’app
2. Fes clic dret → **Inspecciona**
3. Ves a **Application**
4. Mira:
   - **Local Storage** → `https://control-horari-educacio.vercel.app`
   - **IndexedDB** *(no s’utilitza actualment)*
   - **Session Storage**

---

## 🌍 Desplegament

### Opció A — GitHub Pages (Vite) ✅

El projecte ja té configurat el `base` per GitHub Pages segons el mode de build.

```bash
npm run build:gh
```

Això crea `dist/` amb `base` apuntant a `/control-horari-educacio/`.

Després, a **Settings → Pages**:
- **Build and deployment**: “GitHub Actions”
- Deploy de `dist/`

> Si el teu Pages ja funciona, genial 🙌 Si mai torna a fallar, revisa que la build s’hagi fet amb `build:gh`.

---

## 🤝 Contribuir

Issues i PRs són benvinguts. Si obres un PR, explica:
- què resol
- com provar-ho
- captures (si afecta UI)

---

## 🧾 Llicència i atribució

Aquest projecte es distribueix sota la **Apache License 2.0**.

- Llicència: `LICENSE` (Apache-2.0)
- Atribució: `NOTICE` (crèdits i avisos)

Autoria: **Rafa Barrachina** (GitHub: `@rbarrachina`)

Si redistribueixes el projecte (o una derivació), cal conservar aquests avisos i el crèdit de l’autor.
