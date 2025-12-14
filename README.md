# Toggleup.io Engine

SDK embebible para mostrar popups en sitios de clientes.

## Estructura Versionada

```
src/
├── v1/               # SDK versión 1 (estable)
│   ├── sdk/          # Entry point y lógica de triggers
│   └── engine/       # Componentes de renderizado (Preact)
├── v2/               # Futuro: copiar v1, modificar sin breaking changes
└── shared/           # Código compartido (opcional)

dist/
├── v1/sdk.js         # Build: cdn.toggleup.io/v1/sdk.js
└── v2/sdk.js         # Futuro
```

## Uso

### Embed Script (para clientes)

```html
<!-- Producción: versión fija -->
<script src="https://cdn.toggleup.io/v1/sdk.js" data-api-key="TU_API_KEY"></script>

<!-- Desarrollo: última versión -->
<script src="https://cdn.toggleup.io/latest/sdk.js" data-api-key="TU_API_KEY"></script>
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build:v1` | Compilar SDK v1 |
| `npm run build:all` | Compilar todas las versiones |

## Crear nueva versión (v2, v3...)

1. Copiar carpeta: `cp -r src/v1 src/v2`
2. Crear config: `cp vite.config.v1.js vite.config.v2.js`
3. Actualizar entry en vite.config.v2.js: `'src/v2/sdk/index.js'`
4. Agregar script en package.json: `"build:v2": "vite build --config vite.config.v2.js"`
5. Actualizar build:all: `"build:all": "npm run build:v1 && npm run build:v2"`
6. Modificar v2 sin tocar v1

## Despliegue

El proyecto se despliega en **Vercel** como `cdn.toggleup.io`:
- `/v1/sdk.js` → SDK versión 1
- `/latest/sdk.js` → Alias a la última versión estable
