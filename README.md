# Store Management API
A simple API that allows users to create and manage their own stores.

## Project Installation

### You will need:
- Node.js

### Create .env file

Create a .env file to store your custom environment variables.
Required variables:
- **MONGO_URI:** The connection string of your MongoDB database
- **JWT_ACCESS:** The secret key in generating JWT access keys
- **JWT_REFRESH:** The secret key in generating JWT access keys
- **ADMIN_EMAIL:** The admin account's email
- **ADMIN_PASS:** The admin account's password

Example below:

```
MONGO_URI = mongodb+srv://your.mongodb.uri/StoreMangementAPI
JWT_ACCESS = yourJwtAccessKeySecret
JWT_REFRESH = yourJwtRefreshKeySecret
ADMIN_EMAIL = admin@email.com
ADMIN_PASS = Admin.password1
```

## Project Setup

Install all the necessary project dependencies

```sh
npm install
```

### Compile and Hot-Reload for Development
---

Restarts the server every time save file

```sh
npm run dev
```

### Testing
---

Run the tests

```sh
npm test
```

### Build for Production
---

Compile and build the project

```sh
npm run build
```

### Run the Production Server
---

Starts the server

```sh
npm start
```

**NOTE:** You must execute `npm run build` first