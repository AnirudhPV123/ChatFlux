// password condition for signup 
const PasswordCondition: React.FC<{
  text: string;
  condition: boolean;
  error: string | undefined;
  isTouched: boolean;
}> = ({ text, condition, error, isTouched }) => (
  <label className="flex cursor-pointer items-center gap-2">
    <input
      type="checkbox"
      checked={condition}
      className={`checkbox-primary checkbox size-4`}
      disabled
    />
    <span
      className={`label-text text-xs ${error && isTouched && !condition ? "text-error" : ""}`}
    >
      {text}
    </span>
  </label>
);

export default PasswordCondition;
