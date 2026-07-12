const prisma = require('../config/db');

// Get all vehicles, optionally filtered by status, type, and region
const getVehicles = async (req, res) => {
  try {
    const { status, type, region } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (region) {
      where.region = region;
    }

    const vehicles = await prisma.vehicle.findMany({ where });
    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ error: 'Internal server error fetching vehicles.' });
  }
};

// Get distinct vehicle regions
const getRegions = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        region: true
      }
    });
    
    // Get unique, non-null, non-blank values
    const distinctRegions = [...new Set(
      vehicles
        .map(v => v.region)
        .filter(r => r !== null && r !== undefined && String(r).trim() !== '')
    )];

    return res.status(200).json(distinctRegions);
  } catch (error) {
    console.error('Error fetching distinct regions:', error);
    return res.status(500).json({ error: 'Internal server error fetching distinct regions.' });
  }
};

// Create a new vehicle
const createVehicle = async (req, res) => {
  try {
    const { regNumber, nameModel, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

    if (!regNumber || !nameModel || !type || maxLoadCapacity === undefined || acquisitionCost === undefined || !region) {
      return res.status(400).json({ error: 'Fields regNumber, nameModel, type, maxLoadCapacity, acquisitionCost, and region are required.' });
    }

    // Check for unique registration number
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { regNumber }
    });
    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle with this registration number already exists.' });
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        regNumber,
        nameModel,
        type,
        maxLoadCapacity: Number(maxLoadCapacity),
        odometer: odometer !== undefined ? Number(odometer) : 0,
        acquisitionCost: Number(acquisitionCost),
        status: status || 'AVAILABLE',
        region
      }
    });

    return res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return res.status(500).json({ error: 'Internal server error creating vehicle.' });
  }
};

// Update an existing vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleId = parseInt(id, 10);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: 'Invalid vehicle ID format.' });
    }

    const { regNumber, nameModel, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    // Check duplicate regNumber if it's being updated
    if (regNumber && regNumber !== existingVehicle.regNumber) {
      const duplicateReg = await prisma.vehicle.findUnique({
        where: { regNumber }
      });
      if (duplicateReg) {
        return res.status(400).json({ error: 'Vehicle with this registration number already exists.' });
      }
    }

    const updateData = {};
    if (regNumber !== undefined) updateData.regNumber = regNumber;
    if (nameModel !== undefined) updateData.nameModel = nameModel;
    if (type !== undefined) updateData.type = type;
    if (maxLoadCapacity !== undefined) updateData.maxLoadCapacity = Number(maxLoadCapacity);
    if (odometer !== undefined) updateData.odometer = Number(odometer);
    if (acquisitionCost !== undefined) updateData.acquisitionCost = Number(acquisitionCost);
    if (status !== undefined) updateData.status = status;
    if (region !== undefined) updateData.region = region;

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return res.status(500).json({ error: 'Internal server error updating vehicle.' });
  }
};

// Delete a vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleId = parseInt(id, 10);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: 'Invalid vehicle ID format.' });
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId }
    });

    return res.status(200).json({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({ error: 'Internal server error deleting vehicle.' });
  }
};

module.exports = {
  getVehicles,
  getRegions,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
