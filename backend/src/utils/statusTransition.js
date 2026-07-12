const prisma = require('../config/db');

/**
 * Update the status of a vehicle by its ID.
 * Used when dispatching/completing trips to toggle vehicle availability.
 *
 * @param {number} vehicleId - The ID of the vehicle to update
 * @param {string} newStatus - The new status (AVAILABLE, ON_TRIP, IN_SHOP, RETIRED)
 * @returns {Promise<object>} The updated vehicle record
 */
const updateVehicleStatus = async (vehicleId, newStatus) => {
  const updatedVehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: newStatus }
  });
  return updatedVehicle;
};

/**
 * Update the status of a driver by their ID.
 * Used when dispatching/completing trips to toggle driver availability.
 *
 * @param {number} driverId - The ID of the driver to update
 * @param {string} newStatus - The new status (AVAILABLE, ON_TRIP, OFF_DUTY, SUSPENDED)
 * @returns {Promise<object>} The updated driver record
 */
const updateDriverStatus = async (driverId, newStatus) => {
  const updatedDriver = await prisma.driver.update({
    where: { id: driverId },
    data: { status: newStatus }
  });
  return updatedDriver;
};

module.exports = {
  updateVehicleStatus,
  updateDriverStatus
};
