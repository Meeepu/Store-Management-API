import { cleanEnv } from 'envalid';
import { str, port } from 'envalid/dist/validators';

export default cleanEnv(process.env, {
    PORT: port({ default: 3000 }),
    MONGO_URI: str(),
    JWT_ACCESS: str(),
    JWT_REFRESH: str(),
    ADMIN_EMAIL: str(),
    ADMIN_PASS: str(),
    NODE_ENV: str({
        choices: ['development', 'production', 'test']
    })
});
