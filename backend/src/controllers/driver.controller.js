const prisma = require('../config/db');

// Get all drivers, optionally filtered by status
const getDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    const drivers = await prisma.driver.findMany({ where });
    return res.status(200).json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return res.status(500).json({ error: 'Internal server error fetching drivers.' });
  }
};

// Create a new driver
const createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiry || !contactNumber) {
      return res.status(400).json({ error: 'Fields name, licenseNumber, licenseCategory, licenseExpiry, and contactNumber are required.' });
    }

    // Check for unique license number
    const existingDriver = await prisma.driver.findUnique({
      where: { licenseNumber }
    });
    if (existingDriver) {
      return res.status(400).json({ error: 'Driver with this license number already exists.' });
    }

    const newDriver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry: new Date(licenseExpiry),
        contactNumber,
        safetyScore: safetyScore !== undefined ? Number(safetyScore) : 100,
        status: status || 'AVAILABLE'
      }
    });

    return res.status(201).json(newDriver);
  } catch (error) {
    console.error('Error creating driver:', error);
    return res.status(500).json({ error: 'Internal server error creating driver.' });
  }
};

// Update an existing driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = parseInt(id, 10);
    if (isNaN(driverId)) {
      return res.status(400).json({ error: 'Invalid driver ID format.' });
    }

    const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status } = req.body;

    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id: driverId }
    });
    if (!existingDriver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    // Check duplicate license number if it's being updated
    if (licenseNumber && licenseNumber !== existingDriver.licenseNumber) {
      const duplicateLicense = await prisma.driver.findUnique({
        where: { licenseNumber }
      });
      if (duplicateLicense) {
        return res.status(400).json({ error: 'Driver with this license number already exists.' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (licenseCategory !== undefined) updateData.licenseCategory = licenseCategory;
    if (licenseExpiry !== undefined) updateData.licenseExpiry = new Date(licenseExpiry);
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (safetyScore !== undefined) updateData.safetyScore = Number(safetyScore);
    if (status !== undefined) updateData.status = status;

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: updateData
    });

    return res.status(200).json(updatedDriver);
  } catch (error) {
    console.error('Error updating driver:', error);
    return res.status(500).json({ error: 'Internal server error updating driver.' });
  }
};

// Delete a driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = parseInt(id, 10);
    if (isNaN(driverId)) {
      return res.status(400).json({ error: 'Invalid driver ID format.' });
    }

    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id: driverId }
    });
    if (!existingDriver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    await prisma.driver.delete({
      where: { id: driverId }
    });

    return res.status(200).json({ message: 'Driver deleted successfully.' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return res.status(500).json({ error: 'Internal server error deleting driver.' });
  }
};

module.exports = {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver
};
