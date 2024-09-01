type ButtonProps = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      // className="relative w-full rounded-sm bg-white py-2 text-2xl font-semibold text-black duration-150 hover:bg-green-700 hover:text-white"
      className="btn btn-primary mt-4 flex-1 font-semibold text-xl "
    >
      {children}
    </button>
  );
}

export default Button;
