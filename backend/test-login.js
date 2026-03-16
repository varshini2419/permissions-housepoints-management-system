const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const testLogin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/campus-permission-system');
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ registerNumber: '240B91A0701' });
    console.log('Found user:', user.registerNumber);
    
    const password = '240B91A0701';
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    // Also test bcrypt directly
    const directCompare = await bcrypt.compare(password, user.password);
    console.log('Direct bcrypt compare:', directCompare);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testLogin();