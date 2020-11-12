import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Transaction type must be income or outcome.');
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const categoryData = await categoriesRepository.getData(category);

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryData.id,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
