
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const {
  isValidDate,
  isFutureDate,
} = require("../utils/validateDate");

const router = express.Router();

const allowedSlots = [
  "morning",
  "after_breakfast",
  "after_lunch",
  "after_dinner",
];

// REUSABLE DATE VALIDATION
function validateReadingDate(date, res) {
  if (!isValidDate(date)) {
    res.status(400).json({
      message: "Invalid date format. Use YYYY-MM-DD",
    });
    return false;
  }

  if (isFutureDate(date)) {
    res.status(400).json({
      message: "Future dates are not allowed",
    });
    return false;
  }

  return true;
}

// REUSABLE GLUCOSE VALIDATION
function validateGlucose(value, res) {
  const glucoseValue = Number(value);

  if (
    value === "" ||
    value === null ||
    !Number.isInteger(glucoseValue) ||
    glucoseValue < 40 ||
    glucoseValue > 600
  ) {
    res.status(400).json({
      message: "Glucose value must be an integer between 40 and 600",
    });
    return null;
  }

  return glucoseValue;
}

// REUSABLE SLOT VALIDATION
function validateSlot(slot, res) {
  if (!allowedSlots.includes(slot)) {
    res.status(400).json({
      message: "Invalid time slot",
    });
    return false;
  }

  return true;
}

// ADD READING
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { reading_date, time_slot, glucose_value } = req.body;
    const userId = req.user.id;

    if (!reading_date || !time_slot || glucose_value === undefined) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!validateReadingDate(reading_date, res)) return;

    if (!validateSlot(time_slot, res)) return;

    const value = validateGlucose(glucose_value, res);

    if (value === null) return;

    const result = await pool.query(
      `INSERT INTO readings
       (user_id, reading_date, time_slot, glucose_value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, reading_date, time_slot, value]
    );

    res.status(201).json({
      message: "Reading added successfully",
      reading: result.rows[0],
    });

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A reading already exists for this time slot and date",
      });
    }

    console.error(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// GET DAILY READINGS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    if (!validateReadingDate(date, res)) return;

    const result = await pool.query(
      `SELECT * FROM readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY
       CASE time_slot
         WHEN 'morning' THEN 1
         WHEN 'after_breakfast' THEN 2
         WHEN 'after_lunch' THEN 3
         WHEN 'after_dinner' THEN 4
       END`,
      [userId, date]
    );

    res.status(200).json({
      count: result.rows.length,
      readings: result.rows,
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// EDIT READING
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reading_date, time_slot, glucose_value } = req.body;
    const userId = req.user.id;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid reading ID",
      });
    }

    if (!reading_date || !time_slot || glucose_value === undefined) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!validateReadingDate(reading_date, res)) return;

    if (!validateSlot(time_slot, res)) return;

    const value = validateGlucose(glucose_value, res);

    if (value === null) return;

    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1,
           time_slot = $2,
           glucose_value = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [reading_date, time_slot, value, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found",
      });
    }

    res.status(200).json({
      message: "Reading updated successfully",
      reading: result.rows[0],
    });

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A reading already exists for this time slot and date",
      });
    }

    console.error(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// DELETE READING
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid reading ID",
      });
    }

    const result = await pool.query(
      `DELETE FROM readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found",
      });
    }

    res.status(200).json({
      message: "Reading deleted successfully",
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
