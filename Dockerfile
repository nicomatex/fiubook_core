FROM node:latest
WORKDIR /app
COPY ./build ./build
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install --omit=dev
ENTRYPOINT [ "node","./build/src/test.js" ]