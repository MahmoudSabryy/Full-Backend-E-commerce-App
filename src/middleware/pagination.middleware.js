const pagination = (model) => async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;
    const skip = limit * (page - 1);
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "desc" ? -1 : 1;

    const [results, total] = await Promise.all([
      model
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: order }),
      model.countDocuments(),
    ]);

    res.paginatedResults = {
      page,
      limit,
      skip,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      itemsPerPage: results,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export default pagination;
