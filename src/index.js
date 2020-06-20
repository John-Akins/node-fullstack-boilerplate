import app from './app';

const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 9000;
const host = process.env.NODE_ENV === 'production' ? 'pafradio.com' : 'localhost';

export default app({ port, host });
