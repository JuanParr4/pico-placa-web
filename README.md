# Proyecto Pico y Placa Web

Una aplicación web para consultar las restricciones de pico y placa en ciudades colombianas como Bogotá, Medellín y Cali.

## Características

- Consulta de reglas de pico y placa por ciudad y fecha.
- API backend en Node.js con Express.
- Frontend estático con HTML, CSS y JavaScript.
- Soporte para múltiples ciudades.

## Instalación

1. Asegúrate de tener Node.js instalado (versión 14 o superior). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).

2. Clona este repositorio o descarga los archivos del proyecto.

3. Abre una terminal en la raíz del proyecto y ejecuta:
   ```
   npm install
   ```
   Esto instalará todas las dependencias necesarias, incluyendo Nodemon para desarrollo.

## Ejecución

1. Para iniciar el servidor backend, ejecuta:
   ```
   npm run dev
   ```
   El servidor se ejecutará en `http://localhost:3000` y se recargará automáticamente con cambios.

2. En otra terminal, inicia el servidor para el frontend:
   ```
   python3 -m http.server 8080
   ```
   Esto servirá los archivos estáticos en `http://localhost:8080`.

3. Abre tu navegador y ve a `http://localhost:8080` para usar la aplicación.

## Uso

- Selecciona una ciudad del menú desplegable.
- Elige una fecha (por defecto, la fecha actual).
- Haz clic en "Consultar" para ver las reglas de pico y placa aplicables.

## Tecnologías

- **Backend**: Node.js, Express, Cheerio, Axios.
- **Frontend**: HTML, CSS, JavaScript (vanilla).
- **Desarrollo**: Nodemon para recargas automáticas.

## Contribución

Si deseas contribuir, por favor abre un issue o envía un pull request en el repositorio de GitHub.

## Licencia

Este proyecto está bajo la licencia ISC.
