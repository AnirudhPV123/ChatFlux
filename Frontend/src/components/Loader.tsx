function Loader({ loaderSize }: { loaderSize: string }) {
  return <span className={`loading loading-bars ${loaderSize}`}></span>;
}

export default Loader;
