import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private balance: Balance;

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const incomes = transactions.filter(
      (transaction: Transaction) => transaction.type === 'income',
    );

    const income = Object.values(incomes).reduce(
      (acc, { value }) => acc + value,
      0,
    );

    const outcomes = transactions.filter(
      (transaction: Transaction) => transaction.type === 'outcome',
    );
    const outcome = Object.values(outcomes).reduce(
      (acc, { value }) => acc + value,
      0,
    );
    const total = income - outcome;
    this.balance = {
      income,
      outcome,
      total,
    };
    return this.balance;
  }
}

export default TransactionsRepository;
