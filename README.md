# PROYECTO_COMPLETO_GITGAME_STORE

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
pip install -r src/python/requirements.txt
python -m pytest src/python/test_subscriptions.py
```

Uso

- Abrir la página de suscripciones: `html/suscripciones.html`.
- Cambiar entre mensual/anual con el toggle.
- Hacer clic en "Actualizar Ahora" para cambiar de plan; el sistema aplica el cambio localmente y muestra notificaciones.
- Para cancelar un plan pago, usar el botón "Cancelar Suscripción" y confirmar en el modal.

Notas de desarrollo

- Los datos de ejemplo y estado se almacenan en archivos JSON dentro de `src/data/` y/o en `localStorage` según la implementación.
- El backend Python incluido es de ejemplo/educativo; para producción integrar servicios reales y persistencia.

Tests

- Hay pruebas básicas en `src/python/test_subscriptions.py` que verifican la lógica de `subscriptions_manager.py`.
- Ejecutar con `pytest` como se indica en la sección anterior.

Siguientes pasos recomendados

- Integrar un backend real (Flask/FastAPI) y una base de datos para persistencia.
- Añadir autenticación de usuarios para vincular suscripciones a cuentas.
- Integrar pasarela de pago (Stripe/PayPal) si se activa el pago real.

Contribuciones

Se aceptan PRs con mejoras: por favor crea una rama, añade tests cuando corresponda y abre un PR con descripción clara.

Licencia

Incluye una licencia MIT por defecto (añadir fichero LICENSE si se desea).

Contacto

Autor / Mantenimiento: ver información del repositorio o contactar al responsable del curso/proyecto.
