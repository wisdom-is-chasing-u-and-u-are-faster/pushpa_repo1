# Enterprise Multi-Stage Dockerfile for Node.js (app-psales-portal-prod-nnse8k)
# Modernized for Google Cloud Run
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || npm install --production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

COPY --from=builder /app/node_modules ./node_modules
COPY . .

USER node
CMD ["npm", "start"]
