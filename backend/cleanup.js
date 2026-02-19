// Database Cleanup Script
// Run this script to remove all demo data except users
// Usage: node backend/cleanup.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Home = require('./models/Home');
const Booking = require('./models/Booking');
const Favorite = require('./models/Favorite');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const cleanupDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    console.log('-----------------------------------');

    // Count documents before cleanup
    const usersCount = await User.countDocuments();
    const homesCount = await Home.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    const favoritesCount = await Favorite.countDocuments();
    const messagesCount = await Message.countDocuments();
    const conversationsCount = await Conversation.countDocuments();

    console.log('📊 Current database state:');
    console.log(`   Users: ${usersCount}`);
    console.log(`   Homes/Listings: ${homesCount}`);
    console.log(`   Bookings: ${bookingsCount}`);
    console.log(`   Favorites: ${favoritesCount}`);
    console.log(`   Messages: ${messagesCount}`);
    console.log(`   Conversations: ${conversationsCount}`);
    console.log('-----------------------------------');

    // Delete all homes/listings
    console.log('🗑️  Deleting all homes/listings...');
    const homesResult = await Home.deleteMany({});
    console.log(`   ✅ Deleted ${homesResult.deletedCount} homes`);

    // Delete all bookings
    console.log('🗑️  Deleting all bookings...');
    const bookingsResult = await Booking.deleteMany({});
    console.log(`   ✅ Deleted ${bookingsResult.deletedCount} bookings`);

    // Delete all favorites (they reference homes)
    console.log('🗑️  Deleting all favorites...');
    const favoritesResult = await Favorite.deleteMany({});
    console.log(`   ✅ Deleted ${favoritesResult.deletedCount} favorites`);

    // Delete all messages
    console.log('🗑️  Deleting all messages...');
    const messagesResult = await Message.deleteMany({});
    console.log(`   ✅ Deleted ${messagesResult.deletedCount} messages`);

    // Delete all conversations
    console.log('🗑️  Deleting all conversations...');
    const conversationsResult = await Conversation.deleteMany({});
    console.log(`   ✅ Deleted ${conversationsResult.deletedCount} conversations`);

    console.log('-----------------------------------');

    // Count documents after cleanup
    const usersAfter = await User.countDocuments();
    const homesAfter = await Home.countDocuments();
    const bookingsAfter = await Booking.countDocuments();
    const favoritesAfter = await Favorite.countDocuments();
    const messagesAfter = await Message.countDocuments();
    const conversationsAfter = await Conversation.countDocuments();

    console.log('📊 Database state after cleanup:');
    console.log(`   Users: ${usersAfter} (preserved)`);
    console.log(`   Homes/Listings: ${homesAfter}`);
    console.log(`   Bookings: ${bookingsAfter}`);
    console.log(`   Favorites: ${favoritesAfter}`);
    console.log(`   Messages: ${messagesAfter}`);
    console.log(`   Conversations: ${conversationsAfter}`);
    console.log('-----------------------------------');
    console.log('✅ Cleanup completed successfully!');
    console.log('   All users have been preserved.');
    console.log('   All listings, bookings, and related data have been removed.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up database:', error);
    process.exit(1);
  }
};

cleanupDatabase();
