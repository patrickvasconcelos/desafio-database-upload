import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
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

    const categoriesRepository = getRepository(Category);

    let categoryData: Category = {} as Category;
    const categoryBase = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryBase) {
      const createdCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(createdCategory);
      categoryData = createdCategory;
    } else {
      categoryData = categoryBase;
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryData.id,
    });

    if (type === 'outcome' && total < value) {
      throw new AppError('outcome is bigger then total');
    }
    await transactionsRepository.save(transaction);
    // delete transaction.category_id;
    // delete transaction.created_at;
    // delete transaction.updated_at;
    transaction.category = categoryData;

    return transaction;
  }
}

export default CreateTransactionService;
