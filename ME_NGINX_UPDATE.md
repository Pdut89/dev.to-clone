# Mongo Express Nginx Config

## Update compose

### Changes

- changed depends_on syntax to:

  ```shell
  depends_on: 
    - mongo
  ```

- Added the following env vars:

  ```shell
    - ME_CONFIG_SITE_BASEURL=/mongo-express/
    - PORT=8081
  ```

  - Port 8081 is default, but I think it's safer to define it.
  - We also specify a base url of `/mongo-express/`, since `/` is for react, and `/api` is for express.

- Added mongo-express to the `-frontend` network so it can communicate with nginx, which is also on the frontend network.

- Removed the exposed *port 8081*

#### compose.yml

Copy the following to your compose.yml.

Remember to define the ipv4 address for express.

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
      interval: 10s
      retries: 5

  mongo-express:
    container_name: mongo-express
    image: mongo-express
    depends_on:
      - mongo
    environment:
      - ME_CONFIG_MONGODB_URL=mongodb://mongo:27017/
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

## Update Nginx Config

### Updates

- Added a new `location` config for mongo-express.
- Added an `upstream` to forward requests on the /mongo-express/ route to the mongo-express container, on port 8081.

#### nginx.conf

Replace your nginx.conf with the following

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

## Access URL

https://[ipv4 address]/mongo-express/
