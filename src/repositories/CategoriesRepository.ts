import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async getData(title: string): Promise<Category> {
    const categoryBase = await this.findOne({
      where: { title },
    });

    if (!categoryBase) {
      const createdCategory = this.create({ title });
      await this.save(createdCategory);
      return createdCategory;
    }

    return categoryBase;
  }
}

export default CategoriesRepository;
