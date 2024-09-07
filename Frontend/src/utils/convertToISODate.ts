function convertToISODate({
  year,
  month,
  day,
}: {
  year: string;
  month: string;
  day: string;
}) {
  console.log("hi", year, month, day);

  // Construct the ISO date string in "YYYY-MM-DD" format
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export default convertToISODate;
