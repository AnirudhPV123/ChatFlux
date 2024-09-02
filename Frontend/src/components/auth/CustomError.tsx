function CustomError({ message }: { message: string }) {
  return (
    <div className="mb-2 text-center font-semibold text-red-600">{message}</div>
  );
}

export default CustomError;
