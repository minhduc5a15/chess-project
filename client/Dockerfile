# Build stage
FROM jarredsumner/bun:latest AS build
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

# Serve stage (nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
