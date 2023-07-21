const Category = require("../Models/productCategoryModel");
const validateMongoDbId = require("../utils/validateMongodbId");

const createCategory = async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.json({
      status: 200,
      message: "Category created successfully",
      data: newCategory
    });
  } catch (error) {
    res.json({
      status: 500,
      error: error.message
    })
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({
      status: 200,
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (error) {
    res.json({
      status: 500,
      error: error.message
    })
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    res.json({
      status: 200,
      message: "Category deleted successfully",
      data: deletedCategory
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const getCategory = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaCategory = await Category.findById(id);
    res.json({
      status: 200,
      message: "get a category successfully",
      data: getaCategory
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const getallCategory = async (req, res) => {
  try {
    const getallCategory = await Category.find();
    res.json({
      status: 200,
      message: "Get all categories successfully",
      data: getallCategory
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
};
