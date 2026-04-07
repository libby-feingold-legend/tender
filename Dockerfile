# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Export web build
RUN npx expo export --platform web

# Stage 2: Serve
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built web app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
