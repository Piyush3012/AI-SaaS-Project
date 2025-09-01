import {neon} from '@neondatabase/serverless';

const sql = neon(`${process.env.DATABASE_URL}`);//using this we can read and write in the sql database

export default sql;

