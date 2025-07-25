class ApiFeatures {
  constructor(mongooseQuery, queryStringObj) {
    this.mongooseQuery = mongooseQuery;
    this.queryStringObj = queryStringObj;
    this.filterObj = {};
  }

  filter() {
  const queryStringObj = { ...this.queryStringObj };
  const excludesFields = ["page", "limit", "sort", "fields", "keyword"];
  excludesFields.forEach((field) => delete queryStringObj[field]);

  // بناء فلتر جديد
  const filterObj = {};

  for (const key in queryStringObj) {
    if (key.includes("[")) {
      // key مثل "price[gt]"
      const [field, operator] = key.split(/\[|\]/).filter(Boolean);
      if (!filterObj[field]) filterObj[field] = {};
      filterObj[field]["$" + operator] = queryStringObj[key];
    } else {
      filterObj[key] = queryStringObj[key];
    }
  }

  this.filterObj = filterObj;
  this.mongooseQuery = this.mongooseQuery.find(this.filterObj);
  return this;
}


  // filter() {
  //   const queryStringObj = { ...this.queryStringObj };
  //   const excludesFields = ["page", "limit", "sort", "fields", "keyword"];
  //   excludesFields.forEach((field) => delete queryStringObj[field]);

  //   let queryStr = JSON.stringify(queryStringObj);
  //   queryStr = queryStr.replace(
  //     /\b(gte|gt|lte|lt|e)\b/g,
  //     (match) => `$${match}`
  //   );
  //   this.filterObj = JSON.parse(queryStr);

  //   this.mongooseQuery = this.mongooseQuery.find(this.filterObj);
  //   return this;
  // }

  getFilterObject() {
    return this.filterObj;
  }

sort() {
  if (this.queryStringObj.sort) {
    let sortValue = this.queryStringObj.sort;

    // ✅ إذا كانت Array: حوّلها إلى سلسلة مفصولة بفواصل
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

   search() {
  if (this.queryStringObj.keyword) {
    let keywords = this.queryStringObj.keyword;
     
    //edit hear
    // إذا كانت keyword مصفوفة، ندمجها في تعبير regex واحد (مثلاً: "riyadh|jeddah")
    if (Array.isArray(keywords)) {
      keywords = keywords.join("|"); // نجمع الكلمات مفصولة بـ "|"
    }

    const query = {
      $or: [
        { title: { $regex: keywords, $options: "i" } },
        { description: { $regex: keywords, $options: "i" } },
        { city: { $regex: keywords, $options: "i" } },
        { district: { $regex: keywords, $options: "i" } },
      ],
    };

    this.filterObj = { ...this.filterObj, ...query };
    this.mongooseQuery = this.mongooseQuery.find(this.filterObj);
  }
  return this;
}

  paginate(countDocuments) {
    const page = this.queryStringObj.page * 1 || 1;
    const limit = this.queryStringObj.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {
      currentPage: page,
      limit,
      numberOfPages: Math.ceil(countDocuments / limit),
    };

    if (endIndex < countDocuments) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
