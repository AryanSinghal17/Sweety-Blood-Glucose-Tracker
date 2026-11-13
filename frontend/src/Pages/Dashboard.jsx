
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LibraryDatePicker from "../Components/LibraryDatePicker";
import { apiRequest } from "../services/api";


function formatApiDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("morning");
  const [glucose, setGlucose] = useState("");
  const [readings, setReadings] = useState([]);
  const [reportType, setReportType] = useState("daily");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const slots = [
    { value: "morning", label: "Morning" },
    { value: "after_breakfast", label: "After Breakfast" },
    { value: "after_lunch", label: "After Lunch" },
    { value: "after_dinner", label: "After Dinner" },
  ];

  const selectedDate = formatApiDate(date);

  // Fetch readings for selected date
  async function fetchReadings() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        `/api/readings?date=${selectedDate}`
      );

      setReadings(data.readings || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReadings();
  }, [selectedDate]);

  // Convert backend reading into frontend-friendly values
  const dailyReadings = readings
    .map((reading) => ({
      id: reading.id,
      date: reading.reading_date,
      slot: reading.time_slot,
      value: Number(reading.glucose_value),
    }))
    .sort(
      (a, b) =>
        slots.findIndex((slot) => slot.value === a.slot) -
        slots.findIndex((slot) => slot.value === b.slot)
    );

  // Check whether a slot is already used
  function isSlotUsed(slot) {
    return dailyReadings.some(
      (reading) =>
        reading.slot === slot && reading.id !== editingId
    );
  }

  // Add or update reading
  async function handleSubmit(e) {
    e.preventDefault();

    const value = Number(glucose);

    if (glucose.trim() === "") {
      alert("Please enter glucose value");
      return;
    }

    if (!Number.isInteger(value) || value < 40 || value > 600) {
      alert("Enter a whole number between 40 and 600");
      return;
    }

    if (isSlotUsed(time)) {
      alert("A reading already exists for this time slot");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    if (selected > today) {
      alert("Future dates are not allowed");
      return;
    }

    const body = {
      reading_date: selectedDate,
      time_slot: time,
      glucose_value: value,
    };

    try {
      setSaving(true);
      setError("");

      if (editingId !== null) {
        await apiRequest(`/api/readings/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });

        alert("Reading updated successfully!");
      } else {
        await apiRequest("/api/readings", {
          method: "POST",
          body: JSON.stringify(body),
        });

        alert("Reading added successfully!");
      }

      setGlucose("");
      setTime("morning");
      setEditingId(null);

      await fetchReadings();
    } catch (error) {
      setError(error.message);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  // Start editing
  function handleEdit(reading) {
    setEditingId(reading.id);
    setTime(reading.slot);
    setGlucose(String(reading.value));
  }

  // Cancel editing
  function handleCancelEdit() {
    setEditingId(null);
    setTime("morning");
    setGlucose("");
  }

  // Delete reading
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reading?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/api/readings/${id}`, {
        method: "DELETE",
      });

      if (editingId === id) {
        handleCancelEdit();
      }

      alert("Reading deleted successfully!");

      await fetchReadings();
    } catch (error) {
      setError(error.message);
      alert(error.message);
    }
  }

  // Logout
  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  }

  // Format date for display
  function formatDate(value) {
    const dateValue = new Date(`${value}T00:00:00`);

    return dateValue.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Reports
  const [report, setReport] = useState({
    highest: "-",
    lowest: "-",
    average: "-",
    totalReadings: 0,
  });

  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        setReportLoading(true);

        const endpoint =
          reportType === "daily"
            ? `/api/reports/daily?date=${selectedDate}`
            : `/api/reports/month?date=${selectedDate}`;

        const data = await apiRequest(endpoint);

        // Supports either { report: {...} } or a direct report object
        const result = data.report || data;

        const highest = result.highest ?? result.max ?? null;
        const lowest = result.lowest ?? result.min ?? null;
        const average = result.average ?? result.avg ?? null;
        const count =
          result.total_readings ??
          result.totalReadings ??
          result.count ??
          0;

        setReport({
          highest: highest ?? "-",
          lowest: lowest ?? "-",
          average:
            average === null
              ? "-"
              : Number(average).toFixed(1),
          totalReadings: Number(count),
        });
      } catch (error) {
        setReport({
          highest: "-",
          lowest: "-",
          average: "-",
          totalReadings: 0,
        });

        setError(error.message);
      } finally {
        setReportLoading(false);
      }
    }

    fetchReport();
  }, [selectedDate, reportType]);

  return (
    <div>
      <header className="header">
        <div>
          <h1>Sweety</h1>
          <p>Your daily glucose diary</p>
        </div>

        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main>
        {/* DATE SELECTION */}
        <section>
          <h2>Hello!</h2>
          <p>Welcome to your glucose dashboard.</p>

          <LibraryDatePicker
            selectedDate={date}
            onDateChange={(newDate) => {
              if (newDate) {
                setDate(newDate);
                handleCancelEdit();
              }
            }}
          />
        </section>

        {/* ADD OR EDIT READING */}
        <section>
          <h2>
            {editingId !== null
              ? "Edit Glucose Reading"
              : "Add Glucose Reading"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="time">Time Slot</label>

              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {slots.map((slot) => (
                  <option
                    key={slot.value}
                    value={slot.value}
                    disabled={isSlotUsed(slot.value)}
                  >
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="glucose">Glucose Value</label>

              <input
                id="glucose"
                type="number"
                min="40"
                max="600"
                step="1"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="Enter glucose value"
                required
              />
            </div>

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update Reading"
                : "Add Reading"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </form>
        </section>

        {/* DAILY READINGS */}
        <section>
          <h2>Daily Readings</h2>

          <p>{dailyReadings.length} of 4 readings recorded</p>

          {loading ? (
            <p>Loading readings...</p>
          ) : dailyReadings.length === 0 ? (
            <p>No readings recorded for this date.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Glucose Value</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {dailyReadings.map((reading) => (
                  <tr key={reading.id}>
                    <td>
                      {
                        slots.find(
                          (slot) => slot.value === reading.slot
                        )?.label
                      }
                    </td>

                    <td>{reading.value}</td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(reading)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(reading.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* REPORTS */}
        <section>
          <h2>Reports</h2>

          <div>
            <button
              type="button"
              onClick={() => setReportType("daily")}
            >
              Daily
            </button>

            <button
              type="button"
              onClick={() => setReportType("month")}
            >
              Month-to-date
            </button>
          </div>

          <p>
            Report period:{" "}
            {reportType === "daily"
              ? formatDate(selectedDate)
              : `${formatDate(
                  `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                  ).padStart(2, "0")}-01`
                )} – ${formatDate(selectedDate)}`}
          </p>

          {reportLoading ? (
            <p>Loading report...</p>
          ) : (
            <>
              <div>
                <h3>Highest</h3>
                <p>{report.highest}</p>
              </div>

              <div>
                <h3>Lowest</h3>
                <p>{report.lowest}</p>
              </div>

              <div>
                <h3>Average</h3>
                <p>{report.average}</p>
              </div>

              <div>
                <h3>Total Readings</h3>
                <p>{report.totalReadings}</p>
              </div>

              {report.totalReadings === 0 && (
                <p>No readings recorded for this period.</p>
              )}
            </>
          )}
        </section>

        {error && <p className="error-message">{error}</p>}
      </main>

      <footer>
        <p>Sweety - Blood Glucose Tracker</p>
      </footer>
    </div>
  );
}
