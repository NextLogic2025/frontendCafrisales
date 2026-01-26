# Frontend Móvil (Expo + React Native + NativeWind)

Este proyecto vive en `frontend/mobile` y está centrado en Android: usamos Expo Dev Client para generar APKs instalables y EAS Build/Update para iterar sin reinstalar.

## Herramientas y dependencias

- **Instalar dependencias** (desde `aplicacion/`):
  ```bash
  npm install
  ```
- **CLI de EAS** (global):
  ```bash
  npm install -g eas-cli
  ```
- **Dev Client** (una sola vez):
  ```bash
  cd frontend/mobile
  npx expo install expo-dev-client
  npx expo prebuild
  ```
  Solo vuelve a ejecutar `expo prebuild` cuando agregues o cambies plugins nativos.

## Build instalable para desarrollo (dev client + APK interno)

1. Copia `.env.example` a `.env` y ajusta todas las `EXPO_PUBLIC_*` con tu IP (`http://192.168.80.4:3001`, etc.).
2. Arranca el bundler en modo dev client:
   ```bash
   npx expo start --dev-client --tunnel
   ```
   Usa `--tunnel` si el dispositivo no ve tu red local.
3. Genera el APK:
   ```bash
   eas build --platform android --profile dev
   ```
   Este perfil usa `developmentClient: true`, `buildType: apk` y `distribution: internal`.
4. Instala el APK descargado:
   ```bash
   adb install -r ~/Downloads/cafrilosa-mobile-android.apk
   ```
   También puedes compartir el enlace `expo.dev/artifacts`.

### Beneficios

- El APK permanece instalado aunque minimices la app, evitando el “salto” de Expo Go.
- Puedes seguir desarrollando JS/TS y aplicar OTA con `eas update`.
- Después de instalar el APK, escanea el QR del bundler para obtener el bundle actualizado.

## Canales y OTA (EAS Update: dev / preview / prod)

- Cada rama de EAS Update (`dev`, `preview`, `prod`) corresponde a un entorno.
- Publica cambios JS/TS sin rebuild:
  ```bash
  eas update --branch dev --message "Correción rápida" --platform android
  eas update --branch preview --message "Staging" --platform android
  eas update --branch prod --message "Release X" --platform android
  ```
- Los APKs deben construirse con el branch adecuado para recibir el bundle correcto.
- Cambios nativos, permisos nuevos, claves de Google Maps o `EXPO_PUBLIC_*` requieren rebuild.

## Matriz de entornos y `.env`

