# Project Requirements and Specifications

This document specifies the requirements for the **Authentication (Login)** system, serving as a guide for Test-Driven Development (**TDD**) structured under the principles of **Clean Architecture** and **Design Patterns**.

## 🎯 Use Case: Authentication (Login)

### 📥 HTTP Protocol / Interface (Presentation Layer)

* **Route:** `POST /api/login`

* **Request Payload:**

  ```json
  {
    "email": "user@example.com",
    "password": "secret_password"
  }
  ```

## 🟢 Main Flow (Success Case)

1. ✅ Receives a `POST` request on the `/api/login` route.
2. ✅ Validates that the required `email` and `password` fields are provided.
3. ✅ Validates that the `email` format is valid (using an *EmailValidator Adapter*).
4. ✅ Searches for the registered user by the provided email (via *LoadAccountByEmailRepository*).
5. ✅ Compares the provided password with the encrypted password (*hash*) stored in the database (via *HashComparer*).
6. ✅ Generates an access token (*JWT*) based on the user's ID (via *Encrypter / TokenGenerator*).
7. ✅ Updates the user record in the database, persisting the generated access token (via *UpdateAccessTokenRepository*).
8. ✅ Returns status `200 OK` with the `accessToken` and user `name` in the response body:

   ```json
   {
     "accessToken": "jwt_token_here",
     "name": "User Name"
   }
   ```

## 🔴 Exceptions and Error Handling

### Validation and Authentication Errors (`4xx`)

* ❌ **400 Bad Request:** If `email` or `password` is not provided.
* ❌ **400 Bad Request:** If the `email` field has an invalid format.
* ❌ **401 Unauthorized:** If the email is not found in the database.
* ❌ **401 Unauthorized:** If the provided password is incorrect / does not match the hash.
* ❌ **404 Not Found:** If the requested API route does not exist.

### Infrastructure and Server Errors (`5xx`)

* ❌ **500 Internal Server Error:** If the email validator throws an exception.
* ❌ **500 Internal Server Error:** If the database lookup (*LoadAccountByEmailRepository*) fails.
* ❌ **500 Internal Server Error:** If the password comparison (*HashComparer*) fails.
* ❌ **500 Internal Server Error:** If the token generator (*Encrypter*) fails.
* ❌ **500 Internal Server Error:** If updating the token in the database (*UpdateAccessTokenRepository*) fails.
