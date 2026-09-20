# AkMart Enterprise Architecture Rules

This rule enforces the DRY (Don't Repeat Yourself) principles and strict layered architecture for the AkMart e-commerce backend. All future agents and developers must adhere to these rules when building new modules (Products, Orders, Auth, etc.).

## 1. Structural Strategy: Layer-First
We strictly use a **Layer-First** folder structure (not module-first). All files must live in their respective layer directory in `src/`.
Code must flow strictly in this direction:
`Routes -> Middlewares -> Controllers -> Services -> Prisma (DB)`

- **Routes (`src/routes/*.routes.ts`):** Only maps HTTP methods to Controllers.
- **Controllers (`src/controllers/*.controller.ts`):** Extracts data from `req`, calls the Service, and formats the response. **No business logic or database queries allowed.**
- **Services (`src/services/*.service.ts`):** 100% pure TypeScript business logic. **No Express `req` or `res` objects allowed.** 
- **Validators (`src/validators/*.validator.ts`):** Zod schemas grouped by entity (e.g., `product.validator.ts`).
- **Data Access:** *Intentional Decision:* We bypass a dedicated Repository layer for development speed. Services will call the Prisma client directly.

## 2. Naming Conventions
- **Files:** `[entity].[layer].ts` (e.g., `product.service.ts`)
- **Classes:** PascalCase (e.g., `ProductService`)
- **Functions:** camelCase (e.g., `createProduct`)
- **Prisma Models:** PascalCase, Singular (e.g., `Product`, `Order`)

## 3. Standardized Responses & Error Handling
- **Success Responses:** Controllers must format success responses consistently: 
  `{ success: true, message: '...', data: {...} }`
- **Error Responses:** Never write `res.status()` error blocks manually. Controllers must pass errors to Express via `next(error)`.
- **AppError:** Services must throw `AppError` (located in `src/utils/AppError.ts`). The global error handler will catch this and format it as:
  `{ success: false, error: { code, message } }`

## 4. E-Commerce Transactions (Atomic Writes)
Any Service method performing 2 or more related database writes (e.g., place order -> decrement stock -> create payment) **MUST** use `prisma.$transaction()`. Atomic operations are non-negotiable to prevent data corruption.
*Guardrail:* The `$transaction()` callback and everything inside it must live entirely within the Service layer — never partially orchestrated from the Controller.

## 5. Authorization Split
- **Middleware Level:** General role-based checks (e.g., "Is this user a SELLER?").
- **Service Level:** Resource-ownership checks (e.g., "Is this user the actual owner of THIS specific product?"). Do not put resource-ownership checks in the HTTP Middleware.

## 6. DTOs (Data Transfer Objects)
To guarantee type safety and prevent data leaks (like accidentally exposing `passwordHash`), we strictly use DTOs for data crossing the network boundary:
- **Request DTOs:** Never write manual TS interfaces for requests. Use `z.infer<typeof yourZodSchema>` as the single source of truth.
- **Response DTOs:** *Never* return raw Prisma objects from Controllers to the client. Define an explicit interface (e.g., `UserResponseDTO`) and a mapper function (e.g., `toUserResponseDTO()`) in the `src/dtos/` directory. Controllers must map Prisma objects through these before calling `res.json()`.
