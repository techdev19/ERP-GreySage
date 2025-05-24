const { Lot } = require('../mongodb_schema');

const getLotNumber = async (lotId) => {
  return await Lot.findById(lotId);
};

const createLot = async (req) => {
  const { lotNumber, invoiceNumber, orderId, date, description } = req;
  const respObj = {
    code: 100,
    lotObj: null,
    message: ''
  }

  // Validate required fields
  if (!lotNumber) {
    respObj.code = 100;
    respObj.message = 'lotNumber is required';
    return respObj;
  };
  if (!invoiceNumber) {
    respObj.code = 101;
    respObj.message = 'invoiceNumber is required';
    return respObj;
  }

  try {

    const lot = new Lot({
      lotNumber,
      invoiceNumber: parseInt(invoiceNumber),
      orderId,
      date,
      description,
      createdAt: new Date()
    });

    var res = await lot.save();
    respObj.code = 0;
    respObj.lotObj = res;
    respObj.message = 'success';
    // await logAction(req.user.userId, 'create_lot', 'Lot', lot._id, `Lot ${lotId} created`);
  } catch (error) {
    respObj.code = 500;
    respObj.message = 'failed to generate Lot - error code: ' + error.code;
  }
  return respObj;
}

module.exports = { getLotNumber, createLot };