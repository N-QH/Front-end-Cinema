# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Copy custom Nginx configuration to handle Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app to Nginx's html directory
# Note: Update "front-end-cinema/browser" if your angular.json specifies a different output path
COPY --from=build /app/dist/front-end-cinema/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]