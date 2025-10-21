# The Elder Cards FRONTEND

> **Plataforma web para crear, coleccionar y compartir cartas personalizadas inspiradas en universos fantásticos.**

---

## Índice

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura y Componentes](#arquitectura-y-componentes)
- [Rutas y Navegación](#rutas-y-navegación)
- [Gestión de Estado y Contextos](#gestión-de-estado-y-contextos)
- [Estilos y UI](#estilos-y-ui)
- [Buenas Prácticas y Seguridad](#buenas-prácticas-y-seguridad)
- [Check de Requerimientos](#check-de-requerimientos)
- [Licencia y Reconocimientos](#licencia-y-reconocimientos)

---

## Descripción General

**The Elder Cards FRONTEND** es una aplicación web desarrollada con React y TypeScript, que permite a los usuarios crear cartas personalizadas, organizarlas en colecciones, interactuar con otros usuarios, explorar facciones, criaturas y artefactos, y disfrutar de una experiencia social y creativa. El proyecto está inspirado en universos como The Elder Scrolls, pero es completamente gratuito y sin ánimo de lucro.

---

## Características Principales

- **Creación de cartas**: Generador visual de cartas con campos personalizables, imágenes y estadísticas.
- **Colecciones**: Organización de cartas en sets temáticos, públicos o privados.
- **Facciones**: Descubre y crea facciones con historia, territorio y color propio.
- **Bestiario**: Explora criaturas y artefactos con información detallada y hechizos asociados.
- **Sistema de amigos**: Envía solicitudes, acepta, bloquea y gestiona tu red de amistades.
- **Mensajería privada**: Chat en tiempo real entre usuarios.
- **Notificaciones**: Sistema de toasts y paneles para avisos de amistad y mensajes.
- **Autenticación y perfil**: Registro, login, edición de perfil, cambio de imagen y eliminación de cuenta.
- **Filtros y búsqueda avanzada**: Filtra cartas y colecciones por múltiples criterios.
- **Interacciones sociales**: Likes, favoritos y comentarios en cartas y colecciones.
- **Paneles administrativos**: Funcionalidades avanzadas para administradores (gestión de facciones, bestiario, etc).

---

## Tecnologías Utilizadas

- **Node.js** (Backend)
- **React 18** (Frontend)
- **TypeScript**
- **Vite**
- **TailwindCSS**
- **Axios**
- **Socket.io-client**
- **React Router DOM**
- **ESLint**
- **PostCSS/Autoprefixer**
- **Otras librerías opcionales y recomendadas**

---

## Instalación y Configuración

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/EthanCarranza/The-Elder-Cards-FRONTEND.git
   cd The-Elder-Cards-FRONTEND
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   - Crea un archivo `.env` si necesitas personalizar la URL de la API:
     ```env
     VITE_API_URL=http://localhost:3000/api/v1
     ```

4. **Ejecuta el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

5. **Compila para producción:**

   ```bash
   npm run build
   ```

6. **Previsualiza el build:**
   ```bash
   npm run preview
   ```

---

## Estructura del Proyecto

```
The-Elder-Cards-FRONTEND/
├── src/
│   ├── Components/        # Componentes React (UI, páginas, paneles)
│   ├── contexts/          # Contextos para gestión de estado global
│   ├── hooks/             # Custom hooks (autenticación, notificaciones)
│   ├── constants/         # Constantes globales (tipos de carta, usuario)
│   ├── utils/             # Utilidades (canvas, errores, helpers)
│   ├── assets/            # Imágenes, fuentes, recursos estáticos
│   ├── index.css          # Estilos globales
│   ├── App.tsx            # Componente raíz y rutas
│   └── main.tsx           # Entry point
├── public/                # Archivos públicos y fuentes
├── package.json           # Dependencias y scripts
├── tailwind.config.js     # Configuración Tailwind
├── vite.config.ts         # Configuración Vite
├── tsconfig*.json         # Configuración TypeScript
└── README.md              # Documentación
```

---

## Arquitectura y Componentes

### Componentes Principales

- **Landing**: Página de bienvenida, explicación del proyecto y acceso rápido a registro/login.
- **Cards / CardDetail / CreateCard**: Listado, detalle y creación de cartas. Filtros avanzados, paginación y edición.
- **Collections / CollectionDetail**: Gestión de colecciones, creación, edición, favoritos y likes.
- **Factions / FactionDetail / EditFactionForm**: Descubre, crea y edita facciones con historia y color.
- **Bestiary**: Explora criaturas y artefactos, con panel de hechizos y carga masiva (admin).
- **Friends**: Panel de amigos, solicitudes, bloqueos y búsqueda avanzada.
- **Messages**: Chat privado entre usuarios, con notificaciones y estado de amistad.
- **Profile / UserPublicProfile**: Edición de perfil, imagen, contraseña y eliminación de cuenta.
- **Rules / Terms**: Páginas informativas sobre reglas y términos legales.
- **Navbar / Footer / PageLayout**: Estructura general y navegación.
- **FloatingToast / FriendshipToastContainer**: Sistema de notificaciones visuales.

### Contextos y Hooks

- **AuthContext**: Estado global de autenticación y usuario.
- **FriendshipNotificationsContext**: Notificaciones de amistad.
- **MessageNotificationsContext**: Notificaciones de mensajes.
- **SocketNotificationListener**: Escucha eventos en tiempo real.
- **Custom Hooks**: `useAuth`, `useFriendshipNotifications`, `useMessageNotifications`, etc.

### Utilidades

- **card3d.ts / cardCanvas.ts**: Renderizado visual y efectos 3D para cartas.
- **errors.ts**: Extracción y manejo de errores de API.

---

## Rutas y Navegación

La aplicación utiliza React Router para navegación SPA. Algunas rutas principales:

| Ruta                | Componente        | Descripción                         |
| ------------------- | ----------------- | ----------------------------------- |
| `/`                 | Landing           | Página principal                    |
| `/register`         | Register          | Registro de usuario                 |
| `/login`            | Login             | Inicio de sesión                    |
| `/profile`          | Profile           | Perfil y edición                    |
| `/profile/:userId`  | UserPublicProfile | Perfil público de usuario           |
| `/cards`            | Cards             | Listado de cartas                   |
| `/cards/:id`        | CardDetail        | Detalle de carta                    |
| `/collections`      | Collections       | Listado de colecciones              |
| `/collections/:id`  | CollectionDetail  | Detalle de colección                |
| `/factions`         | Factions          | Listado de facciones                |
| `/factions/:id`     | FactionDetail     | Detalle de facción                  |
| `/bestiary`         | Bestiary          | Bestiario de criaturas y artefactos |
| `/friends`          | Friends           | Panel de amigos                     |
| `/messages`         | Messages          | Mensajes privados                   |
| `/messages/:userId` | Messages          | Chat con usuario específico         |
| `/rules`            | Rules             | Reglas de la plataforma             |
| `/terms`            | Terms             | Términos y condiciones              |

---

## Gestión de Estado y Contextos

- **Autenticación**: Persistencia de sesión, token JWT, roles y datos de usuario.
- **Notificaciones**: Contextos para avisos de amistad y mensajes, con integración de Socket.io.
- **Interacciones**: Estado local para likes, favoritos, filtros y paginación.
- **Administración**: Paneles y formularios protegidos por rol de administrador.

---

## Estilos y UI

- **TailwindCSS**: Utilizado para toda la interfaz, permitiendo diseño responsivo, moderno y personalizable.
- **Componentes reutilizables**: Inputs, botones, toasts, paneles y layouts.
- **Accesibilidad**: Navegación por teclado, etiquetas ARIA y feedback visual.
- **Temas y colores**: Inspirados en universos fantásticos, con opción de personalización en facciones y cartas.

---

## Buenas Prácticas y Seguridad

- **Validación de formularios**: Reglas estrictas para registro, login y edición de datos.
- **Gestión de errores**: Mensajes claros y manejo robusto de fallos de API.
- **Protección de rutas**: Acceso restringido a paneles según rol y autenticación.
- **Subida de archivos**: Validación de imágenes y formatos permitidos.
- **Privacidad**: Opciones para colecciones privadas y bloqueo de usuarios.
- **Cumplimiento legal**: Respeto por derechos de autor y marcas (ver [Términos](#licencia-y-reconocimientos)).

---

## Check de Requerimientos

Este proyecto cumple con todos los requisitos del último proyecto FullStack del curso:

- [x] Proyecto con sentido, resuelve un problema y está enfocado a un público concreto.
- [x] Temática libre, con lógica y buen UX/UI.
- [x] Utiliza **Node.js** en el backend y **React** en el frontend.
- [x] Uso opcional y recomendado de librerías vistas en el curso y otras nuevas (puntuable).
- [x] Arquitectura clara y estructurada, fácil de entender para cualquier persona.
- [x] Base de datos inicial generada a partir de un Excel con mínimo 100 datos y 2/3 colecciones relacionadas entre sí.
- [x] Lectura/escritura de archivos con Node.js (`fs`) para extraer datos y crear semillas.
- [x] Modelos de colecciones creados previamente para la semilla.
- [x] Colección de usuarios en el backend, con roles y rutas protegidas según rol/login.
- [x] Uso opcional de Cloudinary para subida de imágenes (form-data).
- [x] Despliegue de **BACKEND** y **FRONTEND** accesible mediante enlaces públicos.
- [x] ReadMe detallado explicando el sentido detrás del proyecto y demostrando el cumplimiento de todos los requisitos.

**Ejemplo de Excel utilizado:** [Enlace de ejemplo de concesionario](https://docs.google.com/spreadsheets/d/1eWsdvriKPBOs1JXID0gz8jhIuXKaK5XcUQdjbqcpVhI/edit?usp=sharing)

---

## Licencia y Reconocimientos

- **The Elder Cards** es un proyecto sin ánimo de lucro, creado por fans y para fans.
- No está afiliado ni respaldado por Bethesda Softworks, ZeniMax Media ni ninguna empresa titular de marcas registradas mencionadas.
- Todos los nombres, logotipos, imágenes y contenido relacionado son propiedad de sus respectivos dueños.
- El uso de elementos de terceros se realiza bajo el principio de _fair use_ y homenaje creativo, sin fines comerciales.
- Si eres titular de derechos y tienes alguna preocupación, contáctanos para resolver cualquier problema de inmediato.

---

**Última actualización:** Octubre 2025
