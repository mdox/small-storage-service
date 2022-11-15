FROM alpine
WORKDIR /app
COPY . .
RUN apk add --update nodejs npm
RUN npm install
ENV PORT=6060
EXPOSE 6060
CMD ["node", "index.js"]
