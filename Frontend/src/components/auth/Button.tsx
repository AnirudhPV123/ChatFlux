import { memo } from "react";
import Loader from "../Loader";

type ButtonProps = {
  children: React.ReactNode;
  isLoading: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ isLoading, children, ...props }: ButtonProps) {
  return (
    <button
      type="submit"
      {...props}
      className="btn btn-primary mt-4 flex-1 rounded-full text-lg font-bold"
      disabled={isLoading}
    >
      {isLoading ? <Loader loaderSize="loading-md" /> : children}
    </button>
  );
}

const MemoizedButton = memo(Button);
export default MemoizedButton;
