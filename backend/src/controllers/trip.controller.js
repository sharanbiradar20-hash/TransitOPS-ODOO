const prisma = require('../config/db');
const { updateVehicleStatus, updateDriverStatus } = require('../utils/statusTransition');

// Get all trips, optionally filtered by status
const getTrips = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        vehicle: { select: { id: true, regNumber: true, nameModel: true } },
        driver: { select: { id: true, name: true, licenseNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ error: 'Internal server error fetching trips.' });
  }
};

// Create a new trip
const createTrip = async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = req.body;

    if (!source || !destination || !vehicleId || !driverId || cargoWeight === undefined || plannedDistance === undefined) {
      return res.status(400).json({ error: 'Fields source, destination, vehicleId, driverId, cargoWeight, and plannedDistance are required.' });
    }

    const newTrip = await prisma.trip.create({
      data: {
        source,
        destination,
        vehicleId: Number(vehicleId),
        driverId: Number(driverId),
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
        status: 'DRAFT'
      }
    });

    return res.status(201).json(newTrip);
  } catch (error) {
    console.error('Error creating trip:', error);
    return res.status(500).json({ error: 'Internal server error creating trip.' });
  }
};

// PATCH /api/trips/:id/dispatch — Draft → Dispatched; vehicle + driver → "On Trip"
const dispatchTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID format.' });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.status !== 'DRAFT') {
      return res.status(400).json({ error: `Cannot dispatch trip. Current status is '${trip.status}', but must be 'DRAFT'.` });
    }

    // Update trip status to DISPATCHED
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { status: 'DISPATCHED' }
    });

    // Set vehicle and driver to ON_TRIP
    await updateVehicleStatus(trip.vehicleId, 'ON_TRIP');
    await updateDriverStatus(trip.driverId, 'ON_TRIP');

    return res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error dispatching trip:', error);
    return res.status(500).json({ error: 'Internal server error dispatching trip.' });
  }
};

// PATCH /api/trips/:id/complete — Dispatched → Completed; vehicle + driver → "Available"
const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID format.' });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.status !== 'DISPATCHED') {
      return res.status(400).json({ error: `Cannot complete trip. Current status is '${trip.status}', but must be 'DISPATCHED'.` });
    }

    const { actualDistance, fuelConsumed } = req.body;

    // Update trip status to COMPLETED with optional actual data
    const updateData = { status: 'COMPLETED' };
    if (actualDistance !== undefined) updateData.actualDistance = Number(actualDistance);
    if (fuelConsumed !== undefined) updateData.fuelConsumed = Number(fuelConsumed);

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: updateData
    });

    // Set vehicle and driver back to AVAILABLE
    await updateVehicleStatus(trip.vehicleId, 'AVAILABLE');
    await updateDriverStatus(trip.driverId, 'AVAILABLE');

    return res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error completing trip:', error);
    return res.status(500).json({ error: 'Internal server error completing trip.' });
  }
};

// PATCH /api/trips/:id/cancel — Dispatched → Cancelled; vehicle + driver → "Available"
const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID format.' });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.status !== 'DISPATCHED') {
      return res.status(400).json({ error: `Cannot cancel trip. Current status is '${trip.status}', but must be 'DISPATCHED'.` });
    }

    // Update trip status to CANCELLED
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { status: 'CANCELLED' }
    });

    // Set vehicle and driver back to AVAILABLE
    await updateVehicleStatus(trip.vehicleId, 'AVAILABLE');
    await updateDriverStatus(trip.driverId, 'AVAILABLE');

    return res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error cancelling trip:', error);
    return res.status(500).json({ error: 'Internal server error cancelling trip.' });
  }
};

module.exports = {
  getTrips,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip
};
