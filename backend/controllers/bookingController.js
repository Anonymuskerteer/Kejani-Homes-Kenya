const Booking = require('../models/Booking');
const Home = require('../models/Home');

exports.createBooking = async (req, res) => {
  try {
    const { home: homeId, checkInDate, checkOutDate, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate home exists
    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Calculate total price based on nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * (home.price || 0);

    const booking = new Booking({
      user: userId,
      home: homeId,
      checkInDate,
      checkOutDate,
      totalPrice,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email phone')
      .populate('home', 'title location price images');

    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking: populatedBooking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('home', 'title location price images amenities')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const userId = req.user._id;
    const booking = await Booking.findOne({ 
      _id: req.params.id, 
      user: userId 
    })
      .populate('user', 'name email phone')
      .populate('home', 'title location price images amenities description');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error fetching booking' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('home', 'title location price images');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error updating booking' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('home', 'title location price images');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { status: 'cancelled' },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('home', 'title location price images');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const booking = await Booking.findOneAndDelete({ 
      _id: req.params.id, 
      user: userId 
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error deleting booking' });
  }
};