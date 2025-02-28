import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import { data as originalData } from "../data";
import Chart from "chart.js/auto";
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
  const [spendStacked, setSpendStacked] = useState(true);
  const [revenueStacked, setRevenueStacked] = useState(true);
  const [spendChartData, setSpendChartData] = useState(null);
  const [revenueChartData, setRevenueChartData] = useState(null);

  // Optional: You can also create a direct Chart.js chart without react-chartjs-2
  const canvasRef = useRef(null);

  useEffect(() => {
    prepareChartData();

    // Example of direct Chart.js initialization (not rendered by default)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["January", "February", "March", "April", "May", "June"],
          datasets: [
            {
              label: "Sample Data",
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      // Cleanup function
      return () => {
        if (myChart) {
          myChart.destroy();
        }
      };
    }
  }, []);

  const prepareChartData = () => {
    const dates = Object.keys(originalData.data).filter(
      (date) => date !== "Total"
    );
    const platforms = ["Facebook", "GoogleAds", "Applovin"];

    // Prepare data for spend chart
    setSpendChartData({
      labels: dates,
      datasets: platforms.map((platform, index) => {
        return {
          label: platform,
          data: dates.map(
            (date) => originalData.data[date][platform]?.spend || 0
          ),
          backgroundColor: getChartColor(index, 0.7),
          borderColor: getChartColor(index, 1),
          borderWidth: 1,
          pointRadius: 4,
          fill: false,
        };
      }),
    });

    // Prepare data for revenue chart
    setRevenueChartData({
      labels: dates,
      datasets: platforms.map((platform, index) => {
        return {
          label: platform,
          data: dates.map(
            (date) => originalData.data[date][platform]?.daily_revenue || 0
          ),
          backgroundColor: getChartColor(index, 0.7),
          borderColor: getChartColor(index, 1),
          borderWidth: 1,
          pointRadius: 4,
          fill: false,
        };
      }),
    });
  };

  const getChartColor = (index, alpha) => {
    const colors = [
      `rgba(54, 162, 235, ${alpha})`, // Blue for Facebook
      `rgba(255, 193, 7, ${alpha})`, // Yellow for GoogleAds
      `rgba(220, 53, 69, ${alpha})`, // Red for Applovin
    ];

    return colors[index % colors.length];
  };

  const toggleSpendStack = () => {
    setSpendStacked(!spendStacked);
  };

  const toggleRevenueStack = () => {
    setRevenueStacked(!revenueStacked);
  };

  const chartOptions = (title, isStacked) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: title,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                context.dataset.label + ": $" + context.raw.toLocaleString()
              );
            },
          },
        },
      },
      scales: {
        x: {
          stacked: isStacked,
          grid: {
            display: true,
            color: "rgba(0,0,0,0.05)",
          },
        },
        y: {
          stacked: isStacked,
          beginAtZero: true,
          grid: {
            display: true,
          },
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
      },
      elements: {
        line: {
          tension: 0.2,
        },
        point: {
          radius: 4,
        },
      },
    };
  };

  if (!spendChartData || !revenueChartData) {
    return <div>Loading charts...</div>;
  }

  return (
    <Row>
      {/* Spend Chart */}
      <Col lg={6}>
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">Spend</h4>
              <div className="toggle-switch">
                <span>Stack</span>
                <div
                  className={`toggle-track ${spendStacked ? "active" : ""}`}
                  onClick={toggleSpendStack}
                >
                  <div className="toggle-thumb"></div>
                </div>
                <span>UnStack</span>
              </div>
            </div>
            <div className="chart-container">
              <Line
                data={spendChartData}
                options={chartOptions("Spend", spendStacked)}
              />
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Revenue Chart */}
      <Col lg={6}>
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">Daily Revenue</h4>
              <div className="toggle-switch">
                <span>Stack</span>
                <div
                  className={`toggle-track ${revenueStacked ? "active" : ""}`}
                  onClick={toggleRevenueStack}
                >
                  <div className="toggle-thumb"></div>
                </div>
                <span>UnStack</span>
              </div>
            </div>
            <div className="chart-container">
              <Line
                data={revenueChartData}
                options={chartOptions("Daily Revenue", revenueStacked)}
              />
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Optional: Direct Chart.js canvas (hidden by default) */}
      <div style={{ display: "none" }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </Row>
  );
};

export default ChartSection;
