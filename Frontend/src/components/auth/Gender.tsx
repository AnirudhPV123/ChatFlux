import { gender } from "@/constants/gener";
import useFormikFormField from "@/hooks/useFormikFormField";
import { memo } from "react";

function Gender() {
  const {
    error,
    isTouched,
    value: genderValue,
    handleChange,
    handleBlur,
  } = useFormikFormField("gender");
  return (
    <>
      <label className="label-text mt-4 font-semibold text-gray-300">
        Gender
      </label>
      <div className="flex gap-4">
        {gender.map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-2">
            <input
              id={value}
              type="radio"
              name="gender"
              checked={value === genderValue}
              value={value}
              className={`radio size-4 ${error && isTouched ? "radio-error" : "radio-primary"}`}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <span className="label-text text-xs capitalize">{value}</span>
          </label>
        ))}
      </div>
    </>
  );
}

const MemoizedGender = memo(Gender);
export default MemoizedGender;
