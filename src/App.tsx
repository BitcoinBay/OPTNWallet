import { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Transaction from './pages/Transaction';

function App() {
  const [count, setCount] = useState(0)

  return (
  <>
    <Routes>
      <Route path = "/" element = {<Home/>}/>
    </Routes>
  </>
  )
}
export default App
