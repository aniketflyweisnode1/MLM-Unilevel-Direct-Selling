const User = require("../Models/distributorModel");
const OTP = require("../Config/OTP-Generate");
const Cart = require("../Models/CartModel");
const Product = require("../Models/productModel");
const bcrypt = require("bcryptjs");
const validateMongoDbId = require("../utils/validateMongodbId");
const Coupon = require("../Models/CouponModel");
const Wallet = require("../Models/WalletModel");

const createUser = async (req, res) => {
  const { name, email, mobile, password, address, pincode, city } = req.body;
  const errors = [];
  try {
    const findUser = await User.findOne({ email: email, userType: "Distributor" });
    if (mobile) {
      const existingMobile = await User.findOne({ mobile, userType: "Distributor" });
      if (existingMobile) {
        errors.push("Mobile already in use");
      }
    }
    // Check if password is strong enough
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)) {
      errors.push("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = OTP.generateOTP();
    if (!findUser) {
      const newUser = await User.create({
        name: name,
        email: email,
        mobile: mobile,
        password: hashedPassword,
        address: address,
        pincode: pincode,
        city: city,
        otp: otp,
        userType: "Distributor"
      });

      newUser.save();

      const newWallet = new Wallet({
        user: newUser._id,
      });
      await newWallet.save();

      res.status(201).json({
        message: "Registration susscessfully",
        status: 200,
        data: newUser,
        otp: otp
      })
    } else {
      throw new Error("Distrubutor Already Exists");
    }
  } catch (error) {
    res.json({
      status: 500,
      message: error.message
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.json({ status: 400, message: "Please Enter Email & Password" })
    }
    const user = await User.findOne({ email: email,/*  userType: "Distributor" */ })/* .select("+password"); */

    if (!user) {
      return res.json({ status: 401, message: "Invalid email or password" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const otp = OTP.generateOTP();
    const token = OTP.generateJwtToken(user._id);

    res.json({
      status: 200,
      message: "Login successfully",
      token: token,
      data: user,
      otp: otp
    })
  } catch (error) {
    console.log(error.message);
    return res.json({ status: 500, message: error.message })
  }
};

const verifyOtp = async (req, res) => {
  try {
    const data = await User.findOne({ otp: req.body.otp });
    if (!data) {
      return res.status(401).json({
        message: "Your Otp is Wrong",
      });

    } else {
      // const accessToken = otpService.generateOTP(data._id.toString());
      const now = Date.now();
      if (data.otpCreatedAt < now - 60 * 1000) {
        return res.status(403).json({
          message: "OTP has expired",
        });
      }
      res.status(200).json({
        success: true,
        message: "OTP Verified Successfully",
        // accessToken: accessToken,
        userId: data._id,
      });
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const getallUser = async (req, res) => {
  try {
    const getUsers = await User.find()/* .populate("wishlist") */;
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
};

const getaUser = async (req, res) => {
  const { id } = req.params;

  try {
    const getaUser = await User.findById(id);
    res.json({
      status: 200,
      message: "User get successfully",
      data: getaUser,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message
    })
  }
};

const UpdateUser = async (req, res) => {
  // const { id } = req.params;
  const id = req.user._id
  validateMongoDbId(id)
  const { name, email, mobile, password, address, pincode, city } = req.body;
  try {
    const UpdateUser = await User.findByIdAndUpdate(id, {
      name, email, mobile, password, address, pincode, city
    }, { new: true });
    res.json({
      status: 200,
      message: "Distributor updated successfully",
      data: UpdateUser,
    });
  } catch (error) {
    res.json({ status: 500, message: error.message });
  }
};

const deleteaUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const UserCart = async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  try {
    const user = await User.findById(_id);
    // check if user already has products in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      await Cart.deleteOne({ _id: alreadyExistCart._id });
      return res.json("Cart deleted successfully");
    }

    let products = [];
    let cartTotal = 0; // Initialize cartTotal variable

    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.colour = cart[i].colour;

      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);

      cartTotal += object.price * object.count; // Update cartTotal for each product
    }

    const newCart = new Cart({
      products: products,
      cartTotal: cartTotal,
      orderby: user._id,
    });

    await newCart.save();

    res.json({
      status: 200,
      message: "Product cart successfully updated",
      data: newCart
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const getUserCart = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product" /*  "_id title price totalAfterDiscount" */
    );
    res.json({
      status: 200,
      message: "User Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const emptyCart = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json({
      status: 200,
      message: "Empty Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const addTeammateDistributor = async (req, res) => {
  const { distributorId, teammateId } = req.body;

  try {
    const distributor = await User.findById(distributorId);

    if (!distributor) {
      return res.status(404).json({ success: false, message: "Distributor not found." });
    }

    if (!distributor.active) {
      return res.status(400).json({ success: false, message: "Only active distributors can add teammates." });
    }

    if (distributor.teamMembers.length >= 10) {
      return res.status(400).json({ success: false, message: "Maximum number of teammates reached." });
    }

    const teammateDistributor = await User.findById(teammateId);

    if (!teammateDistributor) {
      return res.status(404).json({ success: false, message: "Teammate distributor not found." });
    }


    if (teammateDistributor.parentId) {
      return res.status(400).json({ success: false, message: "Teammate distributor already has a parent." });
    }

    if (distributor.chainLevel >= 2) {
      return res.status(400).json({ success: false, message: "Maximum chain level reached." });
    }

    teammateDistributor.parentId = distributor._id;
    teammateDistributor.chainLevel = distributor.chainLevel + 1;

    await teammateDistributor.save();

    distributor.teamMembers.push(teammateId);
    await distributor.save();

    return res.status(200).json({ success: true, message: "Teammate added successfully." });
  } catch (error) {
    console.error("Error adding teammate distributor:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const applyCoupon = async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  console.log(validCoupon);
  if (validCoupon === null) {
    return res.json("Invalid coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json({ totalAfterDiscount })
};

const getTeamMembers = async (req, res) => {
  const { parentId } = req.params;
  console.log(parentId);
  try {
    const distributor = await User.findById(parentId);

    if (!distributor) {
      return res.status(404).json({ success: false, message: "Distributor not found." });
    }

    const teamMembers = distributor.teamMembers;

    return res.status(200).json({ success: true, teamMembers });
  } catch (error) {
    console.error("Error getting team members:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getTeamMembersCount = async (req, res) => {
  try {
    const distributorId = req.params.id;
    const distributor = await User.findById(distributorId).populate({
      path: 'teamMembers',
      select: 'name email',
      model: 'User'
    });

    if (!distributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }

    const teamMembers = distributor.teamMembers.map((member) => ({
      id: member._id,
      name: member.name,
    }))

    res.status(200).json({
      TeamMember: teamMembers.length,
      message: "Your Team Members",
      data: teamMembers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const AddTeamMemberByDistributor = async (req, res) => {
  try {
    const distributorId = req.params.id;
    const subDistributorData = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
      address: req.body.address,
      pincode: req.body.pincode,
      city: req.body.city,
    };
    const distributor = await User.findById(distributorId);

    if (!distributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }

    if (distributor.level > 1 && distributor.Kutumbh.length >= 10) {
      if (distributor.sales < 25000) {
        distributor.level = distributor.level - 1;
        await distributor.save();
        return res
          .status(400)
          .json({ message: "Distributor level decreased due to sales drop" });
      } else {
        return res
          .status(400)
          .json({
            message:
              "Distributor cannot have more than 10 subdistributors unless sales are below 25K",
          });
      }
    }

    if (distributor.level === 1 && distributor.Kutumbh.length >= 10) {
      return res.status(400).json({
        message: "Distributor cannot have more than 10 subdistributors",
      });
    }

    // Create a new User document for the subDistributor
    const hashedPassword = await bcrypt.hash(subDistributorData.password, 10);
    const subDistributor = new User({
      ...subDistributorData,
      password: hashedPassword,
      parentId: distributor._id,
    });


    await subDistributor.save();

    const newWallet = new Wallet({
      user: subDistributor._id,
    });
    await newWallet.save();

    subDistributor.parentId = distributor._id;
    await subDistributor.save();

    // Push the ObjectId of the new subDistributor into the teamMembers array
    distributor.Kutumbh.push(subDistributor._id);
    distributor.level = distributor.level + 1;

    if (distributor.Kutumbh.length >= 5) {
      distributor.leader = true;
    }

    await distributor.save();

    res.status(201).json({
      message: "Subdistributor added successfully",
      data: subDistributor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const ForgetPassword = async (req, res) => {
  const { mobile } = req.body;
  try {
    const user = await User.findOne({ mobile }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "Number not found" });
    }
    const otp = OTP.generateOTP();
    user.otp = otp;
    await user.save();
    // await twilioClient.messages.create({
    //   body: `Your OTP for password reset is: ${otp}`,
    //   from: "YOUR_TWILIO_PHONE_NUMBER",
    //   to: user.mobile,
    // });
    res.json({ message: "OTP sent successfully", otp: otp });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ errors: error });
  }
};

const resetPasswordOTP = async (req, res) => {
  const { mobile, otp, password } = req.body;

  try {
    const user = await User.findOne({ mobile, otp: otp });

    if (!user) {
      return res.status(404).json({ message: "Invalid OTP or mobile number" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    await user.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const otp = OTP.generateOTP();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { otp: otp },
      { new: true }
    );
    console.log(user);
    if (!user) {
      return res.status(401).json({
        message: "No User Found ",
      });
    } else {
      // const data = await sendSMS(user.mobile, otp);
      res.status(200).json({
        message: "OTP is Send ",
        otp: otp,
        data: user.email,
      });
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const leader = async (req, res) => {
  const { userId } = req.body;

  try {
    // Calculate the turnover for the given userId
    const turnover = await calculateTurnover(userId);

    // Find the user based on the given userId
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Determine if the user is a leader
    const isLeader = turnover >= 25;

    // Update the user's 'leader' field
    user.leader = isLeader;
    await user.save();

    res.json({
      status: 200,
      message: 'Leader status and turnover calculated successfully',
      data: {
        userId: user._id,
        leader: user.leader,
        turnover,
      },
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const getleader = async (req, res) => {
  const { userId } = req.params;

  try {
    // Calculate the turnover for the given userId
    const turnover = await calculateTurnover(userId);

    // Find the user based on the given userId
    const user = await User.findById(userId).populate('teamMembers');

    if (!user) {
      throw new Error('User not found');
    }

    // Determine if the user is a leader
    const isLeader = turnover >= 25;

    res.json({
      status: 200,
      message: 'Distributor details fetched successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        mobile: user.mobile,
        userType: user.userType,
        address: user.address,
        pincode: user.pincode,
        sales: user.sales,
        leader: isLeader,
        turnover,
        teamMembers: user.teamMembers,
      },
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};


const childBranches = async (req, res) => {
  try {
    const distributorId = req.params.userId;
    const downline = await getDownline(distributorId);
    res.status(200).json(downline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getdownline = async (req, res) => {
  try {
    const distributorId = req.params.id;
    const distributor = await User.findOne({ _id: distributorId });
    let downlineMembers = [];

    const { type } = req.query;
    switch (type) {
      case "direct-children":
        downlineMembers = await distributor.getDirectChildren();
        break;
      case "leaf-nodes":
        downlineMembers = await distributor.getLeafNodes();
        break;
      case "siblings":
        downlineMembers = await distributor.getSiblings();
        break;
      default:
        res.status(400).json({ error: "Invalid downline type specified in query parameters" });
        return;
    }

    res.status(200).json({
      message: `Your Downline (${type})`,
      totalMembers: downlineMembers.length,
      downlineMembers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function countMembers(distributorId) {
  return User.findById(distributorId).then((distributor) => {
    if (!distributor) {
      return 0;
    }
    let memberCount = 0;
    if (distributor.Kutumbh.length === 2) {
      memberCount = 1;
    }
    return Promise.all(distributor.Kutumbh.map((subDistributorId) => countMembers(subDistributorId))).then((counts) => {
      return memberCount + counts.reduce((acc, count) => acc + count, 0);
    });
  });
}

const distributorKutumbh = async (req, res) => {
  try {
    const distributors = await User.find();

    const result = await Promise.all(
      distributors.map(async (distributor) => {
        const memberCount = await countMembers(distributor.id);
        const kutumbhCount = distributor.Kutumbh.length;

        return {
          distributorId: distributor.id,
          memberCount,
          kutumbhCount,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

function countKutumbhMembers(distributorId) {
  return User.countDocuments({ parentId: distributorId }).exec()
    .then((count) => {
      return count;
    })
    .catch((err) => {
      console.error("Error counting kutumbh members:", err);
      throw err;
    });
}

function getTreeHeightAndDepth(distributorId, depth = 0) {
  return User.find({ parentId: distributorId }).exec()
    .then((children) => {
      if (children.length === 0) {
        return { height: depth, depth: depth };
      }

      let promises = children.map((child) => {
        return getTreeHeightAndDepth(child._id, depth + 1);
      });

      return Promise.all(promises)
        .then((results) => {
          const maxHeight = Math.max(...results.map((res) => res.height));
          const maxDepth = Math.max(...results.map((res) => res.depth));
          return { height: maxHeight, depth: maxDepth };
        });
    })
    .catch((err) => {
      console.error("Error calculating tree height and depth:", err);
      throw err;
    });
}

function countAvailableKutumbhs(distributorId) {
  return User.countDocuments({ parentId: distributorId }).exec()
    .then((count) => {
      return count;
    })
    .catch((err) => {
      console.error("Error counting available kutumbhs:", err);
      throw err;
    });
}

const kutumbhMembers = async (req, res) => {
  const distributorId = req.params.distributorId;
  try {
    const count = await countKutumbhMembers(distributorId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Error counting kutumbh members" });
  }
};

const kutumbhTree = async (req, res) => {
  const distributorId = req.params.distributorId;
  try {
    const { height, depth } = await getTreeHeightAndDepth(distributorId);
    res.json({ height, depth });
  } catch (err) {
    res.status(500).json({ error: "Error calculating tree height and depth" });
  }
}

const kutumbhAvailable = async (req, res) => {

  const distributorId = req.params.distributorId;
  try {
    const count = await countAvailableKutumbhs(distributorId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Error counting available kutumbhs" });
  }
};

module.exports = {
  createUser,
  loginUser,
  getallUser,
  getaUser,
  UpdateUser,
  deleteaUser,
  UserCart,
  getUserCart,
  emptyCart,
  addTeammateDistributor,
  applyCoupon,
  getTeamMembers,
  AddTeamMemberByDistributor,
  getTeamMembersCount,
  ForgetPassword,
  resetPasswordOTP,
  verifyOtp,
  resendOtp,
  childBranches,
  leader,
  getleader,
  getdownline,
  distributorKutumbh,
  kutumbhMembers,
  kutumbhAvailable,
  kutumbhTree
}


















