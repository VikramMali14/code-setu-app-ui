# ---------- Stage 1: Build Angular App ----------
FROM node:16-alpine AS build

WORKDIR /usr/src/app

# Only copy package files first for better caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the app (Angular 14)
RUN npx ng build cargo-set-ui --configuration production

# ---------- Stage 2: Serve with OpenResty (Secure) ----------
FROM openresty/openresty:alpine

# 1. Copy the Angular build from the first stage
# Note: OpenResty's default HTML path is different from standard Nginx
COPY --from=build /usr/src/app/dist/cargo-set-ui /usr/local/openresty/nginx/html

# 2. Copy the custom config that hides banners
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf



# EXPOSE 80 is optional for documentation, but recommended
# EXPOSE 80
EXPOSE 4200


# Start OpenResty
CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]
