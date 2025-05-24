const { Lot, Stitching, Washing, Finishing } = require('../mongodb_schema');

const getLotNumber = async (req, res) => {
    const { lotId } = req.body;
    const lot = await Lot.findById(lotId);
    res.json(lot);
};

const createLot = async (req, res) => {
    const { lotId, invoiceNumber, orderId, date, description } = req.body;

    // Validate required fields
    if (!lotId) return res.status(400).json({ error: 'Lot number is required' });
    if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number is required' });

    const lot = new Lot({
        lotId,
        invoiceNumber,
        orderId,
        date,
        description,
        createdAt: new Date()
    });

    try {
        await lot.save();
        //await logAction(req.user.userId, 'create_lot', 'Lot', lot._id, `Lot ${lotId} created`);
        res.status(201).json(lot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const searchByLotNumber = async (req, res) => {
  const { lotNumber, orderId } = req.query;
  try {
    const lot = await Lot.findOne({ lotNumber, orderId });
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }

    const [stitching, washing, finishing] = await Promise.all([
      Stitching.find({ lotId: lot._id }).populate('orderId vendorId lotId'),
      Washing.find({ lotId: lot._id }).populate('orderId vendorId lotId'),
      Finishing.find({ lotId: lot._id }).populate('orderId vendorId lotId'),
    ]);

    res.json({
      lot,
      stitching,
      washing,
      finishing,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchByInvoiceNumber = async (req, res) => {
  const { invoiceNumber, orderId } = req.query;
  try {
    const lot = await Lot.findOne({ invoiceNumber, orderId });
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }

    const [stitching, washing, finishing] = await Promise.all([
      Stitching.find({ lotId: lot._id }).populate('orderId vendorId lotId'),
      Washing.find({ lotId: lot._id }).populate('orderId vendorId lotId'),
      Finishing.find({ lotId: lot._id }).populate('orderId vendorId lotId'),
    ]);

    res.json({
      lot,
      stitching,
      washing,
      finishing,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getLotNumber, createLot, searchByLotNumber, searchByInvoiceNumber };