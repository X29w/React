import type { FC } from "react";
import React, { useState } from "react";

interface AppProps {}

const App: FC<AppProps> = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};

export default App;
