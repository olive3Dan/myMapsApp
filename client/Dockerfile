FROM node:current-alpine as client-dependecies

WORKDIR /usr/client


COPY client/package*.json ./
COPY client/index.html ./
COPY client/main.js ./
COPY client/style.css ./
COPY client/vite.config.js ./
COPY client/dbAccess.js ./
COPY client/mapTools.js ./
COPY client/menus.js ./
COPY client/temp.js ./
COPY client/style.css ./
COPY client/popUpForms.js ./
COPY client/icons ./icons/

RUN ["npm", "i", "production"]

FROM node:current-alpine as build-and-run

COPY --from=client-dependecies /usr/client ./usr/client

WORKDIR /usr/client

CMD ["npm", "run", "start"]