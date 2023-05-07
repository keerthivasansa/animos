# Dockerfile

FROM node:16-alpine

WORKDIR /app
COPY package.json package-lock.json ./

COPY . .
RUN npm run build


EXPOSE 3000
CMD ["node", "build"]