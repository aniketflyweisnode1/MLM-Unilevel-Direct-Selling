const Order = require("../Models/orderModel");
const User = require("../Models/distributorModel");
const Cart = require("../Models/CartModel");
const Product = require("../Models/productModel");
const Wallet = require("../Models/WalletModel")
const uniqid = require("uniqid");

const validateMongoDbId = require("../utils/validateMongodbId");

const getOrder = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userOrders = await Order.findOne({ orderby: _id }).populate(
      "products.product"
    ).exec();
    res.json({
      status: 200,
      message: "Get Order Successfully",
      data: userOrders
    });
  } catch (error) { }
};

const createOrder = async (req, res) => {
  const { COD, couponApplied, orderStatus } = req.body;
   const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    if (!COD) throw new Error("Create cash order failed");

    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmount = 0;

    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }
    console.log(`final Amount = ${finalAmount}`);

    // Calculate GST amount
    const gstPercentage = 18;
    const gstAmount = (finalAmount * gstPercentage) / 100;
    lessGstfinalAmount = (finalAmount-gstAmount);
    console.log(`GST final Amount = ${lessGstfinalAmount}`)//5000 - 4100 = 900

    // cost price (75% of the amount)
    const costPricePercentage = 75; 
    const costPriceAmount = (lessGstfinalAmount * costPricePercentage) / 100;
    console.log(`cost price amount ${costPriceAmount}`) //3075
   
    // Calculate distributor's amount (over all margin 20.5%)
    const OverAllMarginPercentage = 20.5;
    const OverAllMarginAmount = (finalAmount * OverAllMarginPercentage) / 100;
    console.log(`Over all Margin Amount = ${OverAllMarginAmount}`)


    // Calculate company's margin amount (4.10%)
    const companyMarginPercentage = 4.10;
    const companyMarginAmount = (finalAmount * companyMarginPercentage) / 100;
    console.log(`company margin = ${companyMarginAmount}`)

    // Balance to distribute (16.40%)
    const balanceToDistributePercentage = 16.40;
    let balanceToDistribute = (finalAmount * balanceToDistributePercentage) / 100;
    console.log(`balance To Distribute Amount = ${balanceToDistribute}`)


    // Get the distributor's level
    const distributorLevel = user.level;

    // Distributor's amount based on their level
    if (distributorLevel <= 10) {
      // Define the level-wise percentages and calculate the amount
      const levelWisePercentage = [35, 20, 10, 8, 7, 6, 5, 4, 3, 2];
      balanceToDistribute *= levelWisePercentage[distributorLevel - 1] / 100;
      console.log(`levelWisePercentage = ${levelWisePercentage[distributorLevel - 1] / 100}`)
    }
    // console.log(`distributor Amount = ${distributorAmount}`)

    if (user.parentId) {
      // Fetch the parent's wallet and add the distributor's amount to it
      const parent = await User.findById(user.parentId);
      console.log(`parent = ${parent.name}`);
      if (parent) {
        const parentWallet = await Wallet.findOne({ user: parent._id });
        if (parentWallet) {
          parentWallet.amount += distributorAmount;
          await parentWallet.save();
        } else {
          const newParentWalletEntry = new Wallet({
            user: parent._id,
            amount: distributorAmount,
          });
          await newParentWalletEntry.save();
        }
      }
    }

    // Save the updated user data to the database
    user.wallet += distributorAmount;
    user.sales += finalAmount;
    await user.save();

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: orderStatus,
        created: Date.now(),
        currency: "usd",
      },
      orderby: user._id,
      orderStatus: orderStatus,
      distributorAmount: distributorAmount,
    });

    newOrder.save();

    // Update product quantities and sold count
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});

    res.json({
      status: 200,
      message: "Order successfully",
      data: newOrder,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};


module.exports = {
  createOrder,
  getOrder,
};




























