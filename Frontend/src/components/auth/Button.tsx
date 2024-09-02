type ButtonProps = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="btn btn-primary mt-4 flex-1 text-xl font-semibold"
    >
      {children}
    </button>
  );
}

export default Button;
