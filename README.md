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
npx prisma migrate dev --name init
```

---

### Resetar o banco de dados (⚠️ apaga tudo)
```bash
npx prisma migrate reset
```

---

## 👤 Iniciar o BD
Para criar um usuário administrador (email: (administrador@email.com, alice@email.com, bruno@email.com) senha: 123456):
```bash
npx tsx src/scripts/initializeBD.ts
```

---

## 🔍 Visualizar o banco de dados

Abrir o Prisma Studio (interface gráfica do banco):
```bash
npx prisma studio
```

---

## 🐚 Acessar o container

Entrar no shell do container `web` (não precisa mais):
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