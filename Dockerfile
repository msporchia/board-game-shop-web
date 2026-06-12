# Dev-shaped image: runs the Vite dev server with HMR. The source is bind-mounted
# in compose, so this image mainly carries node_modules built from the lockfile.
# TODO Phase 5: multi-stage nginx build for a production static bundle.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
