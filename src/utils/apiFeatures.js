import mongoose from "mongoose";

export class ApiFeatures {
  constructor(mongooseQuery, queryData) {
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }
  pagination = async () => {
    let { size, page } = this.queryData;
    if (page <= 0 || !page) page = 1;
    if (size <= 0 || !size) size = 5;
    const skip = size * (this.queryData.page - 1);
    const docsCount = await this.mongooseQuery.clone().count();
    this.mongooseQuery.skip(skip).limit(size);
    const totalPages = Math.ceil(docsCount / size) || 1;
    this.pagination = {
      docsCount,
      totalPages: totalPages || 1,
      page: page || 1,
    };
    return this;
  };
  filter = () => {
    const excluded = ["sort", "page", "size", "fields", "searchKey"];
    let queryFields = { ...this.queryData };
    excluded.forEach((ele) => {
      delete queryFields[ele];
    });
    queryFields = JSON.parse(
      JSON.stringify(queryFields).replace(
        /lte|lt|gte|gt/g,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery.find(queryFields);
    return this;
  };
  search = () => {
    if (this.queryData?.searchKey)
      this.mongooseQuery.find({
        $or: [
          { name: { $regex: this.queryData.searchKey } },
          { description: { $regex: this.queryData.searchKey } },
        ],
      });
    return this;
  };
  sort = () => {
    if (this.queryData?.sort)
      this.mongooseQuery.sort(this.queryData.sort.replace(/,/g, " "));
    return this;
  };
  select = () => {
    if (this.queryData?.fields)
      this.mongooseQuery.select(this.queryData.fields.replace(/,/g, " "));
    return this;
  };
}
