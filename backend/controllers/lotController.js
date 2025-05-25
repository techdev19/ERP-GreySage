const { Lot, Stitching, Washing, Finishing } = require('../mongodb_schema');

const getLotNumber = async (req, res) => {
  const { lotId } = req.body;
  try {
    const lot = await Lot.findById(lotId);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    res.json(lot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createLot = async (req, res) => {
  const { lotNumber, invoiceNumber, orderId, date, description } = req.body;

  // Validate required fields
  if (!lotNumber) return res.status(400).json({ error: 'Lot number is required' });
  if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number is required' });

  try {
    // Validate invoiceNumber as a number
    const parsedInvoiceNumber = parseInt(invoiceNumber, 10);
    if (isNaN(parsedInvoiceNumber)) {
      return res.status(400).json({ error: 'Invoice number must be a valid number' });
    }

    const lot = new Lot({
      lotNumber,
      invoiceNumber: parsedInvoiceNumber,
      orderId,
      date: date,
      description,
      createdAt: new Date(),
    });

    await lot.save();
    // await logAction(req.user.userId, 'create_lot', 'Lot', lot._id, `Lot ${lotNumber} created`);
    res.status(201).json(lot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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
    const parsedInvoiceNumber = parseInt(invoiceNumber, 10);
    if (isNaN(parsedInvoiceNumber)) {
      return res.status(400).json({ error: 'Invoice number must be a valid number' });
    }

    const lot = await Lot.findOne({ invoiceNumber: parsedInvoiceNumber, orderId });
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