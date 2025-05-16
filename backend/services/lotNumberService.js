const { Stitching } = require('../mongodb_schema');

const generateLotNumber = async (orderId, startBatch, endBatch) => {
  const lastLot = await Stitching.findOne({ orderId }).sort({ createdAt: -1 });
  let series = 'A';
  let lastEndBatch = 0;
  if (lastLot) {
    const [lastSeries, , lastEnd] = lastLot.lotNumber.split('/');
    lastEndBatch = parseInt(lastEnd || lastSeries.split('/')[1]);
    if (lastEndBatch >= 100) {
      series = String.fromCharCode(lastSeries.charCodeAt(0) + 1);
      lastEndBatch = 0;
    } else {
      series = lastSeries;
    }
  }
  const newStart = startBatch || lastEndBatch + 1;
  const lotNumber = endBatch ? `${series}/${newStart}/${endBatch}` : `${series}/${newStart}`;
  return lotNumber;
};

module.exports = { generateLotNumber };