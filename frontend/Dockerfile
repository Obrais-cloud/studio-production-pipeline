FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
ARG NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
