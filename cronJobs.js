const cron = require("node-cron");
const User = require("./models/userModel");
const logger = require("./utils/logger");

// Cron job يشتغل أول يوم من كل شهر الساعة 00:00   
cron.schedule("0 0 1 * *", async () => {
  try {
    logger.info("🚀 Starting monthly reset for apartment counts...");

    await User.updateMany(
      
      {},
      {
        $set: {
          apartmentCount: 0,
          lastResetAt: new Date(),
        },
      }
    );

    logger.info("✅ Monthly reset done successfully");
  } catch (err) {
    logger.error("❌ Error during monthly reset:", err);
  }
});
