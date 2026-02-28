# PROYECTO_COMPLETO_GITGAME_STORE

## Briefings (enlaces a `doc/`)

- [Github_pages](https://alumno-alexandru.github.io/Proyecto_completo_DAW/)
- [Briefing_Proyecto_GitGame.pdf](doc/Briefing_Proyecto_GitGame.pdf)
- [Briefing.pdf](doc/Briefing.pdf)
- [prototype_figma.html](https://www.figma.com/proto/pAix3HYEFVA2wOPMM5SAmm/Sin-t%C3%ADtulo?node-id=0-1&t=BLaCFICshi6Jy19g-1)

Resumen breve

Este repositorio contiene el proyecto "GitGame Store" —un sitio web de ejemplo con catálogo de juegos, carrito de compras y un sistema de suscripciones— desarrollado como parte del trabajo del curso. El objetivo es ofrecer una versión completa y modular que incluya frontend (HTML/CSS/JS), lógica cliente, y módulos de backend en Python para manejar suscripciones.

Características principales

- Página principal y secciones: catálogo, favoritos, ofertas, juegos gratis.
- Sistema de suscripciones con 4 planes (Free, Pro, Premium, VIP), toggle mensual/anual y cancelación.
- Interactividad en cliente con JavaScript (manejo de UI, modales, notificaciones, localStorage).
- Módulos Python para gestión de suscripciones y pruebas unitarias.
- Estructura organizada para desarrollo y despliegue local.

Tecnologías

- HTML5 + Tailwind CSS
- JavaScript (vanilla)
- Python (módulos de negocio y tests)
- JSON para datos de ejemplo

Estructura del proyecto (resumen)

- html/
  - index.html — Página principal
  - suscripciones.html — Página de suscripciones
  - favoritos.html, juegos-gratis.html, ofertas-especiales.html, todos-los-juegos.html
- src/
  - javascript/
    - app.js — Lógica del carrito y utilidades globales
    - subscriptions.js — Lógica de la página de suscripciones (toggle, botones, modales)
    - elecciones.js, login.js, pages.js — otros scripts de navegación/UX
  - css/
    - styles.css, subscriptions.css — estilos adicionales
  - data/
    - db.json — datos de ejemplo
    - suscripciones.json — datos de planes/estado
  - python/
    - api_subscriptions.py — API de ejemplo (Flask/handler) (opcional)
    - subscriptions_manager.py — clases para gestionar suscripciones
    - test_subscriptions.py — pruebas unitarias
- doc/
  - README.md — (este archivo)
  - SUSCRIPCIONES.md — documentación detallada del sistema de suscripciones
- package.json, pnpm-lock.yaml — dependencias/gestión de frontend (si aplica)

Instalación y ejecución (local)

Requisitos mínimos

- Node.js y un gestor de paquetes si se va a usar build/tooling frontend (opcional).
- Python 3.8+ para ejecutar los scripts de backend/pruebas.

Pasos rápidos

1. Abrir el proyecto en un navegador: abrir `html/index.html` directamente (sitio estático).
2. Para desarrollo JS/CSS con herramientas (si usa npm/pnpm):

```bash
# desde la raíz del proyecto (opcional)
# instalar dependencias (si aplica)
npm install
# o
pnpm install
```

3. Ejecutar pruebas Python (virtualenv recomendado):

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
````markdown

# Resumen breve

Este repositorio contiene el proyecto "GitGame Store" —un sitio web de ejemplo con catálogo de juegos, carrito de compras y un sistema de suscripciones— desarrollado como parte del trabajo del curso. El objetivo es ofrecer una versión completa y modular que incluya frontend (HTML/CSS/JS), lógica cliente, y módulos de backend en Python para manejar suscripciones.
