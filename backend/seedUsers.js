const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus_permission_system');
    console.log('✅ MongoDB connected');

    // Delete old wrong students (24B91A0001 to 24B91A0072)
    console.log('🧹 Cleaning up old incorrect student records...');
    const oldRegNums = [];
    for (let i = 1; i <= 72; i++) {
      oldRegNums.push(`24B91A0${String(i).padStart(3, '0')}`);
    }
    const deleteResult = await User.deleteMany({ registerNumber: { $in: oldRegNums } });
    if (deleteResult.deletedCount > 0) {
      console.log(`✅ Deleted ${deleteResult.deletedCount} old incorrect student records`);
    }

    const usersToCreate = [];

    // 1. Create 72 students (24B91A0701 to 24B91A0772)
    console.log('📚 Creating students with correct roll numbers...');
    for (let i = 1; i <= 72; i++) {
      const regNum = `24B91A0${String(700 + i).padStart(3, '0')}`;
      const existingStudent = await User.findOne({ registerNumber: regNum });
      
      if (existingStudent) {
        console.log(`⏭️  Student ${regNum} already exists, skipping...`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(regNum, salt);

      usersToCreate.push({
        name: `Student ${i}`,
        email: `student${regNum}@campus.edu`,
        password: hashedPassword,
        role: 'student',
        registerNumber: regNum,
        department: 'Computer Science',
        branch: 'CSE',
        section: i % 4 === 0 ? 'A' : i % 4 === 1 ? 'B' : i % 4 === 2 ? 'C' : 'D'
      });
    }

    // 2. Create Faculty user
    console.log('👨‍🏫 Creating faculty user...');
    const existingFaculty = await User.findOne({ email: 'fac2026@campus.edu' });
    if (!existingFaculty) {
      const facultySalt = await bcrypt.genSalt(10);
      const facultyHashedPassword = await bcrypt.hash('fac2026', facultySalt);
      
      usersToCreate.push({
        name: 'Faculty User',
        email: 'fac2026@campus.edu',
        password: facultyHashedPassword,
        role: 'faculty',
        department: 'Computer Science'
      });
    } else {
      console.log('⏭️  Faculty user already exists, skipping...');
    }

    // 3. Create HOD user
    console.log('👔 Creating HOD user...');
    const existingHOD = await User.findOne({ email: 'hod2026@campus.edu' });
    if (!existingHOD) {
      const hodSalt = await bcrypt.genSalt(10);
      const hodHashedPassword = await bcrypt.hash('hod2026', hodSalt);
      
      usersToCreate.push({
        name: 'HOD User',
        email: 'hod2026@campus.edu',
        password: hodHashedPassword,
        role: 'hod',
        department: 'Computer Science'
      });
    } else {
      console.log('⏭️  HOD user already exists, skipping...');
    }

    // Save all new users
    if (usersToCreate.length > 0) {
      await User.insertMany(usersToCreate);
      console.log(`\n✅ Successfully seeded ${usersToCreate.length} users!`);
    } else {
      console.log('\n⏭️  All users already exist, no seeding needed.');
    }

    // Print summary
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const hodCount = await User.countDocuments({ role: 'hod' });

    console.log('\n📊 Database Summary:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Faculty: ${facultyCount}`);
    console.log(`   HOD: ${hodCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();
