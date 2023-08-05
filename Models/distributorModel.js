const mongoose = require("mongoose"); 


var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    city: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
      // unique: true, 
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
    },
    userType: {
      type: String,
      default: "Distributor",
      enum: ["Distributor", "subDistributor", "Admin"]
    },
    address: {
      type: String,
    },
    pincode: {
      type: String,
    },
    sales: {
      type: Number,
      default: 0
    }, // Total sales made by the distributor
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: {
      type: Array,
      default: [],
    },
    active: {
      type: Boolean, default: false
    }, // Flag indicating if the distributor is active
    parentId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Distributor'
    }, 
    level: {
      type: Number,
      default: 1
    },
    leader: {
      type: Boolean,
      default: false,
    },
    Kutumbh: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'subDistributor'
    }]
  },
  {
    timestamps: true,
  }
);


userSchema.methods.getDirectChildren = async function () {
  const children = await this.model("User").find({ parentId: this._id });
  return children;
};


userSchema.methods.getLeafNodes = async function () {
  const leafNodes = await this.model("User").find({ parentId: this._id, Kutumbh: [] });
  return leafNodes;
};


userSchema.methods.getSiblings = async function () {
  const siblings = await this.model("User").find({ parentId: this.parentId, _id: { $ne: this._id } });
  return siblings;
};


module.exports = mongoose.model("User", userSchema);

