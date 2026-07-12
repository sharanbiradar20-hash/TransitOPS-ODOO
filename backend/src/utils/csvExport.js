const { Parser } = require('json2csv');

/**
 * Send data as a downloadable CSV file if ?export=csv is present in the query.
 * Otherwise returns false so the caller can respond with JSON.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Array} data - Array of objects to convert to CSV
 * @param {string} filename - Filename for the CSV download (without extension)
 * @param {Array} [fields] - Optional array of field names/configs for json2csv
 * @returns {boolean} true if CSV was sent, false if not (caller should send JSON)
 */
const sendCsvIfRequested = (req, res, data, filename, fields) => {
  if (req.query.export !== 'csv') {
    return false;
  }

  try {
    const opts = fields ? { fields } : {};
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.status(200).send(csv);
    return true;
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Internal server error generating CSV export.' });
    return true; // Already sent a response
  }
};

module.exports = {
  sendCsvIfRequested
};
