# EC2 & Docker Step by Step

Most commands & configs below are from the weekly workshop exercises.

They may have been adjusted to suit the purposes of this project.

Refer to the lab tasks for explanations of each command or config.

## 1. Create a security group

Create a security group to allow SSH, HTTP and HTTPS traffic.

### Inbound rules

- From lab E recoding at 40:00

| Type       | Port | Source        |
| ---------- | ---- | ------------- |
| SSH        | 22   | Anywhere-IPv4 |
| HTTP       | 80   | Anywhere-IPv4 |
| HTTPS      | 443  | Anywhere-IPv4 |
| CUSTOM TCP | 8081 | Anywhere-IPv4 |

## 2. Create up an EC2 Instance

### Configuration

This only specifies essential configuration aspects.

| Setting                | Value                             |
| ---------------------- | --------------------------------- |
| Name                   | Any                               |
| OS Image               | Ubuntu                            |
| Instance Type          | t2.medium # for sufficient memory |
| Key pair (login)       | vockey                            |
| Storage                | 30gb (8 is insufficient)          |
| Termination protection | enable                            |

_Proceed to launch the instance._

Reminder to **stop this instance when done**, since t2.medium is not a free tier.

## 3. Connect to Instance

Connect using the AWS Instance connect feature.

## 4. Clone the GitHub Repo

Clone the project repo to the Ubuntu instance.

```shell
git clone https://github.com/Pdut89/dev.to-clone.git

# Choose your preferred branch
cd ~/dev.to-clone
git switch develop

# Return to root directory
cd ~

# You should now see the project folder on your machine:
ls
```

## 5. Docker

### 5.1 Install Docker

- From Lab C, Task 1

```shell
# Install pre-requisite packages.
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Create a docker repo on your system.
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update packages and install docker:
sudo apt update
apt-cache policy docker-ce
sudo apt install docker-ce

# Verify installation:
sudo systemctl status docker

# Test the docker command and see your username
docker
whoami # probably ubuntu

# Add your user (ubuntu) to the docker group, so
# you can run it as a non-root user
sudo usermod -aG docker ubuntu
newgrp docker
```

### 5.2 Install Docker Compose

- From Lab D, Task 2

```shell
sudo curl -SL https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

# Test installation
docker compose version
```

### 5.3 Create Docker Images

Each Dockerfile will create an image. The images are required by the compose file to create the containers.

#### 5.3.1 React Frontend Dockerfile & Image

First, create and open the Dockerfile.

```shell
# Navigate to the relevant directory
cd ~/dev.to-clone/client

# Create and open a new Dockerfile
nano Dockerfile
```

Paste in the following configuration.

- Based on Dockerfile example in Lab D, Task 2

```dockerfile
# Select node as the base layer.
FROM node:latest

# Create and Set the container directory
# where project files will be placed.
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy over the package.json file and install deps.
COPY package.json /usr/src/app
RUN npm install --force

# Copy the remaining source code.
COPY . /usr/src/app

# Set which port to expose for the frontend.
# Note react is served on port 3000
EXPOSE 3000

# Set ENV vars here.
# React vars are needed in the dockerfile, because they must be available when the app if building.
# They will be undefined if placed in compose.
# Based on this information:
# - https://stackoverflow.com/questions/52103155/reading-an-environment-variable-in-react-which-was-set-by-docker
# Note that the config below is not quite the same as described above, since the IP below is static. Still need to test the dynamic approach.
ENV REACT_APP_API_SCHEME=https
ENV REACT_APP_API_HOST=[ec2 public ipv4 IP]
ENV REACT_APP_API_PORT=443
ENV REACT_APP_API_BASE_PATH=api

# EXPLANATION OF THE ENV VARS

# 1. SCHEME:
# Was initially set to http, but react logged the following console error. Changing to https resolved it.
# Console log:
# Mixed Content: The page at 'https://34.227.18.183/' was loaded over HTTPS, but
# requested an insecure resource 'http://34.227.18.183:5000/api/posts'. This request
# has been blocked; the content must be served over HTTPS.


# 2. HOST:
# Was initially set to 'express' (together with http for host and port 5000) since I assumed an internal container network is needed between react and express.
# Saw in the react browser console that requests from react to express were failing and react was logging the message below:

# Console log:
# Mixed Content: The page at 'https://34.227.18.183/' was loaded over HTTPS, but
# requested an insecure resource 'http://express:5000/api/posts'. This request has been
# blocked; the content must be served over HTTPS.

# Realised that react is trying to reach express from the client and not on the internal docker network it was configured for (express:5000).
# Suspected that React needs to connect to express via nginx, and this confirmed it:
# - https://stackoverflow.com/questions/65981289/connect-react-app-served-on-dockerized-nginx-to-express-server
# Based on this info I set react to send requests to the EC2 ipv4 on https so it can reach nginx which listens on port 443 (https).
# I also added an additional location (/api/) and upstream (express:5000) on the nginx conf.
# My solution for the location and upstream was inspired by stackoverflow, but follows the style used in the lab exercises.


# 3. PORT:
# Since we can view react on the host using only the ip address and not also port 443 (https) or 80 (http), I assumed
# that react does not need to include a port value when sending requests to express via nginx.
# A test confirmed that you can specify port 443 on the API_URL (since we're using https) or leave it out, both approaches work.
# I left PORT in since when running this project locally we still need to specify port 5000.

# Create a production build
# Initially used npm run start, however, it seemed unstable and caused the ec2 instance to become unusable
RUN npm run build

# The react build is served on port 3000 using the 'serve' package from react.
# React suggest this method in the console, just after it completed a build:
# Console message:
#   The build folder is ready to be deployed.
#   You may serve it with a static server:
#      npm install -g serve
#      serve -s build

# The start command below is based on this documentation, since I preferred to not install serve globally.
# https://www.npmjs.com/package/serve

CMD ["npx", "serve", "-s", "build"]
```

