# Copyright 2019 Edouard Maleix, read LICENSE

###############################################################################
# Step 1 : Builder image
#
FROM node:lts-alpine AS builder

# useful when installing git dependency in package.json
RUN apk update && apk add git

ENV NODE_NAME=broker
ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /home/node/$NODE_NAME
WORKDIR /home/node/$NODE_NAME

COPY . ./

RUN npm ci 


###############################################################################
# Step 2 : Run image
#
FROM node:lts-alpine AS mqtt-api

ENV NODE_NAME=broker

RUN mkdir -p /home/node/$NODE_NAME
WORKDIR /home/node/$NODE_NAME

COPY --from=builder /home/node/$NODE_NAME/ ./

STOPSIGNAL SIGINT

CMD ["node","broker.js", ""]

# USER node
