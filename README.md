# Store Management API
A simple API that allows users to create and manage their own stores.

## Project Installation

### You will need:
- Node.js

### Create .env file
Create a .env file to store your jwt secrets and mongodb uri. Exam below:

```
PORT = 3000
MONGO_URI = mongodb+srv://your.mongodb.uri/StoreMangementAPI
JWT_ACCESS = myJwtAccessKeySecret
JWT_REFRESH = myJwtRefreshKeySecret
```

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile for Production

```sh
npm run build
```

## Run the Production Server

To run the server, execute the command below:

```sh
node dist/index.js
```