Close the nano text editor and save the Dockerfile.

Build an image from the Dockerfile:

```shell
# Tag/name the image
docker build -t react-image .
```

#### 5.3.2 Express Backend Dockerfile & Image

First, create and open the Dockerfile.

```shell
# Navigate to the server directory
cd ~/dev.to-clone/server

# Create and open a new Dockerfile
nano Dockerfile
```

Paste in the following configuration.

```dockerfile
# Select node as the base layer.
FROM node:latest

# Create and Set the container directory
# where project files will be placed.
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy over the package.json file and install deps.
# This creates a reusable, cached layer of all required deps.
COPY package.json /usr/src/app

RUN npm install

# Copy the remaining source code.
COPY . /usr/src/app

# Set which port to expose for the backend API.
EXPOSE 5000

# Container start command.
CMD ["npm", "start"]
```

Close the nano text editor and save the Dockerfile.

Build an image from the Dockerfile:

```shell
# Tag/name the image
docker build -t express-image .
```

#### 5.3.3 Pull Mongo & Nginx Images

Pull the default docker images for mongo and nginx.

```shell
docker pull mongo
docker pull nginx
```

Confirm that all 4 required images now exist.

```shell
docker images # Should list the 4 required images
```

### 5.4 Set up Nginx

```shell
# Return to project directory
cd ~/dev.to-clone
```

#### 5.4.1 Create an SSL certificate

- From Lab E, Task 3, Step 2

The following steps creates a root Certificate Authority (CA) and a self-signed SSL Certificate for use with Nginx.

Return to the project root directory before continuing.

```shell
openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout RootCA.key -out RootCA.pem -subj "/C=US/CN=My-Root-CA"

openssl x509 -outform pem -in RootCA.pem -out RootCA.crt
```

Create a domains.ext file

```shell
nano domains.ext
```

Paste the following content into the domains file:

- From Lab E:

```ext
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = fake1.local
```

Close and save the domains file.

Run the following commands.

```shell
openssl req -new -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.csr -subj "/C=US/ST=YourState/L=YourCity/O=Example-Certificates/CN=localhost.local"

openssl x509 -req -sha256 -days 1024 -in localhost.csr -CA RootCA.pem -CAkey RootCA.key -CAcreateserial -extfile domains.ext -out localhost.crt

# Clean up:
mkdir ssl
mv localhost.* ssl/
mv RootCA.* ssl/
```

#### 5.4.2 Create an Nginx config

- From Lab E, Task 3, Step 3

Create and open an nginx conf file.

```shell
nano nginx.conf
```

Paste the following config into the conf file.

This is a modified version of the config provided in Lab E.

