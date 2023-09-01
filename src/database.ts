import envs from './utilities/envs';
import mongoose from 'mongoose';

export default mongoose.connect(envs.MONGO_URI);
