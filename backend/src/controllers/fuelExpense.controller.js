const prisma = require('../config/db');

// Get all fuel logs, filterable by vehicleId and date range (startDate, endDate)
const getFuelLogs = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;
    const where = {};

    if (vehicleId) {
      const vId = parseInt(vehicleId, 10);
      if (isNaN(vId)) {
        return res.status(400).json({ error: 'Invalid vehicleId format.' });
      }
      where.vehicleId = vId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const logs = await prisma.fuelLog.findMany({
      where,
      include: {
        vehicle: { select: { id: true, regNumber: true, nameModel: true } }
      },
      orderBy: { date: 'desc' }
    });
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching fuel logs:', error);
    return res.status(500).json({ error: 'Internal server error fetching fuel logs.' });
  }
};

// Create a new fuel log
const createFuelLog = async (req, res) => {
  try {
    const { vehicleId, liters, cost, date } = req.body;

    if (!vehicleId || liters === undefined || cost === undefined || !date) {
      return res.status(400).json({ error: 'Fields vehicleId, liters, cost, and date are required.' });
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

    const newLog = await prisma.fuelLog.create({
      data: {
        vehicleId: vehicleIdNum,
        liters: Number(liters),
        cost: Number(cost),
        date: new Date(date)
      }
    });

    return res.status(201).json(newLog);
  } catch (error) {
    console.error('Error creating fuel log:', error);
    return res.status(500).json({ error: 'Internal server error creating fuel log.' });
  }
};

// Create a new expense record
const createExpense = async (req, res) => {
  try {
    const { vehicleId, type, amount, date } = req.body;

    if (!vehicleId || !type || amount === undefined || !date) {
      return res.status(400).json({ error: 'Fields vehicleId, type, amount, and date are required.' });
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

    const newExpense = await prisma.expense.create({
      data: {
        vehicleId: vehicleIdNum,
        type,
        amount: Number(amount),
        date: new Date(date)
      }
    });

    return res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ error: 'Internal server error creating expense.' });
  }
};

// Get total operational cost for a vehicle (fuel costs + expenses + maintenance is implicit via vehicle downtime)
const getVehicleOperationalCost = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleId = parseInt(id, 10);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: 'Invalid vehicle ID format.' });
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    // Sum all fuel log costs for this vehicle
    const fuelCostResult = await prisma.fuelLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true }
    });
    const totalFuelCost = Number(fuelCostResult._sum.cost || 0);

    // Sum all expense amounts for this vehicle
    const expenseResult = await prisma.expense.aggregate({
      where: { vehicleId },
      _sum: { amount: true }
    });
    const totalExpenses = Number(expenseResult._sum.amount || 0);

    // Total operational cost
    const totalOperationalCost = totalFuelCost + totalExpenses;

    return res.status(200).json({
      vehicleId,
      regNumber: vehicle.regNumber,
      nameModel: vehicle.nameModel,
      breakdown: {
        fuelCosts: totalFuelCost,
        expenses: totalExpenses
      },
      totalOperationalCost
    });
  } catch (error) {
    console.error('Error calculating operational cost:', error);
    return res.status(500).json({ error: 'Internal server error calculating operational cost.' });
  }
};

module.exports = {
  getFuelLogs,
  createFuelLog,
  createExpense,
  getVehicleOperationalCost
};
