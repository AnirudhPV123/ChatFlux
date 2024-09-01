import React from 'react'

function Loader({loaderSize}) {
  return <span className={`loading loading-bars ${loaderSize}`}></span>;
}

export default Loader