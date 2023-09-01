import app from './app';
import database from './database';
import envs from './utilities/envs';

database.then(() => {
    console.log('Connected to database');
    app.listen(envs.PORT, () => console.log(`Server is running on port ${envs.PORT}`));
});

export default app;
