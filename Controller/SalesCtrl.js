const Sale = require("../Models/SalesModel");


const CreateSales = async (req, res) => {
  try {
    const { distributorId, amount, bv } = req.body;

    const sale = new Sale({
      distributor: distributorId,
      amount,
      bv,
    });

    await sale.save();

    // Update the total sales made by the distributor
    await Distributor.findByIdAndUpdate(distributorId, { $inc: { sales: amount } });

    res.status(201).json({ message: 'Sale added successfully' });
  } catch (error) {
    console.error('Failed to add sale', error);
    res.status(500).json({ error: 'Failed to add sale' });
  }
};


module.exports = {
  CreateSales
}