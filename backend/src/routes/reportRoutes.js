
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// DAILY REPORT
router.get("/daily", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const result = await pool.query(
      `SELECT
        MAX(glucose_value) AS highest,
        MIN(glucose_value) AS lowest,
        ROUND(AVG(glucose_value), 1) AS average,
        COUNT(*) AS total_readings
       FROM readings
       WHERE user_id = $1 AND reading_date = $2`,
      [userId, date]
    );

    res.status(200).json({
      reportType: "daily",
      date,
      highest: result.rows[0].highest,
      lowest: result.rows[0].lowest,
      average: result.rows[0].average,
      totalReadings: Number(result.rows[0].total_readings),
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// MONTH-TO-DATE REPORT
router.get("/month", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const result = await pool.query(
      `SELECT
        MAX(glucose_value) AS highest,
        MIN(glucose_value) AS lowest,
        ROUND(AVG(glucose_value), 1) AS average,
        COUNT(*) AS total_readings
       FROM readings
       WHERE user_id = $1
       AND reading_date >= DATE_TRUNC('month', $2::date)::date
       AND reading_date <= $2::date`,
      [userId, date]
    );

    res.status(200).json({
      reportType: "month-to-date",
      date,
      highest: result.rows[0].highest,
      lowest: result.rows[0].lowest,
      average: result.rows[0].average,
      totalReadings: Number(result.rows[0].total_readings),
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
