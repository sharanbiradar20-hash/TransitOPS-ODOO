const prisma = require('../config/db');

// Get all dashboard KPIs
const getKpis = async (req, res) => {
  try {
    const { region } = req.query;
    const vehicleWhere = {};
    if (region) {
      vehicleWhere.region = region;
    }

    // Run counting queries concurrently for optimization
    const [
      totalVehicles,
      availableVehicles,
      maintenanceVehicles,
      onTripVehicles,
      driversOnDuty
    ] = await Promise.all([
      prisma.vehicle.count({ where: vehicleWhere }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: 'IN_SHOP' } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: 'ON_TRIP' } }),
      prisma.driver.count({ where: { status: 'ON_TRIP' } })
    ]);

    // Calculate utilization percentage: (ON_TRIP vehicles / total vehicles) * 100
    let fleetUtilization = 0.00;
    if (totalVehicles > 0) {
      fleetUtilization = (onTripVehicles / totalVehicles) * 100;
    }

    // Format utilization to 2 decimal places
    const fleetUtilizationFormatted = parseFloat(fleetUtilization.toFixed(2));

    return res.status(200).json({
      totalVehicles,
      availableVehicles,
      maintenanceVehicles, // IN_SHOP status
      driversOnDuty,      // ON_TRIP status
      fleetUtilization: fleetUtilizationFormatted
    });
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    return res.status(500).json({ error: 'Internal server error fetching dashboard KPIs.' });
  }
};

module.exports = {
  getKpis
};
