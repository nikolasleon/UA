import "./App.css";
import { useEffect, useState } from "react";
import Buscar from "./pages/Buscar";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <Buscar />

      {/* Mensaje backend opcional */}
      {/* <p>{message}</p> */}
    </>
  );
}

export default App;