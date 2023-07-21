const Product = require("../Models/productModel");
const slugify = require("slugify");
const User = require("../Models/distributorModel")

const createProduct = async (req, res) => {
  try {
    const { title, ...productData } = req.body;
    const slug = slugify(title);
    const newProduct = new Product({
      title,
      slug,
      ...productData
    });

    await newProduct.save();

    res.status(200).json({
      status: 200,
      message: "Product created successfully",
      data: newProduct
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: error.message
    });
  }
};

const getaProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json({
      status: 200,
      message: "Product found successfully",
      data: findProduct
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message
    });
  }
};

const getAllProduct = async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({
      status: 200,
      message: "Product updated successfully",
      data: updateProduct
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product not found"
      });
    }
    res.json({
      status: 200,
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Product could not be deleted",
      error: error.message
    });
  }
};

const addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const prodId = req.body._id;
console.log(userId, prodId);
  try {
    const user = await User.findById({ _id: userId, });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found"
      });
    }

    const alreadyAdded = user.wishlist.includes(prodId);
    if (alreadyAdded) {
      await User.findByIdAndUpdate(userId, {
        $pull: { wishlist: prodId }
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $push: { wishlist: prodId }
      });
    }

    const updatedUser = await User.findById(userId);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "An error occurred",
      error: error.message
    });
  }
};

module.exports = {
  addToWishlist
};


module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist
}

