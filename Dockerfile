FROM node:18-alpine

WORKDIR /usr/src/app

# Instalar dos2unix para corrigir line endings
RUN apk add --no-cache dos2unix

COPY package*.json ./

RUN npm install
RUN npm install typeorm reflect-metadata

RUN npm install -g ts-node

COPY . .

# Garantir que o arquivo tenha as permissões corretas e formatação Unix
RUN dos2unix docker-entrypoint.sh && \
    chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["npm", "start"]
