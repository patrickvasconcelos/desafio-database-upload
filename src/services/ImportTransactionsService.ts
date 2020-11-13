import fs from 'fs';
import csv from 'csv-parse';
import path from 'path';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const csvPath = path.join(uploadConfig.directory, filename);
    const createTransaction = new CreateTransactionService();
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const transactionsList: Request[] = [];
    const categoriesList: string[] = [];

    const fd = fs.createReadStream(csvPath);
    const pipeCsv = fd.pipe(csv());

    pipeCsv.on('data', row => {
      const [titleRow, typeRow, valueRow, categoryRow] = row;
      const title = titleRow.trim();
      const type = typeRow.trim();
      const value = parseFloat(valueRow.trim());
      const category = categoryRow.trim();
      if (value) {
        const transaction = {
          title,
          category,
          type,
          value,
        } as Request;
        categoriesList.push(category);
        transactionsList.push(transaction);
      }
    });
    await new Promise(resolve => pipeCsv.on('end', resolve));

    const arrayCategories = categoriesList.map(async cat => {
      const createdCategory = await categoriesRepository.getData(cat);
      return createdCategory;
    });

    const arrayTransactions = transactionsList.map(async transaction => {
      const createdTransaction = await createTransaction.execute(transaction);
      return createdTransaction;
    });

    const transactions = await (async (): Promise<Transaction[]> => {
      await fs.promises.unlink(csvPath);
      const resultad = await Promise.all(arrayCategories);
      const resultado = await Promise.all(arrayTransactions);
      return resultado;
    })();
    return transactions;
  }
}

export default ImportTransactionsService;
