# base node image
FROM node:23-bullseye-slim as base

ARG SESSION_SECRET
ARG DATABASE_URL

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

WORKDIR /myapp

# Install Nodejs packages
ADD package.json package-lock.json .npmrc ./
RUN npm install --include=dev
RUN npm prune

# Setup the database
ENV DATABASE_URL=$DATABASE_URL
ADD prisma ./prisma
RUN npm run setup

# Copy over the rest of the files and build
ENV NODE_ENV="development"
ADD . .
RUN npm run build

# Add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

# Expose port 3000 to the host
EXPOSE 3000

# Set up a volume to sync code changes
VOLUME [ "/myapp" ]

# Setup necessary env vars and run the web server in development mode!
ENV HOST="0.0.0.0"
ENV PORT="3000"
ENV SESSION_SECRET=$SESSION_SECRET
CMD npm run dev
