const prisma = require('../config/db');
const { updateVehicleStatus } = require('../utils/statusTransition');

// Get all maintenance records, filterable by vehicleId or status
const getMaintenanceRecords = async (req, res) => {
  try {
    const { vehicleId, status } = req.query;
    const where = {};

    if (vehicleId) {
      where.vehicleId = parseInt(vehicleId, 10);
    }
    if (status) {
      where.status = status;
    }

    const records = await prisma.maintenanceLog.findMany({
      where,
      include: {
        vehicle: { select: { id: true, regNumber: true, nameModel: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return res.status(500).json({ error: 'Internal server error fetching maintenance records.' });
  }
};

// Create a new maintenance record, sets vehicle status to IN_SHOP
const createMaintenanceRecord = async (req, res) => {
  try {
    const { vehicleId, issueDescription } = req.body;

    if (!vehicleId || !issueDescription) {
      return res.status(400).json({ error: 'Fields vehicleId and issueDescription are required.' });
    }

    const vehicleIdNum = parseInt(vehicleId, 10);
    if (isNaN(vehicleIdNum)) {
      return res.status(400).json({ error: 'Invalid vehicleId format.' });
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleIdNum } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    // Create maintenance record with status OPEN
    const record = await prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicleIdNum,
        issueDescription,
        status: 'OPEN'
      }
    });

    // Set vehicle status to IN_SHOP
    await updateVehicleStatus(vehicleIdNum, 'IN_SHOP');

    return res.status(201).json(record);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return res.status(500).json({ error: 'Internal server error creating maintenance record.' });
  }
};

// Close a maintenance record, restore vehicle to AVAILABLE (unless RETIRED)
const closeMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const recordId = parseInt(id, 10);
    if (isNaN(recordId)) {
      return res.status(400).json({ error: 'Invalid maintenance record ID format.' });
    }

    // Find the maintenance record
    const record = await prisma.maintenanceLog.findUnique({ where: { id: recordId } });
    if (!record) {
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }

    if (record.status === 'CLOSED') {
      return res.status(400).json({ error: 'Maintenance record is already closed.' });
    }

    // Update record status to CLOSED and set closedAt
    const updatedRecord = await prisma.maintenanceLog.update({
      where: { id: recordId },
      data: {
        status: 'CLOSED',
        closedAt: new Date()
      }
    });

    // Restore vehicle status to AVAILABLE (unless it's RETIRED)
    const vehicle = await prisma.vehicle.findUnique({ where: { id: record.vehicleId } });
    if (vehicle && vehicle.status !== 'RETIRED') {
      await updateVehicleStatus(record.vehicleId, 'AVAILABLE');
    }

    return res.status(200).json(updatedRecord);
  } catch (error) {
    console.error('Error closing maintenance record:', error);
    return res.status(500).json({ error: 'Internal server error closing maintenance record.' });
  }
};

module.exports = {
  getMaintenanceRecords,
  createMaintenanceRecord,
  closeMaintenanceRecord
};
