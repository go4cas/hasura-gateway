FROM node:10-alpine

RUN addgroup -S car && \
  adduser -S -g car car

ENV SRC=/dist
ENV HOME=/home/car
ENV HOME_APP=$HOME/app
ENV NODE_ENV=production

COPY package*.json $HOME_APP/

ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init

WORKDIR $HOME_APP

RUN \
  chown -R car:car $HOME/** /usr/local/ && \
  chmod +x /usr/local/bin/dumb-init && \
  npm install --silent --progress=false --production --unsafe-perm && \
  chown -R car:car $HOME/.npm && \
  chown -R car:car $HOME/.config && \
  chown -R car:car /usr/local/lib/node_modules && \
  chown -R car:car $HOME_APP/**

COPY $SRC/ $HOME_APP/

USER car

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

HEALTHCHECK CMD node -r esm healthcheck.js

CMD ["npm", "start"]