```conf
worker_processes 1;

events { worker_connections 1024; }

http {

    sendfile on;
    large_client_header_buffers 4 32k;

    upstream react-app {
        server react:3000;
    }

    upstream web-api {
        server express:5000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            return 301 https://$host$request_uri;
        }

        location /api/ {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name localhost;

        ssl_certificate /etc/ssl/certs/localhost.crt;
        ssl_certificate_key /etc/ssl/private/localhost.key;

        location / {
            proxy_pass         http://react-app;
            proxy_redirect     off;
            proxy_http_version 1.1;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection keep-alive;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_set_header   X-Forwarded-Host $server_name;
            proxy_buffer_size           128k;
            proxy_buffers               4 256k;
            proxy_busy_buffers_size     256k;
        }

        location /api/ {
            proxy_pass         http://web-api;
            proxy_redirect     off;
            proxy_http_version 1.1;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection keep-alive;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_set_header   X-Forwarded-Host $server_name;
            proxy_buffer_size           128k;
            proxy_buffers               4 256k;
            proxy_busy_buffers_size     256k;
        }
    }
}
```

Notes:

- There are two locations settings.

  1. One for react on the "/" location.
  2. One for express on the "/api/" location.

- Each location is configured to serve the appropriate service (react or express).

- Not specifying the container port e.g. express:5000 was resulting in a 502 nginx error.

