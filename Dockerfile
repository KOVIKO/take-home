FROM node:14-alpine AS builder

WORKDIR /usr/src/app

COPY *.json* ./
COPY prisma ./prisma/

RUN npm i --silent
RUN npx prisma generate

COPY . .

RUN npm run prebuild
RUN npm run build

FROM node:14-alpine AS runner

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/*.json* ./
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
