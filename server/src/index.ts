import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import customersRouter from './routes/customers';
import suppliersRouter from './routes/suppliers';
import itemsRouter from './routes/items';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/customers', customersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/items', itemsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
