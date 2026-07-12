const prisma = require('../config/db');

// Validate trip creation business rules
const validateTripCreation = async (req, res, next) => {
  try {
    const { vehicleId, driverId, cargoWeight } = req.body;

    // Fetch the selected vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(vehicleId) }
    });
    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found.' });
    }

    // Fetch the selected driver
    const driver = await prisma.driver.findUnique({
      where: { id: Number(driverId) }
    });
    if (!driver) {
      return res.status(400).json({ error: 'Driver not found.' });
    }

    // 1. cargoWeight must not exceed the selected vehicle's maxCapacity
    const cargoWeightNum = Number(cargoWeight);
    const maxCapacity = Number(vehicle.maxLoadCapacity);
    if (cargoWeightNum > maxCapacity) {
      return res.status(400).json({ error: `Cargo weight (${cargoWeightNum}kg) exceeds vehicle's max capacity (${maxCapacity}kg).` });
    }

    // 2. Selected driver's licenseExpiry must not be in the past, and status must not be "Suspended"
    const now = new Date();
    if (new Date(driver.licenseExpiry) < now) {
      return res.status(400).json({ error: `Driver's license expired on ${driver.licenseExpiry.toISOString().split('T')[0]}. Cannot assign to trip.` });
    }
    if (driver.status === 'SUSPENDED') {
      return res.status(400).json({ error: 'Driver is currently suspended and cannot be assigned to a trip.' });
    }

    // 3. Selected vehicle's status must be "Available"
    if (vehicle.status !== 'AVAILABLE') {
      return res.status(400).json({ error: `Vehicle is currently '${vehicle.status}' and must be 'AVAILABLE' to be assigned to a trip.` });
    }

    // 4. Selected driver's status must be "Available"
    if (driver.status !== 'AVAILABLE') {
      return res.status(400).json({ error: `Driver is currently '${driver.status}' and must be 'AVAILABLE' to be assigned to a trip.` });
    }

    // All validations passed
    next();
  } catch (error) {
    console.error('Error in trip validation:', error);
    return res.status(500).json({ error: 'Internal server error during trip validation.' });
  }
};

module.exports = {
  validateTripCreation
};
