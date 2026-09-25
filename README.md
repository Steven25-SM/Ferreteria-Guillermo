# Ferretería Guillermo — React + Spring Boot + PostgreSQL

## Estructura
- `frontend/`: React + Vite
- `backend/`: Spring Boot + JPA + PostgreSQL

## PostgreSQL
Crear la base:
```sql
CREATE DATABASE ferreteria_guillermo;
```

Configurar usuario/contraseña en:
`backend/src/main/resources/application.properties`

## Backend
```bash
cd backend
mvn spring-boot:run
```

## Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:8080
