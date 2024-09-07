import { months } from "@/constants/months";
import useFormikFormField from "@/hooks/useFormikFormField";
import { FC, memo } from "react";

interface DateOfBirthValue {
  year?: string;
  day?: string;
  month?: string;
}

interface DateOfBirthErrors {
  year?: string;
  month?: string;
  day?: string;
}

const DateOfBirth: FC = () => {
  const { error, isTouched, value, handleBlur, handleChange } =
    useFormikFormField("dateOfBirth");

  const { year, day, month } = value as unknown as DateOfBirthValue;

  let errorYear;
  let errorMonth;
  let errorDay;

  if (error !== undefined) {
    const { day, month, year } = error as unknown as DateOfBirthErrors;
    errorYear = year;
    errorDay = day;
    errorMonth = month;
  }

  return (
    <>
      <label className="label-text mt-4 font-semibold text-gray-300">
        Date of Birth
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          name="dateOfBirth.year"
          value={year || ""}
          placeholder="YYYY"
          className={`input input-bordered w-1/4 ${errorYear && isTouched && "border-error"}`}
          onChange={(e) => {
            if (e.target.value.length > 4) return;
            handleChange(e);
          }}
          onBlur={handleBlur}
        />
        <select
          name="dateOfBirth.month"
          className={`input input-bordered w-2/4 ${errorMonth && isTouched && "border-error"}`}
          value={month || ""}
          onBlur={handleBlur}
          onChange={(e) =>
            handleChange({
              target: {
                name: "dateOfBirth.month",
                value: months.indexOf(e.target.value),
              },
            })
          }
        >
          <option value="" disabled>
            Month
          </option>
          {months.map((month, index) => (
            <option key={index} value={month}>
              {month}
            </option>
          ))}
        </select>
        <input
          value={day}
          type="number"
          name="dateOfBirth.day"
          placeholder="DD"
          className={`input input-bordered w-1/4 ${errorDay && isTouched && "border-error"}`}
          onChange={(e) => {
            if (e.target.value.length > 2) return;
            handleChange(e);
          }}
          onBlur={handleBlur}
        />
      </div>
    </>
  );
};

const MemoizedDateOfBirth = memo(DateOfBirth);
export default MemoizedDateOfBirth;
