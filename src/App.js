import React from "react";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import NetworkTable from "./components/NetworkTable";
import ChartSection from "./components/ChartSection";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <Container fluid className="py-4">
      <Header />
      <NetworkTable />
      <ChartSection />
    </Container>
  );
}

export default App;
