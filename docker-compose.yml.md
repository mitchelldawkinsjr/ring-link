# docker-compose.yml Example

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: ringlink-app

  nginx:
    image: nginx:latest

  mysql:
    image: mysql:8

  redis:
    image: redis:latest

  queue-worker:
    build: .

  scheduler:
    build: .
```
