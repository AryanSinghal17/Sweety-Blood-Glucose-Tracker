
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function LibraryDatePicker({ selectedDate, onDateChange }) {
  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        dateFormat="yyyy/MM/dd"
      />
    </div>
  );
}
