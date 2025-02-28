import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import sampleData from "../sampleData.json";

const SpendChart = () => {
  const [spendStacked, setSpendStacked] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    prepareChartData();
  }, []);

  const prepareChartData = () => {
    // Get data from sampleData
    const dates = Object.keys(sampleData.data).filter(
      (date) => date !== "Total"
    );
    const platforms = ["Facebook", "GoogleAds", "Applovin"];

    // Prepare data for spend chart
    setChartData({
      labels: dates,
      datasets: platforms.map((platform, index) => {
        return {
          label: platform,
          data: dates.map(
            (date) => sampleData.data[date][platform]?.spend || 0
          ),
          backgroundColor: getChartColor(index, 0.7),
          borderColor: getChartColor(index, 1),
          borderWidth: 2,
          pointRadius: 4,
          fill: spendStacked ? (index === 0 ? "origin" : index - 1) : false,
          tension: 0.1,
        };
      }),
    });
  };

  // Update chart when stacked state changes
  useEffect(() => {
    if (chartData) {
      const updatedData = {
        ...chartData,
        datasets: chartData.datasets.map((dataset, index) => ({
          ...dataset,
          fill: spendStacked ? (index === 0 ? "origin" : index - 1) : false,
        })),
      };
      setChartData(updatedData);
    }
  }, [spendStacked, chartData]);

  const getChartColor = (index, alpha) => {
    const colors = [
      `rgba(54, 162, 235, ${alpha})`, // Blue for Facebook
      `rgba(255, 193, 7, ${alpha})`, // Yellow for GoogleAds
      `rgba(220, 53, 69, ${alpha})`, // Red for Applovin
    ];

    return colors[index % colors.length];
  };

  const toggleStack = () => {
    setSpendStacked(!spendStacked);
  };

  const chartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      transitions: {
        active: {
          animation: {
            duration: 0,
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 10,
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: "Daily Spend",
          font: {
            size: 16,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          stacked: spendStacked,
          title: {
            display: true,
            text: "Amount ($)",
          },
          beginAtZero: true,
        },
      },
    };
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="card-title mb-0">Daily Spend</h4>
          <div className="toggle-switch">
            <span>Stack</span>
            <div
              className={`toggle-track ${spendStacked ? "active" : ""}`}
              onClick={toggleStack}
            >
              <div className="toggle-thumb"></div>
            </div>
            <span>UnStack</span>
          </div>
        </div>
        <div className="chart-container">
          {chartData && <Line data={chartData} options={chartOptions()} />}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SpendChart;
