const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixPasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/campus-permission-system');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    // Find all students
    const students = await users.find({ role: 'student' }).toArray();
    console.log(`Found ${students.length} students`);

    let fixed = 0;
    for (const student of students) {
      // Get the plain password (register number)
      const plainPassword = student.registerNumber;
      
      if (!plainPassword) {
        console.log(`⚠️ Skipping ${student.email} - no register number`);
        continue;
      }
      
      // Generate bcrypt hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      
      // Update the user with hashed password
      await users.updateOne(
        { _id: student._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log(`✅ Fixed: ${student.registerNumber}`);
      fixed++;
    }

    console.log(`\n🎉 Success! Fixed ${fixed} students permanently with bcrypt hashes.`);
    console.log('Students can now login with their register number as password.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixPasswords();