# Nuxt Todo List : Dockerisation avec MySQL & Drizzle ORM

## Contexte

Application de prise de notes (todo list) développée avec **Nuxt 4**, **Drizzle ORM** et **MySQL**, conteneurisée avec Docker Compose.

## Stack technique

| Couche     | Technologie                    |
| ---------- | ------------------------------ |
| Frontend   | Nuxt 4, Vue 3, Tailwind CSS 4 |
| Backend    | Nitro (serveur Nuxt), API REST |
| ORM        | Drizzle ORM                    |
| Base de données | MySQL 8.0               |
| Conteneurisation | Docker, Docker Compose  |

## Architecture

```
┌─────────────────────────────────────────────┐
│  Docker Compose                             │
│                                             │
│  ┌──────────────┐     ┌──────────────────┐  │
│  │   app (Nuxt) │────▶│   db (MySQL 8)   │  │
│  │   :3000      │     │   :3306          │  │
│  │              │     │                  │  │
│  │  Nitro SSR   │     │                  │  │
│  │  Drizzle ORM │     │                  │  │
│  └──────────────┘     └──────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

## Lancement rapide

```bash
# 1. Cloner le projet
git clone <repo-url> && cd todo-list

# 2. Configurer les variables d'environnement
cp .env.example .env

# 3. Lancer les conteneurs
docker compose up --build

# 4. Accéder à l'application
# http://localhost:3000
```

## Scripts utiles

| Commande            | Description                                    |
| ------------------- | ---------------------------------------------- |
| `docker compose up --build` | Build + lancement des conteneurs       |
| `docker compose down -v`    | Arrêt + suppression des volumes (reset DB) |
| `yarn db:generate`  | Génère les fichiers de migration Drizzle       |
| `yarn db:migrate`   | Applique les migrations sur la DB              |
| `yarn dev`          | Lancement en mode développement local          |

## Problèmes rencontrés & solutions

### 1. `yarn install` échoue dans Docker - version Node incompatible

**Symptôme** : Le build Docker échoue à l'étape `RUN yarn install`
```
error rollup-plugin-visualizer@6.0.8: The engine "node" is incompatible
with this module. Expected version ">=22". Got "20.20.0"
```
**Cause** : L'image `node:18-alpine` puis `node:20-alpine` ne satisfaisait pas la contrainte `>=22` de certaines dépendances.

**Solution** : Passage à `node:22-alpine` (version LTS compatible avec toutes les dépendances).

---

### 2. `Cannot find module '/app/.output/server/index.mjs'`

**Symptôme** : Le conteneur crash au démarrage avec `MODULE_NOT_FOUND`.

**Cause** : Le `compose.yaml` montait un volume bind (`.:/app`) qui écrasait le contenu du conteneur (y compris le dossier `.output/` généré par `nuxt build`) avec les fichiers locaux où `.output/` n'existait pas.

**Solution** : Passage à un **multi-stage build** en production - le `CMD` lance directement `node ./output/server/index.mjs` sans volume bind, et le build est fait dans un stage séparé.

---

### 3. `File URL path must be absolute` au démarrage

**Symptôme** : Page d'erreur Nuxt avec le message "File URL path must be absolute".

**Cause** : Les variables d'environnement n'étaient pas transmises au conteneur `app`. `useRuntimeConfig()` retournait `undefined` pour les credentials de la DB, et `mysql2` crashait en essayant de parser une URL vide.

**Solution** : Ajout des variables `NUXT_DB_HOST`, `NUXT_DB_PORT`, etc. dans le `compose.yaml`. Nuxt en production mappe les variables préfixées par `NUXT_` vers le `runtimeConfig` (ex: `NUXT_DB_HOST` → `runtimeConfig.dbHost`).

---

### 4. `Access denied for user '<user>'@'%' to database '<db_name>'`

**Symptôme** : Erreur MySQL `ER_DBACCESS_DENIED_ERROR` à chaque requête API.

**Cause** : Dans le `compose.yaml`, `MYSQL_DATABASE` référençait `${DB_DATABASE}` qui n'existait pas dans le `.env` (la variable s'appelait `DB_NAME`). MySQL ne créait donc pas la base de données, et l'utilisateur n'avait aucun droit.

**Solution** : Correction de `${DB_DATABASE}` → `${DB_NAME}` + suppression du volume (`docker compose down -v`) pour réinitialiser MySQL.

---

### 5. `ECONNREFUSED` - L'app démarre avant MySQL

**Symptôme** : Le plugin de migration Drizzle échoue avec `connect ECONNREFUSED` au démarrage.

**Cause** : Malgré le `depends_on` avec `condition: service_healthy`, le healthcheck (`mysqladmin ping`) retourne OK avant que MySQL ait fini son initialisation complète (création de la base, de l'utilisateur, etc.).

**Solution** : Ajout d'un mécanisme de **retry avec backoff** dans le plugin de migration (`server/plugins/migrate.ts`) - 10 tentatives espacées de 3 secondes.

---

### 6. `Table '<db_name>.todos' doesn't exist`

**Symptôme** : Les requêtes API retournent une erreur car la table `todos` n'existe pas.

**Cause** : Drizzle ORM ne crée pas les tables automatiquement. Le schéma TypeScript (`server/db/schema.ts`) sert uniquement au query builder, pas à la création des tables.

**Solution** : Mise en place du système de **migrations Drizzle** :
- `yarn db:generate` génère les fichiers SQL de migration (commitées dans git)
- Un plugin Nitro (`server/plugins/migrate.ts`) applique les migrations automatiquement au démarrage du serveur

---

### 7. Hot-reload inopérant dans Docker

**Symptôme** : Les modifications de fichiers ne sont pas détectées dans le conteneur Docker.

**Cause** : Le filesystem Docker (volume bind mount) ne supporte pas les events `inotify` utilisés par Vite pour détecter les changements.

**Solution** : Activation du polling dans `nuxt.config.ts` :
```ts
vite: {
  server: {
    watch: { usePolling: true }
  }
}
```

## Ce que j'ai appris

- **Les variables d'environnement Nuxt en production** sont préfixées par `NUXT_` et mappées automatiquement vers `runtimeConfig`
- **`127.0.0.1` dans Docker** pointe vers le conteneur lui-même, pas vers la machine hôte - utiliser `host.docker.internal` ou le nom du service (`db`)
- **Le healthcheck ne suffit pas** à garantir que MySQL est prêt - un retry applicatif est nécessaire
- **Drizzle ORM ne crée pas les tables** - il faut un système de migrations explicite
- **Le multi-stage build** permet de produire des images légères en ne copiant que le build final
- **`nuxt.config.ts` n'est pas hot-reloadé** - il faut relancer le serveur après chaque modification
