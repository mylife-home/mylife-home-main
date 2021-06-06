FROM node:alpine

ENV NODE_ENV production
RUN mkdir /data
RUN apk add --no-cache git
COPY . /app/
WORKDIR /app

EXPOSE 8002
CMD [ "node", "bin.js" ]