- The upstream and location config is [inspired by this post](https://stackoverflow.com/questions/65981289/connect-react-app-served-on-dockerized-nginx-to-express-server) (explained in more detail in 5.3.1 above). I still followed the lab syntax/style.

- [Naming for the location/route is explained here](https://docs.nginx.com/nginx/admin-guide/web-server/web-server/#locations) .

### 5.5 Create Docker Compose file

- Based on Lab E content.
  - Set the "backend" network (express + mongo) to internal as per previous lab example.
  - Only one volume needed (for mongo).
  - Only nginx has exposed ports, for both http (:80) and https (:443) connections.
  - The "frontend" network includes the proxy (nginx), react and express, so that nginx can communicate with react and express.

```shell
# Create and open a new compose file
nano compose.yml
```

Add the following config to the compose file:

```yml
version: "3.9"
services:
  mongo:
    container_name: mongo
    image: mongo
    volumes:
      - mongodata:/data/db
    networks:
      - backend

  express:
    container_name: express
    image: express-image
    depends_on:
      - mongo
    environment:
      - PORT=5000
      - DB_HOST=mongo
      - DB_PORT=27017
      - DB_NAME=devto
      - JWT_KEY=somerandomjwtkey
      - COOKIE_KEY=somerandomcookiekey
      - NODE_ENV=development
      - CLIENT_URL=https://[ipv4]
      - CLOUDINARY_CLOUD_NAME=devtoclone
      - CLOUDINARY_API_KEY=176414317785344
      - CLOUDINARY_API_SECRET=WYBaD60Xcos5OB0fIiwVRNQ40-o
    networks:
      - backend
      - frontend

  react:
    container_name: react
    image: react-image
    depends_on:
      - express
    networks:
      - frontend

  proxy:
    container_name: proxy
    image: nginx
    depends_on:
      - react
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl/localhost.crt:/etc/ssl/certs/localhost.crt
      - ./ssl/localhost.key:/etc/ssl/private/localhost.key
    ports:
      - 80:80
      - 443:443
    networks:
      - frontend

volumes:
  mongodata:

networks:
  backend:
    internal: true
  frontend:
```

Save and close the file.

Execute the compose file:

```shell
docker compose up
```

### 5.6 Shutting down

```shell
docker compose down
```

### 5.7 Set up Mongo Express

After running docker compose down

Open compose.yml and add the following config

```shell
nano compose.yml
```

```yml
version: "3.9"
services:
  mongo:
    container_name: mongo
    image: mongo
    volumes:
      - mongodata:/data/db
    networks:
      - backend

    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      retries: 5

  mongo-express:
    container_name: mongo-express
    image: mongo-express
    depends_on:
      mongo:
        condition: service_healthy
    ports:
      - 8081:8081
    environment:
      - ME_CONFIG_MONGODB_URL=mongodb://mongo:27017
    networks:
      - backend

  express:
    container_name: express
    image: express-image
    depends_on:
      - mongo
    environment:
      - PORT=5000
      - DB_HOST=mongo
      - DB_PORT=27017
      - DB_NAME=devto
      - JWT_KEY=somerandomjwtkey
      - COOKIE_KEY=somerandomcookiekey
      - NODE_ENV=development
      - CLIENT_URL=https://[ipv4]
      - CLOUDINARY_CLOUD_NAME=devtoclone
      - CLOUDINARY_API_KEY=176414317785344
      - CLOUDINARY_API_SECRET=WYBaD60Xcos5OB0fIiwVRNQ40-o
    networks:
      - backend
      - frontend

  react:
    container_name: react
    image: react-image
    depends_on:
      - express
    networks:
      - frontend

  proxy:
    container_name: proxy
    image: nginx
    depends_on:
      - react
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl/localhost.crt:/etc/ssl/certs/localhost.crt
      - ./ssl/localhost.key:/etc/ssl/private/localhost.key
    ports:
      - 80:80
      - 443:443
    networks:
      - frontend

volumes:
  mongodata:

networks:
  backend:
  frontend:
```

Execute the compose file

```shell
docker compose up
```

After executing the compose file you would see

```shell
mongo-express  | Welcome to mongo-express 1.0.2
mongo-express  | Mongo Express server listening at http://0.0.0.0:8081
mongo-express  | Server is open to allow connections from anyone (0.0.0.0)
mongo-express  | basicAuth credentials are "admin:pass", it is recommended you change this in your config.js!
```

If you added the additional inbound rule above you should be able to connect to mongo express via
http://<your_public_IPV4>:8081

Then you would see a prompt asking for username and pass, again look for the basicAuth cred

```shell
mongo-express  | basicAuth credentials are "admin:pass", it is recommended you change this in your config.js!
```

## 6. TODO

- 6.1 See if the EC2 instance IP can be set dynamically (see comment in 5.3.1)
- 6.2 Ensure env vars are being set safely / according to best practices

## Additional

### Nginx

```conf
worker_processes 1;

events { worker_connections 1024; }

http {

    sendfile on;
    large_client_header_buffers 4 32k;

    upstream react-app {
        server react:3000;
    }

    upstream web-api {
        server express:5000;
    }

    upstream mongo-express-app {
        server mongo-express:8081;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name localhost;

        ssl_certificate /etc/ssl/certs/localhost.crt;
        ssl_certificate_key /etc/ssl/private/localhost.key;

        location / {
            proxy_pass         http://react-app;
            proxy_redirect     off;
            proxy_http_version 1.1;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection keep-alive;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_set_header   X-Forwarded-Host $server_name;
            proxy_buffer_size           128k;
            proxy_buffers               4 256k;
            proxy_busy_buffers_size     256k;
        }

        location /api/ {
            proxy_pass         http://web-api;
            proxy_redirect     off;
            proxy_http_version 1.1;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection keep-alive;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_set_header   X-Forwarded-Host $server_name;
            proxy_buffer_size           128k;
            proxy_buffers               4 256k;
            proxy_busy_buffers_size     256k;
        }

        location /mongo-express/ {
            proxy_pass         http://mongo-express-app;
            proxy_redirect     off;
            proxy_http_version 1.1;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection keep-alive;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_set_header   X-Forwarded-Host $server_name;
            proxy_buffer_size           128k;
            proxy_buffers               4 256k;
            proxy_busy_buffers_size     256k;
        }
    }
}
```

### Compose

```shell
version: "3.9"
services:
  mongo:
    container_name: mongo
    image: mongo
    volumes:
      - mongodata:/data/db
    networks:
      - backend
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 30s
      retries: 5

  mongo-express:
    container_name: mongo-express
    image: mongo-express
    restart: always
    depends_on:
      - mongo
    environment:
      - ME_CONFIG_MONGODB_URL=mongodb://mongo:27017
      - ME_CONFIG_SITE_BASEURL=/mongo-express/
      - PORT=8081
    networks:
      - backend
      - frontend

  express:
    container_name: express
    image: express-image
    depends_on:
      - mongo
    environment:
      - PORT=5000
      - DB_HOST=mongo
      - DB_PORT=27017
      - DB_NAME=devto
      - JWT_KEY=somerandomjwtkey
      - COOKIE_KEY=somerandomcookiekey
      - NODE_ENV=development
      - CLIENT_URL=https://[ipv4]
      - CLOUDINARY_CLOUD_NAME=devtoclone
      - CLOUDINARY_API_KEY=176414317785344
      - CLOUDINARY_API_SECRET=WYBaD60Xcos5OB0fIiwVRNQ40-o
    networks:
      - backend
      - frontend

  react:
    container_name: react
    image: react-image
    depends_on:
      - express
    networks:
      - frontend

  proxy:
    container_name: proxy
    image: nginx
    depends_on:
      - react
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl/localhost.crt:/etc/ssl/certs/localhost.crt
      - ./ssl/localhost.key:/etc/ssl/private/localhost.key
    ports:
      - 80:80
      - 443:443
    networks:
      - frontend

volumes:
  mongodata:

networks:
  backend:
  frontend:
```
