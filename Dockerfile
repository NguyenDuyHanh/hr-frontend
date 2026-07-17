# ----------- Build stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Tăng giới hạn bộ nhớ RAM cho NodeJS để tránh lỗi Heap out of memory khi build
ENV NODE_OPTIONS="--max-old-space-size=1536"

# Copy package files to leverage Docker cache
COPY package*.json ./

RUN npm install

# Copy all source files
COPY . .

# Build the Vite application (generates the dist/ directory)
RUN npm run build


# ----------- Production stage -----------
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy high-performance build from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
