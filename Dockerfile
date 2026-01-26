# ---------- Stage 1: Build Angular app ----------
FROM node:16-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx ng build cargo-set-ui --configuration production --fonts false

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:stable-alpine

COPY --from=build /usr/src/app/dist/cargo-set-ui /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
