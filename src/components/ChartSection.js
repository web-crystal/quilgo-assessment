import React from "react";
import { Row, Col } from "react-bootstrap";
import SpendChart from "./SpendChart";
import RevenueChart from "./RevenueChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartSection = () => {
  return (
    <Row>
      <Col lg={6}>
        <SpendChart />
      </Col>
      <Col lg={6}>
        <RevenueChart />
      </Col>
    </Row>
  );
};

export default ChartSection;
