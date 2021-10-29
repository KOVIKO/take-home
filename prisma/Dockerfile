FROM node:14-alpine
WORKDIR /app
COPY ./ ./prisma/
EXPOSE 5555/tcp
RUN chown -R node /app
USER node
CMD ["npx", "prisma", "studio"]