- Local (`.env`): apunta a Docker Compose (`http://192.168.80.4:3001` y demás servicios).
- Staging (`.env.staging`): dominios de staging (https://staging-*.cafrilosa.com).
- Producción (`.env.production`): dominios públicos (https://*.cafrilosa.com).

⚠️ Las variables `EXPO_PUBLIC_*` se empaquetan al hacer `eas build`, no se pueden cambiar via OTA.

## Conectividad backend local vs emulador vs staging

| Contexto                       | URL recomendada                      |
|-------------------------------|--------------------------------------|
| Dispositivo físico en LAN     | `http://192.168.80.4:3001`           |
| Emulador Android (Android Studio) | `http://10.0.2.2:3001`           |
| Staging                       | `https://staging-api.cafrilosa.com` |
| Producción                    | `https://api.cafrilosa.com`          |

Mantén estas URLs en los `.env.*` y evita subirlas al repo. Si el backend se actualiza, reemplaza la carpeta `backend/` y relanza Docker Compose; tus `.env` locales seguirán apuntando al mismo host.

## Lectura de variables en el código

`src/config/env.ts` normaliza todos los `EXPO_PUBLIC_*` y los valida con `zod`. Ejemplo:

```ts
import { env } from "src/config/env"

const respuesta = await fetch(`${env.api.baseUrl}/ordenes/status`)
```

Este módulo también elimina `/` finales y resuelve default URLs (emulador).

## Rebuild vs OTA (cuándo usar cada uno)

- **Rebuild (`eas build`)** cuando:
  1. Añades/actualizas dependencias nativas (`react-native-maps`, plugins Expo, etc.).
  2. Modificas `app.config.js`, iconos, splash o permisos (Google Maps API key).
  3. Cambias los valores de `EXPO_PUBLIC_*`.
- **OTA (`eas update`)** cuando:
  1. Solo cambias UI, lógica JS/TS, hooks, vistas o estilos.
  2. Actualizas fetches, validaciones, tipos o business logic sin tocar nativo.

## Checklist de verificación

1. `npm install` ya ejecutado desde `aplicacion/`.
2. `.env*` correcto para el entorno objetivo (local, staging, producción).
3. `npx expo start --dev-client --tunnel` arranca y el backend responde al health check.
4. `eas build --platform android --profile <dev|preview|production>` completado y APK/AAB descargado.
5. `eas update --branch <dev|preview|prod>` usado cada vez que solo cambia JS/TS.
6. APK instalado con `adb install -r` o mediante enlace interno.

## Guía rápida

1. **Primer build instalable**
   - Ejecuta `npm install` desde `aplicacion/`.
   - `cd frontend/mobile && npx expo install expo-dev-client`.
   - Copia `.env.example` a `.env` y configura la IP local.
   - Ejecuta `npx expo prebuild` si no existen carpetas nativas.
   - `eas build --platform android --profile dev` y descarga el APK.
   - `adb install -r <apk>` y abre la app.
2. **Actualizaciones diarias**
   - Levanta los microservicios (`backend/` en Docker Compose).
   - Corre `npx expo start --dev-client --tunnel` y prueba desde el APK.
   - Luego de cambios JS/TS, `eas update --branch dev --message "..." --platform android`.
   - Reinicia la app para que descargue el bundle OTA.
3. **Vista previa de staging**
   - `eas build --platform android --profile preview` genera un APK interno de staging.
   - Instala o comparte ese APK (usa branch `preview` para OTA).
   - Para refrescar JS, corre `eas update --branch preview --message "..." --platform android`.
4. **Lanzamiento a producción**
   - Mantén `.env.production` con URLs y claves reales.
   - `eas build --platform android --profile production` genera el bundle final.
   - `eas update --branch prod --message "Release X" --platform android` antes de publicar.
   - Sube el AAB a Play Store o usa `eas submit`.

## Estructura del proyecto

### `assets/`
Activos nativos empaquetados por Expo.

- `assets/logo.png`: icono principal.

### `src/`
Código TypeScript/React Native.

#### `src/features/`
Una carpeta por dominio/rol.

- `auth` (Splash, Login, ForgotPassword).
- `app` (pantallas globales y componentes compartidos).
- `cliente`, `supervisor`, `vendedor`, `transportista`, `bodeguero`.

#### `src/navigation/`
Tipos y helpers de navegación (`RootStackParamList`).

#### `src/components/`
UI reutilizable (`PrimaryButton`, `TextField`, etc.).

#### `src/services/`
Consumo de backend (`authClient.ts`, `http.ts`).

#### `src/storage/`
Persistencia local (`authStorage.ts`, tokens en SecureStore).

#### `src/assets/`
Exports para usar con `require(...)`.

#### `src/theme/`
Tokens visuales (`colors` basados en `@cafrilosa/shared-types`).

## Flujo recomendado con el backend

1. Configura el `.env*` adecuado (local/staging/prod) usando `.env.example`.
2. `src/config/env.ts` valida y normaliza cada `EXPO_PUBLIC_*`.
3. `authClient.ts` y `http.ts` consumen esas URLs y obtienen tokens de `authStorage.ts`.
4. Para enviar `Authorization: Bearer`, lee el token en `authStorage.ts` antes del fetch.

## Shared types (recomendado)

`@cafrilosa/shared-types` en `shared/types` se usa para mantener colores y esquemas comunes con la web.
