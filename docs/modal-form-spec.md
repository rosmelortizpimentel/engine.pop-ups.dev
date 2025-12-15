# Formulario de Modal - Especificación Técnica

Este documento define la estructura del formulario para crear popups tipo Modal.

---

## 📦 CARD 1: CONFIGURACIÓN GENERAL
*Compartida con Banner*

| Campo | Tipo | Valores | JSON Path |
|-------|------|---------|-----------|
| Nombre del popup | Input text | - | `name` (solo portal) |
| Estado | Toggle | Activo/Inactivo | `status` (solo portal) |
| Tipo de layout | Button group | `modal` / `top_bar` | `type` |

---

## 📦 CARD 2: CONTENIDO DE TEXTO

| Campo | Tipo | Valores | JSON Path |
|-------|------|---------|-----------|
| Título | Input text | - | `content.headline.text` |
| Color título | Color picker + hex input | - | `content.headline.style.color` |
| Subtítulo | Textarea | - | `content.body.text` |
| Color subtítulo | Color picker + hex input | - | `content.body.style.color` |

---

## 📦 CARD 3: ESTRUCTURA Y ESTILO

| Campo | Tipo | Valores | JSON Path |
|-------|------|---------|-----------|
| Tamaño | Select | `small`, `medium`, `large` | `size` |
| Botón cerrar (X) | Toggle | true/false | `showCloseButton` |
| Cerrar al click overlay | Toggle | true/false | `closeOnOverlay` |
| Font Family | Select | Ver opciones abajo | `style.fontFamily` |
| Color de fondo | Color picker + hex | - | `style.backgroundColor` |
| Border radius | Input text | ej: `16px` | `style.borderRadius` |

### Opciones para Tamaño:
```
small   → Pequeño (360px)
medium  → Mediano (480px)
large   → Grande (600px)
```

### Opciones para Font Family:
```
Inter
Roboto
Lato
Poppins
Open Sans
```

---

## 📦 CARD 4: IMAGEN

| Campo | Tipo | Valores | JSON Path |
|-------|------|---------|-----------|
| URL de imagen | Input URL | - | `content.image.url` |
| Posición | Select | Ver opciones | `content.image.position` |
| Alto de imagen | Input number + "px" | ej: 180 | `content.image.height` |

### Opciones para Posición de Imagen:
```
top        → Arriba (imagen sobre el contenido)
left       → Izquierda (imagen al lado izquierdo)
right      → Derecha (imagen al lado derecho)
background → Fondo (imagen como fondo del modal)
```

---

## 📦 CARD 5: FEATURES (Lista de beneficios)

Repeater dinámico con máximo 5 items.

| Campo | Tipo | JSON Path |
|-------|------|-----------|
| Icono | Input text (default: ✓) | `content.features[n].icon` |
| Texto | Input text | `content.features[n].text` |

**Acciones:**
- Botón "+ Agregar feature"
- Botón "×" para eliminar cada item

---

## 📦 CARD 6: BOTONES (máx 3)

Repeater con máximo 3 botones.

| Campo | Tipo | Valores | JSON Path |
|-------|------|---------|-----------|
| Texto | Input text | - | `buttons[n].text` |
| Acción | Select | Ver opciones | `buttons[n].action` |
| URL/Ruta | Input text | (solo si action=link) | `buttons[n].url` |
| Color fondo | Color picker | - | `buttons[n].style.backgroundColor` |
| Color texto | Color picker | - | `buttons[n].style.textColor` |
| Border radius | Input text | ej: `8px` | `buttons[n].style.borderRadius` |

### Opciones para Acción:
```
close → Cerrar (cierra el modal)
link  → Link (navega a URL)
```

---

## 📦 CARD 7: FOOTER

| Campo | Tipo | JSON Path |
|-------|------|-----------|
| Texto | Input text | `footer.text` |
| Link 1 - Texto | Input text | `footer.links[0].text` |
| Link 1 - URL | Input text | `footer.links[0].url` |
| Link 2 - Texto | Input text | `footer.links[1].text` |
| Link 2 - URL | Input text | `footer.links[1].url` |

---

## Constantes JavaScript para Selects

```javascript
const SIZE_OPTIONS = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' }
];

const IMAGE_POSITION_OPTIONS = [
  { value: 'top', label: 'Arriba' },
  { value: 'left', label: 'Izquierda' },
  { value: 'right', label: 'Derecha' },
  { value: 'background', label: 'Fondo' }
];

const BUTTON_ACTION_OPTIONS = [
  { value: 'close', label: 'Cerrar' },
  { value: 'link', label: 'Link' }
];

const INPUT_TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Texto' },
  { value: 'phone', label: 'Teléfono' }
];

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Open Sans', label: 'Open Sans' }
];
```

---

## JSON Output Completo

```json
{
  "type": "modal",
  "size": "medium",
  "showCloseButton": true,
  "closeOnOverlay": true,
  "content": {
    "headline": {
      "text": "",
      "style": { "color": "#1a1a1a" }
    },
    "body": {
      "text": "",
      "style": { "color": "#666666" }
    },
    "image": {
      "url": "",
      "position": "top",
      "height": "180px"
    },
    "features": [
      { "icon": "✓", "text": "" }
    ],
    "input": {
      "enabled": false,
      "type": "email",
      "placeholder": ""
    }
  },
  "buttons": [
    {
      "text": "",
      "action": "close",
      "url": "",
      "style": {
        "backgroundColor": "#3b82f6",
        "textColor": "#ffffff",
        "borderRadius": "8px"
      }
    }
  ],
  "footer": {
    "text": "",
    "links": [
      { "text": "", "url": "" },
      { "text": "", "url": "" }
    ]
  },
  "style": {
    "backgroundColor": "#ffffff",
    "fontFamily": "Inter",
    "borderRadius": "16px"
  }
}
```
