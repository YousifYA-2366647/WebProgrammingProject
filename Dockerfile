FROM node:18
WORKDIR /
COPY package.json ./
RUN npm install
COPY . /
EXPOSE 8080
CMD ["node", "app.js"]