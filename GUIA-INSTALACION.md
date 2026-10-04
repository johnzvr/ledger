# Instalar Fit Z gratis e independiente

Esta guía deja Fit Z bajo tus propias cuentas. ChatGPT no aloja la app ni guarda los entrenamientos.

## Lo que necesitas

1. Una cuenta gratuita de GitHub: https://github.com/signup
2. Una cuenta gratuita de Cloudflare: https://dash.cloudflare.com/sign-up
3. Node.js 22 o superior: https://nodejs.org/en/download
4. El correo que usarás para entrar a Fit Z.

No compartas contraseñas, códigos de acceso ni tokens con ninguna persona.

## 1. Guardar el código en GitHub

1. Descomprime `Fit-Z-Cloudflare.zip`.
2. Instala GitHub Desktop desde https://desktop.github.com/ e inicia sesión.
3. Abre **File > Add local repository** y selecciona la carpeta descomprimida.
4. GitHub Desktop indicará que todavía no es un repositorio. Pulsa **Create a repository**.
5. Usa `fit-z` como nombre y deja **Git ignore** y **License** en `None`; el proyecto ya incluye lo necesario.
6. Pulsa **Create repository**.
7. Escribe `Versión inicial independiente` en Summary y pulsa **Commit to main**.
8. Pulsa **Publish repository**, mantén activada la opción de conservar el código privado y confirma.

## 2. Preparar Cloudflare desde la terminal

Abre Terminal en macOS o PowerShell en Windows. Entra a la carpeta del proyecto y ejecuta:

```bash
corepack enable
pnpm install
pnpm exec wrangler login
```

El último comando abre Cloudflare en el navegador. Autoriza Wrangler y vuelve a la terminal.

## 3. Crear la base de datos

Ejecuta:

```bash
pnpm exec wrangler d1 create fit-z-db
```

Cloudflare mostrará un bloque con `database_id`. Copia solamente el UUID.

Abre `wrangler.jsonc` y reemplaza:

```text
00000000-0000-4000-8000-000000000000
```

por el UUID que Cloudflare acaba de entregar.

En el mismo archivo reemplaza:

```text
REPLACE_WITH_YOUR_EMAIL
```

por el correo exacto que usarás para entrar a Fit Z.

Guarda el archivo y crea las tablas:

```bash
pnpm run db:migrate:remote
```

## 4. Verificar y publicar

Ejecuta, uno por uno:

```bash
pnpm run test
pnpm run typecheck
pnpm run build
pnpm run deploy
```

Al terminar, Cloudflare mostrará una dirección con este formato:

```text
https://fit-z.TU-SUBDOMINIO.workers.dev
```

Si la abres en este momento, Fit Z mostrará una pantalla indicando que falta configurar la protección. Eso es correcto.

## 5. Proteger Fit Z con tu correo

1. En Cloudflare abre **Workers & Pages**.
2. Selecciona el Worker **fit-z**.
3. Entra a **Settings > Domains & Routes**.
4. En la dirección `workers.dev`, pulsa **Enable Cloudflare Access**.
5. Pulsa **Manage Cloudflare Access**.
6. Crea una política **Allow**.
7. En **Include**, selecciona **Emails** y escribe exactamente el correo configurado en `FITZ_OWNER_EMAIL`.
8. Activa **One-time PIN** como método de acceso y guarda la política.

Abre nuevamente la dirección. Cloudflare pedirá tu correo, enviará un código temporal y luego mostrará Fit Z.

No registres datos reales antes de terminar esta protección.

## 6. Activar las actualizaciones automáticas desde GitHub

1. En Cloudflare abre el Worker **fit-z**.
2. Entra a **Settings > Builds** o **Builds & Deployments**.
3. Conecta tu cuenta de GitHub.
4. Selecciona el repositorio privado `fit-z` y la rama `main`.
5. Usa `pnpm run build` como comando de compilación.
6. Usa `pnpm run deploy` como comando de despliegue.
7. Guarda la configuración.

Desde entonces, cada cambio enviado a `main` generará una nueva versión de Fit Z. El nombre del Worker en Cloudflare debe seguir siendo `fit-z`, igual que el campo `name` de `wrangler.jsonc`.

## 7. Instalarla en tus dispositivos

- iPhone: abre la dirección en Safari, pulsa Compartir y **Agregar a pantalla de inicio**.
- Android: abre la dirección en Chrome y selecciona **Instalar aplicación**.
- Chrome o Edge en computadora: usa el icono de instalación de la barra de direcciones.
- Safari en Mac: usa **Archivo > Agregar al Dock**.

En todos los dispositivos entra con el mismo correo.

## Migrar registros desde la versión anterior

1. En la versión anterior abre **Exportar datos**.
2. Descarga **Copia completa · JSON**.
3. En la instalación independiente abre **Exportar datos > Restaurar copia · JSON**.
4. Selecciona el archivo descargado y confirma la importación.
5. Espera a que el indicador superior muestre **Sincronizado** antes de cerrar la aplicación.

## 8. Usar tu dominio actual más adelante

La dirección `workers.dev` es suficiente para empezar. Cuando quieras usar algo como `fit.tudominio.com`, añade el dominio a Cloudflare y, dentro del Worker, abre **Settings > Domains & Routes > Add > Custom Domain**.

## Copias de seguridad

Dentro de Fit Z abre **Exportar datos** y descarga periódicamente **Copia completa · JSON**. Guarda ese archivo fuera del dispositivo principal. Puedes restaurarlo desde el mismo menú. D1 también conserva recuperación temporal de la base, pero el archivo JSON es tu copia portátil.

## Actualizar el proyecto después de configurar Cloudflare

Después de editar `wrangler.jsonc`, vuelve a GitHub Desktop:

1. Escribe `Configurar mi Cloudflare` en Summary.
2. Pulsa **Commit to main**.
3. Pulsa **Push origin**.

No subas archivos `.dev.vars`, tokens ni códigos temporales.
