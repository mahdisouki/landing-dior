FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_FORM_ENDPOINT
ENV VITE_FORM_ENDPOINT=$VITE_FORM_ENDPOINT
RUN if [ -z "$VITE_FORM_ENDPOINT" ]; then echo "VITE_FORM_ENDPOINT build argument is required" >&2; exit 1; fi
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
