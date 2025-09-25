# 🚀 Projeto com Docker + Prisma

Este projeto roda em containers Docker e utiliza **Prisma ORM** para gerenciamento do banco de dados.

---

## 📦 Subir os containers

```bash
docker-compose up -d --build
```

Isso irá construir a aplicação e iniciar os serviços em segundo plano.

---

## 🗄️ Banco de Dados

### Criar o banco e aplicar as migrations
```bash
docker-compose exec web npx prisma migrate dev --name init
```

---

### Resetar o banco de dados (⚠️ apaga tudo)
```bash
docker-compose exec web npx prisma migrate reset
```

---

## 👤 Usuário Admin

Para criar um usuário administrador (email: administrador@email.com senha: 123456):
```bash
docker-compose exec web npx tsx src/scripts/createUser.ts
```

---

## 🔍 Visualizar o banco de dados

Abrir o Prisma Studio (interface gráfica do banco):
```bash
docker-compose exec web npx prisma studio
```

---

## 🐚 Acessar o container

Entrar no shell do container `web`:
```bash
docker-compose exec web sh
```

---

## 📌 Comandos úteis

- **Subir containers**  
  `docker-compose up -d --build`

- **Parar containers**  
  `docker-compose down`

- **Ver logs**  
  `docker-compose logs -f`

---

## 📝 Notas

- Certifique-se de que o **Docker** e o **Docker Compose** estejam instalados.  
- O banco é gerenciado pelo **Prisma ORM**.  
- Alterações no schema (`prisma/schema.prisma`) devem ser seguidas de:
  ```bash
  docker-compose exec web npx prisma migrate dev --name <nome_da_migration>
  ```

---
