const Wallet = require("../Models/WalletModel");


  const addMoney = async (req, res) => {
  try {
    const userId = req.params.userId;
    const amountToAdd = req.body.amount;

    if (!userId || !amountToAdd || isNaN(amountToAdd) || amountToAdd <= 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        amount: amountToAdd,
      });
    } else {
      wallet.amount += amountToAdd;
    }

    await wallet.save();

    return res.status(200).json({ message: "Funds added to the wallet successfully", wallet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

  const offerMoney = async (req, res) => {
  try {
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addMoney,
  offerMoney
}