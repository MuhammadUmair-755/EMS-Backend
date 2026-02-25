FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm install
RUN npx prisma generate

# Copy the rest of your source code
COPY . .

# Render defaults to port 10000
EXPOSE 10000

# Start the application
CMD ["npm", "start"]