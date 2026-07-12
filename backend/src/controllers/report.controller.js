const prisma = require('../config/db');
const { sendCsvIfRequested } = require('../utils/csvExport');

// GET /api/reports/fuel-efficiency
// For each vehicle, calculate total actualDistance (from completed trips) / total liters (from fuel logs)
const getFuelEfficiencyReport = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        regNumber: true,
        nameModel: true
      }
    });

    const report = await Promise.all(
      vehicles.map(async (vehicle) => {
        // Sum actualDistance from completed trips for this vehicle
        const tripResult = await prisma.trip.aggregate({
          where: {
            vehicleId: vehicle.id,
            status: 'COMPLETED',
            actualDistance: { not: null }
          },
          _sum: { actualDistance: true }
        });
        const totalDistance = Number(tripResult._sum.actualDistance || 0);

        // Sum liters from fuel logs for this vehicle
        const fuelResult = await prisma.fuelLog.aggregate({
          where: { vehicleId: vehicle.id },
          _sum: { liters: true }
        });
        const totalLiters = Number(fuelResult._sum.liters || 0);

        // Calculate fuel efficiency (km per liter)
        let fuelEfficiency = null;
        if (totalLiters > 0) {
          fuelEfficiency = parseFloat((totalDistance / totalLiters).toFixed(2));
        }

        return {
          vehicleId: vehicle.id,
          regNumber: vehicle.regNumber,
          nameModel: vehicle.nameModel,
          totalDistance,
          totalLiters,
          fuelEfficiency // km/liter, null if no fuel data
        };
      })
    );

    // CSV export if requested
    if (sendCsvIfRequested(req, res, report, 'fuel-efficiency-report')) return;

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating fuel efficiency report:', error);
    return res.status(500).json({ error: 'Internal server error generating fuel efficiency report.' });
  }
};

// GET /api/reports/operational-cost
// Return operational cost per vehicle (fuel log costs + expense amounts)
const getOperationalCostReport = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        regNumber: true,
        nameModel: true
      }
    });

    const report = await Promise.all(
      vehicles.map(async (vehicle) => {
        // Sum fuel log costs
        const fuelCostResult = await prisma.fuelLog.aggregate({
          where: { vehicleId: vehicle.id },
          _sum: { cost: true }
        });
        const totalFuelCost = Number(fuelCostResult._sum.cost || 0);

        // Sum expense amounts
        const expenseResult = await prisma.expense.aggregate({
          where: { vehicleId: vehicle.id },
          _sum: { amount: true }
        });
        const totalExpenses = Number(expenseResult._sum.amount || 0);

        const totalOperationalCost = totalFuelCost + totalExpenses;

        return {
          vehicleId: vehicle.id,
          regNumber: vehicle.regNumber,
          nameModel: vehicle.nameModel,
          fuelCosts: totalFuelCost,
          expenses: totalExpenses,
          totalOperationalCost
        };
      })
    );

    // CSV export if requested
    if (sendCsvIfRequested(req, res, report, 'operational-cost-report')) return;

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating operational cost report:', error);
    return res.status(500).json({ error: 'Internal server error generating operational cost report.' });
  }
};

// GET /api/reports/fleet-utilization
// % of vehicles currently ON_TRIP or IN_SHOP vs total, plus completed trips per vehicle
const getFleetUtilizationReport = async (req, res) => {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const onTripCount = await prisma.vehicle.count({ where: { status: 'ON_TRIP' } });
    const inShopCount = await prisma.vehicle.count({ where: { status: 'IN_SHOP' } });
    const availableCount = await prisma.vehicle.count({ where: { status: 'AVAILABLE' } });
    const retiredCount = await prisma.vehicle.count({ where: { status: 'RETIRED' } });

    // Active = ON_TRIP + IN_SHOP (vehicles currently being utilized/serviced)
    const activeCount = onTripCount + inShopCount;
    const utilizationPercentage = totalVehicles > 0
      ? parseFloat(((activeCount / totalVehicles) * 100).toFixed(2))
      : 0;

    // Utilization over time: completed trips per vehicle
    const vehicles = await prisma.vehicle.findMany({
      select: { id: true, regNumber: true, nameModel: true }
    });

    const perVehicle = await Promise.all(
      vehicles.map(async (vehicle) => {
        const completedTrips = await prisma.trip.count({
          where: { vehicleId: vehicle.id, status: 'COMPLETED' }
        });
        const totalTrips = await prisma.trip.count({
          where: { vehicleId: vehicle.id }
        });
        return {
          vehicleId: vehicle.id,
          regNumber: vehicle.regNumber,
          nameModel: vehicle.nameModel,
          completedTrips,
          totalTrips,
          utilizationPercentage
        };
      })
    );

    // CSV export if requested — flatten perVehicle data for CSV
    if (sendCsvIfRequested(req, res, perVehicle, 'fleet-utilization-report')) return;

    return res.status(200).json({
      summary: {
        totalVehicles,
        onTrip: onTripCount,
        inShop: inShopCount,
        available: availableCount,
        retired: retiredCount,
        utilizationPercentage
      },
      perVehicle
    });
  } catch (error) {
    console.error('Error generating fleet utilization report:', error);
    return res.status(500).json({ error: 'Internal server error generating fleet utilization report.' });
  }
};

// GET /api/reports/vehicle-roi
// ROI = (Revenue - Operational Costs) / Acquisition Cost per vehicle
const getVehicleRoiReport = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        regNumber: true,
        nameModel: true,
        acquisitionCost: true
      }
    });

    const report = await Promise.all(
      vehicles.map(async (vehicle) => {
        const acquisitionCost = Number(vehicle.acquisitionCost);

        // Sum revenue from completed trips
        const revenueResult = await prisma.trip.aggregate({
          where: {
            vehicleId: vehicle.id,
            status: 'COMPLETED',
            revenue: { not: null }
          },
          _sum: { revenue: true }
        });
        const totalRevenue = Number(revenueResult._sum.revenue || 0);

        // Sum fuel costs
        const fuelCostResult = await prisma.fuelLog.aggregate({
          where: { vehicleId: vehicle.id },
          _sum: { cost: true }
        });
        const totalFuelCost = Number(fuelCostResult._sum.cost || 0);

        // Sum expense amounts
        const expenseResult = await prisma.expense.aggregate({
          where: { vehicleId: vehicle.id },
          _sum: { amount: true }
        });
        const totalExpenses = Number(expenseResult._sum.amount || 0);

        const totalOperationalCost = totalFuelCost + totalExpenses;
        const netProfit = totalRevenue - totalOperationalCost;

        // ROI percentage: (Net Profit / Acquisition Cost) * 100
        let roi = null;
        if (acquisitionCost > 0) {
          roi = parseFloat(((netProfit / acquisitionCost) * 100).toFixed(2));
        }

        return {
          vehicleId: vehicle.id,
          regNumber: vehicle.regNumber,
          nameModel: vehicle.nameModel,
          acquisitionCost,
          totalRevenue,
          totalOperationalCost,
          netProfit,
          roiPercentage: roi
        };
      })
    );

    // CSV export if requested
    if (sendCsvIfRequested(req, res, report, 'vehicle-roi-report')) return;

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating vehicle ROI report:', error);
    return res.status(500).json({ error: 'Internal server error generating vehicle ROI report.' });
  }
};

module.exports = {
  getFuelEfficiencyReport,
  getOperationalCostReport,
  getFleetUtilizationReport,
  getVehicleRoiReport
};
