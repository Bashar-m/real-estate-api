const City = require("../models/cityModle");
class ApiFeatures {
  constructor(mongooseQuery, queryStringObj) {
    this.mongooseQuery = mongooseQuery;
    this.queryStringObj = queryStringObj;
    this.filterObj = {}; // سيتم بناء الفلاتر هنا فقط
  }

  filter() {
    const queryStringObj = { ...this.queryStringObj };
    const excludesFields = ["skip", "limit", "sort", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    const filterObj = {};

    for (const key in queryStringObj) {
      if (key.includes("[")) {
        const [field, operator] = key.split(/\[|\]/).filter(Boolean);
        if (!filterObj[field]) filterObj[field] = {};
        filterObj[field]["$" + operator] = queryStringObj[key];
      } else {
        filterObj[key] = queryStringObj[key];
      }
    }

    this.filterObj = filterObj;
    return this;
  }

  search() {
    if (this.queryStringObj.keyword) {
      let keywords = this.queryStringObj.keyword;
      if (Array.isArray(keywords)) {
        keywords = keywords.join("|");
      }

      const searchQuery = {
        $or: [
          { title: new RegExp(keywords, "i") },
          { description: new RegExp(keywords, "i") },
          { category: new RegExp(keywords, "i") },
        ],
      };

      if (Object.keys(this.filterObj).length > 0) {
        this.filterObj = { $and: [this.filterObj, searchQuery] };
      } else {
        this.filterObj = searchQuery;
      }
    }
    return this;
  }

  //مشان اضمن تنفيذ (دوت فايند) مره واحده على الاقل
  applyFilters() {
    this.mongooseQuery = this.mongooseQuery.find(this.filterObj);
    return this;
  }

  sort() {
    if (this.queryStringObj.sort) {
      let sortValue = this.queryStringObj.sort;
      if (Array.isArray(sortValue)) {
        sortValue = sortValue.join(",");
      }
      const sortBy = sortValue.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitfields() {
    if (this.queryStringObj.fields) {
      const fields = this.queryStringObj.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  paginate(countDocuments) {
    const skip = this.queryStringObj.skip * 1 || 0;
    const limit = this.queryStringObj.limit * 1 || 50;

    const pagination = {
      limit,
      totalResult: countDocuments,
      skip,
    };

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    return this;
  }

  getFilterObject() {
    return this.filterObj;
  }

  cloneQuery() {
    return new ApiFeatures(this.mongooseQuery.clone(), {}).mongooseQuery;
  }
}

module.exports = ApiFeatures;
