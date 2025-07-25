const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

// تأكد من وجود مجلد logs أو إنشائه
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log("logs file is created");
}

// ملف تدوير لسجلات عامة (info وفوق)
const combinedRotateFileTransport = new transports.DailyRotateFile({
  filename: path.join(logsDir, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "info",  // كل الرسائل من info وأعلى
});

// ملف تدوير لسجلات الأخطاء فقط
const errorRotateFileTransport = new transports.DailyRotateFile({
  filename: path.join(logsDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",  // فقط رسائل الخطأ
});

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      (info) => `${info.timestamp} - ${info.level}: ${info.message}`
    )
  ),
  transports: [
    combinedRotateFileTransport,
    errorRotateFileTransport,
    new transports.Console(), // عرض السجلات في الكونسول أيضًا
  ],
});

module.exports = logger;
