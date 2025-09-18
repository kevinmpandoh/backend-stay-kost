import mongoose, {
  FilterQuery,
  Model,
  PopulateOptions,
  Types,
  UpdateQuery,
  UpdateResult,
} from "mongoose";

export class BaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findById(
    id: mongoose.Types.ObjectId | string,
    populateOptions?: PopulateOptions[]
  ): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const query = this.model.findById(id);
    if (populateOptions) {
      populateOptions.forEach((opt) => query.populate(opt));
    }
    return query;
  }

  async findOne(
    filter: FilterQuery<T>,
    populateOptions?: PopulateOptions[],
    options?: { sort?: Record<string, 1 | -1> }
  ): Promise<T | null> {
    let query = this.model.findOne(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }
    if (populateOptions) {
      populateOptions.forEach((opt) => query.populate(opt));
    }
    return query;
  }

  async findAll(
    filter: FilterQuery<T> = {},
    options?: { skip?: number; limit?: number; sort?: Record<string, 1 | -1> },
    populateOptions?: PopulateOptions[]
  ): Promise<T[]> {
    const sortOption = options?.sort ?? { updatedAt: -1 };
    const query = this.model.find(filter).sort(sortOption);

    if (options?.skip !== undefined) query.skip(options.skip);
    if (options?.limit !== undefined) query.limit(options.limit);

    if (populateOptions) {
      populateOptions.forEach((opt) => query.populate(opt));
    }

    return query;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async updateById(
    id: mongoose.Types.ObjectId | string,
    data: UpdateQuery<T>
  ): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async update(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>
  ): Promise<UpdateResult> {
    return await this.model.updateMany(filter, data);
  }

  async deleteById(
    id: mongoose.Types.ObjectId | string,
    session?: any
  ): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const query = this.model.findByIdAndDelete(id);
    if (session) query.session(session);
    return await query;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<{ deletedCount?: number }> {
    return this.model.deleteMany(filter);
  }
}
