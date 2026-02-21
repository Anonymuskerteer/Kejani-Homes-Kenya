const Home = require('../models/Home');

exports.getHomes = async (req, res) => {
  try {
    const { county, search, minPrice, maxPrice, rentalType, sort } = req.query;

    // Build filter
    const filter = { status: { $ne: 'Unavailable' } };
    if (county) filter.county = county;
    if (rentalType) filter.rentalType = rentalType;
    if (minPrice || maxPrice) {
      filter.rentAmount = {};
      if (minPrice) filter.rentAmount.$gte = Number(minPrice);
      if (maxPrice) filter.rentAmount.$lte = Number(maxPrice);
    }

    let homes = await Home.find(filter)
      .populate('owner', 'firstName lastName email landlordPhone landlordProfilePhoto agencyName role')
      .sort({ createdAt: -1 });

    // If userCounty is provided, sort listings from that county first
    const userCounty = req.query.userCounty;
    if (userCounty) {
      homes.sort((a, b) => {
        const aMatch = (a.county || '').toLowerCase() === userCounty.toLowerCase() ? 0 : 1;
        const bMatch = (b.county || '').toLowerCase() === userCounty.toLowerCase() ? 0 : 1;
        return aMatch - bMatch;
      });
    }

    // Text search filter (client-side since address is encrypted)
    if (search) {
      const searchLower = search.toLowerCase();
      homes = homes.filter(h =>
        h.title.toLowerCase().includes(searchLower) ||
        (h.address && h.address.toLowerCase().includes(searchLower)) ||
        (h.county && h.county.toLowerCase().includes(searchLower)) ||
        (h.city && h.city.toLowerCase().includes(searchLower))
      );
    }

    res.json({ homes });
  } catch (error) {
    console.error('Error fetching homes:', error);
    res.status(500).json({ message: 'Server error fetching homes' });
  }
};

exports.getMyHomes = async (req, res) => {
  try {
    const homes = await Home.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .populate('owner', 'firstName lastName email phone profileImage');
    res.json({ homes });
  } catch (error) {
    console.error('Error fetching my homes:', error);
    res.status(500).json({ message: 'Server error fetching your listings' });
  }
};

exports.getHomeById = async (req, res) => {
  try {
    const home = await Home.findById(req.params.id).populate('owner', 'firstName lastName email landlordPhone landlordProfilePhoto agencyName role');
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }

    // Increment views
    home.views = (home.views || 0) + 1;
    await home.save();

    res.json({ home });
  } catch (error) {
    console.error('Error fetching home:', error);
    res.status(500).json({ message: 'Server error fetching home' });
  }
};

exports.createHome = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      rentAmount,
      deposit,
      location,
      address,
      city,
      county,
      rentalType,
      customType,
      bedrooms,
      bathrooms,
      squareFootage,
      amenities,
      customAmenities,
      images,
      coordinates,
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!address && !location) missingFields.push('address/location');
    if (!rentAmount && !price) missingFields.push('rentAmount/price');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missingFields 
      });
    }

    // Merge standard and custom amenities
    const allAmenities = [
      ...(amenities || []),
      ...(customAmenities || []),
    ];

    const home = new Home({
      owner: req.user._id,
      title,
      description,
      address: address || location || '',
      city: city || '',
      county: county || '',
      rentAmount: rentAmount || price || 0,
      deposit: deposit || 0,
      rentalType: rentalType || 'Single Room',
      customType: customType || '',
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      squareFootage: squareFootage || 0,
      amenities: allAmenities,
      images: images || [],
      coordinates: coordinates || { lat: 0, lng: 0 },
    });

    await home.save();
    await home.populate('owner', 'firstName lastName email landlordPhone landlordProfilePhoto agencyName role');

    res.status(201).json({ message: 'Listing created successfully', home });
  } catch (error) {
    console.error('Error creating home:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: 'Validation error',
        validationErrors 
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message 
      });
    }
    
    res.status(500).json({ message: 'Server error creating listing' });
  }
};

exports.updateHome = async (req, res) => {
  try {
    const home = await Home.findById(req.params.id);
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }

    // Ensure only the owner can update
    if (home.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const {
      title,
      description,
      price,
      rentAmount,
      deposit,
      location,
      address,
      city,
      county,
      rentalType,
      customType,
      bedrooms,
      bathrooms,
      squareFootage,
      amenities,
      customAmenities,
      images,
      coordinates,
      status,
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined || location !== undefined) updateData.address = address || location;
    if (city !== undefined) updateData.city = city;
    if (county !== undefined) updateData.county = county;
    if (rentAmount !== undefined || price !== undefined) updateData.rentAmount = rentAmount || price;
    if (deposit !== undefined) updateData.deposit = deposit;
    if (rentalType !== undefined) updateData.rentalType = rentalType;
    if (customType !== undefined) updateData.customType = customType;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms;
    if (squareFootage !== undefined) updateData.squareFootage = squareFootage;
    if (coordinates !== undefined) updateData.coordinates = coordinates;
    if (status !== undefined) updateData.status = status;
    if (images !== undefined) updateData.images = images;

    // Merge amenities
    if (amenities !== undefined || customAmenities !== undefined) {
      updateData.amenities = [
        ...(amenities || []),
        ...(customAmenities || []),
      ];
    }

    const updatedHome = await Home.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email phone profileImage');

    res.json({ message: 'Listing updated successfully', home: updatedHome });
  } catch (error) {
    console.error('Error updating home:', error);
    res.status(500).json({ message: 'Server error updating listing' });
  }
};

exports.deleteHome = async (req, res) => {
  try {
    const home = await Home.findById(req.params.id);
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }

    // Ensure only the owner can delete
    if (home.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Home.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting home:', error);
    res.status(500).json({ message: 'Server error deleting listing' });
  }
};
