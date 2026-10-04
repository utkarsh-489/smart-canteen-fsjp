# Smart Canteen System — FSJP Mini Project

A full-stack B.E. IT Semester III mini-project built around the supplied FSJP experiments:

- React + Bootstrap frontend
- Spring Boot REST backend
- MySQL + Spring Data JPA/Hibernate
- JWT authentication with Student / Staff / Admin roles
- Axios + CORS integration
- Order lifecycle: NEW → PREPARING → READY → COLLECTED / REJECTED
- Today's offers and staff menu entry
- Admin dashboard, revenue, popular items, user block/unblock, feedback
- Demo payment marked SUCCESS for the project presentation

## Demo accounts

Student: `student@college.edu` / `student123`
Staff: `staff@canteen.com` / `staff123`
Admin: `admin@canteen.com` / `admin123`

## Run locally

### 1. MySQL
Create the database once:

```sql
CREATE DATABASE smart_canteen_db;
```

Edit:
`backend/src/main/resources/application.properties`

Change these values to match your MySQL installation:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

### 2. Backend
Requirements: JDK 17+ and Maven.

Open a terminal inside `backend` and run:

```bash
mvn spring-boot:run
```

Backend URL:
`http://localhost:8080`

### 3. Frontend
Requirements: Node.js 18+.

Open another terminal inside `frontend`:

```bash
npm install
npm run dev
```

Frontend URL:
`http://localhost:5173`

## Important demo sequence

1. Login as student.
2. Add food items to cart.
3. Place order using Demo-UPI.
4. Note the generated queue/token number.
5. Open another browser/incognito window and login as staff.
6. Accept the order and enter preparation time.
7. Click `Mark Ready`.
8. Return to the student window; the order status updates automatically.
9. Login as staff and click `Mark Collected` after pickup.
10. Student can submit feedback.
11. Login as admin to show revenue, popular items, recent orders, feedback and user block/unblock.

## FSJP mapping

Experiment 2: HTML/CSS/Bootstrap UI foundation.
Experiment 3: React components, state, Axios service layer.
Experiment 4: Spring Boot REST APIs.
Experiment 5: MySQL + JPA/Hibernate + CRUD.
Experiment 6: JWT authentication/security.
Experiment 7: React ↔ Spring Boot/CORS integration.
Experiment 8: Docker/GitHub deployment (to be added after local integration is stable).
