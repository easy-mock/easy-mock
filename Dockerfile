FROM node:9.11.1-alpine

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# copy code
COPY . .
# copy config
COPY docker/production.json ./config/production.json
EXPOSE 7300

RUN npm run build
CMD [ "npm", "run", "start" ]
