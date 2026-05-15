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

    let upsertCount = 0;

    // 1. Upsert 72 students (24B91A0701 to 24B91A0772)
    console.log('📚 Upserting students with correct roll numbers and passwords...');
    for (let i = 1; i <= 72; i++) {
      const regNum = `24B91A0${String(700 + i).padStart(3, '0')}`;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(regNum, salt);

      await User.findOneAndUpdate(
        { registerNumber: regNum },
        {
          $set: {
            name: `Student ${i}`,
            email: `student${regNum}@campus.edu`,
            password: hashedPassword,
            role: 'student',
            registerNumber: regNum,
            department: 'Computer Science',
            branch: 'CSE',
            section: i % 4 === 0 ? 'A' : i % 4 === 1 ? 'B' : i % 4 === 2 ? 'C' : 'D'
          }
        },
        { upsert: true, new: true }
      );
      upsertCount++;
    }
    console.log(`✅ Upserted ${upsertCount} students`);

    // 2. Upsert Faculty user
    console.log('👨‍🏫 Upserting faculty user...');
    const facultySalt = await bcrypt.genSalt(10);
    const facultyHashedPassword = await bcrypt.hash('fac2026', facultySalt);
    
    await User.findOneAndUpdate(
      { email: 'fac2026@campus.edu' },
      {
        $set: {
          name: 'Faculty User',
          email: 'fac2026@campus.edu',
          password: facultyHashedPassword,
          role: 'faculty',
          department: 'Computer Science',
          registerNumber: 'fac2026'
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Upserted faculty user');

    // 3. Upsert HOD user
    console.log('👔 Upserting HOD user...');
    const hodSalt = await bcrypt.genSalt(10);
    const hodHashedPassword = await bcrypt.hash('hod2026', hodSalt);
    
    await User.findOneAndUpdate(
      { email: 'hod2026@campus.edu' },
      {
        $set: {
          name: 'HOD User',
          email: 'hod2026@campus.edu',
          password: hodHashedPassword,
          role: 'hod',
          department: 'Computer Science',
          registerNumber: 'hod2026'
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Upserted HOD user');

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
    console.log('\n✅ All users have been seeded with correct password hashes!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();
