module.exports = class {
    // mongoose query, express queryStr
    constructor(query, requestQueryObj) {
        this.query = query;
        this.requestQueryObj = requestQueryObj;
    }

    filter() {
        const queryObj = { ...this.requestQueryObj }; // creates a copy

        const excludedFields = ['page', 'sort', 'limit', 'fields']; // removes other fields
        excludedFields.forEach((el) => delete queryObj[el]);

        // GET /api/v1/tours?duration[gte]=5&difficulty=easy&page=2
        // { duration: { gte: '5' }, difficulty: 'easy' }
        // Actual MongoDB query => { duration: { $gte: 5 }, difficulty: 'easy' }

        //! Advance Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|lte|gt|lt)\b/g,
            (match) => `$${match}`
        ); // Use regex to replace lt, gt, lte, gte with $lt, $gt, $lte, $gte

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        if (this.requestQueryObj.sort) {
            // GET /api/v1/tours?sort=-price,ratingsAverage
            const sortBy = this.requestQueryObj.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // default (no sort field in queryStr)
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.requestQueryObj.fields) {
            // GET /api/v1/tours?fields=-name,-duration
            const fields = this.requestQueryObj.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        // GET /api/v1/tours?page=2&limit=10
        // (1-10) Page 1, (11-20) Page 2
        // so to get page 2 with 10 results per page, we need to skip 10 results before actually querying and reaching 11th result
        const page = this.requestQueryObj.page * 1 || 1;
        const limit = this.requestQueryObj.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
};
