# Ingrevia Cloud Computing Workspace!
Backend API untuk aplikasi Ingrevia, We will available soon!

## Cloud Architecture
![Ingrevia Cloud Architecture.jpg](https://github.com/fahrezi93/ingrevia-project/blob/753ed40788b479d04f082bbe1a580549c26965e3/Ingrevia%20Cloud%20Architecture.jpg)

## URL API Machine Learning Model
```bash
https://machine-learning-1042086567112.asia-southeast1.run.app
```

## Testing API (Local (untuk authController))
> 1. http://localhost:5000/api/auth/register
>    Method : Post
> 2. http://localhost:5000/api/auth/login
>    Method : Post
> 3. http://localhost:5000/api/auth/login/google
>    Method: Post
> 4. http://localhost:5000/api/auth/forget-password
>    Method: Post
> 5. http://localhost:5000/api/auth/logout
>    Method: Post
> 6. http://localhost:5000/home/recommendations
>    Method: GET
> 7. http://localhost:5000/home/search?query=pastasalad
>    Method: GET
> 8. http://localhost:5000/home/categories
>    Method: GET
> 9. http://localhost:5000/home/discover
>    Method: GET
> 10. http://localhost:5000/recipes
>    Method: GET
> 11. http://localhost:5000/recipes/1
>    Method: GET


### 1. **Register User**

**URL:** `POST /auth/register`  
**Endpoint:** [http://localhost:5000/auth/login/register]
**Request:**

```json
{
  "email": "user@gmail.com",
  "name" : "newuser",
  "password": "321"
}
```

**Response:**

```json
{
    "message": "User berhasil didaftarkan",
    "userId": "SYzP5yZOcu0YyJ1hmc4J"
}
```

### 2. **Login User Email**

**URL:** `POST /auth/login-user`  
**Endpoint:** [http://localhost:5000/auth/login/email]
**Request:**

```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**

```json
{
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJHZWV4cFVTQWlkaEtqRXVnenhTZSIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTczMzg5MjI2OCwiZXhwIjoxNzMzODk1ODY4fQ.CveHfCMNwpKGhDmtCrX2PlUbkjk6WZyBph5u_GT5M7w"
}


```