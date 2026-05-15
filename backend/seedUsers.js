const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Remove old wrong students: 24B91A0001 to 24B91A0072
    console.log("🧹 Cleaning old incorrect student records...");
    const oldRegNums = [];

    for (let i = 1; i <= 72; i++) {
      oldRegNums.push(`24B91A0${String(i).padStart(3, "0")}`);
    }

    await User.deleteMany({ registerNumber: { $in: oldRegNums } });

    // Students: 24B91A0701 to 24B91A0772
    console.log("📚 Upserting students...");
    for (let i = 1; i <= 72; i++) {
      const regNum = `24B91A0${700 + i}`;

      await User.findOneAndUpdate(
        { registerNumber: regNum },
        {
          $set: {
            name: `Student ${i}`,
            email: `student${regNum}@campus.edu`,
            password: await bcrypt.hash(regNum, 10),
            role: "student",
            registerNumber: regNum,
            department: "Computer Science",
            branch: "CSE",
            section: "A",
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    console.log("✅ Students ready");

    // Faculty: fac2026
    console.log("👨‍🏫 Upserting fac2026...");
    await User.findOneAndUpdate(
      { registerNumber: "fac2026" },
      {
        $set: {
          name: "Faculty User",
          email: "fac2026@campus.edu",
          password: await bcrypt.hash("fac2026", 10),
          role: "faculty",
          department: "Computer Science",
          registerNumber: "fac2026",
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    // Faculty: facsrkr
    console.log("👨‍🏫 Upserting facsrkr...");
    await User.findOneAndUpdate(
      { registerNumber: "facsrkr" },
      {
        $set: {
          name: "Faculty SRKR",
          email: "facsrkr@campus.edu",
          password: await bcrypt.hash("facsrkr", 10),
          role: "faculty",
          department: "Computer Science",
          registerNumber: "facsrkr",
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    console.log("✅ Faculty users ready");

    // HOD: hod2026
    console.log("👔 Upserting hod2026...");
    await User.findOneAndUpdate(
      { registerNumber: "hod2026" },
      {
        $set: {
          name: "HOD User",
          email: "hod2026@campus.edu",
          password: await bcrypt.hash("hod2026", 10),
          role: "hod",
          department: "Computer Science",
          registerNumber: "hod2026",
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    console.log("✅ HOD ready");

    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: "student" });
    const facultyCount = await User.countDocuments({ role: "faculty" });
    const hodCount = await User.countDocuments({ role: "hod" });

    console.log("\n📊 Database Summary:");
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Students: ${studentCount}`);
    console.log(`Faculty: ${facultyCount}`);
    console.log(`HOD: ${hodCount}`);

    console.log("\n✅ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedUsers();