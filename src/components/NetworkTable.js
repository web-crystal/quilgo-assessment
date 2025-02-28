import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  InputGroup,
  FormControl,
  Button,
  Modal,
  Form,
  ListGroup,
} from "react-bootstrap";
import sampleData from "../sampleData.json";
import $ from "jquery";
import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";

const NetworkTable = () => {
  const tableRef = useRef(null);
  const tableInstance = useRef(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [availableMetrics, setAvailableMetrics] = useState([
    { id: "network", title: "Network", selected: true, fixed: true },
    { id: "spend", title: "Spend", selected: true },
    { id: "cpi", title: "CPI", selected: true },
    { id: "ltv90", title: "LTV90", selected: true },
    { id: "installs", title: "Installs", selected: true },
    { id: "daily_revenue", title: "Daily Rev", selected: true },
    { id: "ltv0u", title: "ltv0u", selected: true },
    { id: "ltv1u", title: "ltv1u", selected: true },
    { id: "ltv2u", title: "ltv2u", selected: true },
    { id: "ltv3u", title: "ltv3u", selected: true },
    { id: "ltv7u", title: "ltv7u", selected: true },
    { id: "ltv30u", title: "ltv30u", selected: true },
    { id: "roi", title: "ROI", selected: true },
  ]);

  // Prepare the table data
  useEffect(() => {
    const prepareTableData = () => {
      const platforms = ["Applovin", "Facebook", "GoogleAds", "total"];

      // Check if Total exists, if not, use the first date as a fallback
      const data = sampleData.data;
      const dateKeys = Object.keys(data);
      const totalData = data.Total || data[dateKeys[0]];

      // Prepare the main table data
      const mainData = platforms
        .map((platform) => {
          if (!totalData[platform]) return null;

          const platformData = totalData[platform];
          let colorClass = "";
          if (platform === "Facebook") colorClass = "facebook-row";
          else if (platform === "GoogleAds") colorClass = "googleads-row";
          else if (platform === "Applovin") colorClass = "applovin-row";
          else colorClass = "total-row";

          // Calculate ROI from the data
          const roi =
            platformData.cohort_revenue_d30 && platformData.spend
              ? (
                  ((platformData.cohort_revenue_d30 - platformData.spend) /
                    platformData.spend) *
                  100
                ).toFixed(2)
              : 0;

          // IMPORTANT: Make sure each value is safely accessed and has a fallback
          return {
            network: `<div data-row-class="${colorClass}">${getNetworkIndicator(
              platform
            )}${platform}</div>`,
            spend: platformData.spend || 0,
            cpi: platformData.cpi || 0,
            ltv90: platformData.ltv90 || 0,
            installs: platformData.installs || 0,
            daily_revenue: platformData.daily_revenue || 0,
            ltv0u: formatLtvCell(
              platformData.cohort_revenue_d0 || 0,
              (platformData.ret_d1 || 0) * 100
            ),
            ltv1u: formatLtvCell(
              platformData.cohort_revenue_d1 || 0,
              (platformData.ret_d2 || 0) * 100
            ),
            ltv2u: formatLtvCell(
              platformData.cohort_revenue_d2 || 0,
              (platformData.ret_d3 || 0) * 100
            ),
            ltv3u: formatLtvCell(
              platformData.cohort_revenue_d3 || 0,
              (platformData.ret_d7 || 0) * 100
            ),
            ltv7u: formatLtvCell(
              platformData.cohort_revenue_d7 || 0,
              (platformData.ret_d14 || 0) * 100
            ),
            ltv30u: formatLtvCell(
              platformData.cohort_revenue_d30 || 0,
              (platformData.ret_d30 || 0) * 100
            ),
            roi: `<div class="roi-value">${roi}%</div>`,
          };
        })
        .filter(Boolean);

      setTableData(mainData);
    };

    prepareTableData();
  }, []);

  // Initialize or reinitialize the table when data is available
  useEffect(() => {
    if (tableData.length > 0 && tableRef.current) {
      initializeTable();
    }

    return () => {
      // Clean up DataTable on component unmount or reinitialization
      if (tableInstance.current) {
        tableInstance.current.destroy();
        tableInstance.current = null;
      }
    };
  }, [tableData]);

  // Function to initialize or reinitialize the DataTable
  const initializeTable = () => {
    // Destroy existing table instance and clear the table HTML
    if (tableInstance.current) {
      tableInstance.current.destroy();
      tableInstance.current = null;
      $(tableRef.current).empty(); // Clear the table's HTML content
    }

    // Create a filtered list of metrics to display
    const selectedMetricIds = availableMetrics
      .filter((metric) => metric.selected)
      .map((metric) => metric.id);

    // Create properly formatted columns with all required properties
    const columns = selectedMetricIds.map((metricId) => {
      const metric = availableMetrics.find((m) => m.id === metricId);

      // Base column definition
      const column = {
        title: metric.title,
        data: metricId,
        className: metricId === "roi" ? "dt-center roi-column" : "dt-center",
      };

      // Add specific renderers for different column types
      if (["spend", "cpi", "ltv90", "daily_revenue"].includes(metricId)) {
        column.render = function (data) {
          return data ? `$${parseFloat(data).toLocaleString()}` : "$0.00";
        };
      } else if (metricId === "installs") {
        column.render = function (data) {
          return data ? data.toLocaleString() : "0";
        };
      }

      return column;
    });

    // Initialize the DataTable with filtered columns
    try {
      // Add an empty header row to ensure table structure matches column definitions
      $(tableRef.current).html("<thead><tr></tr></thead><tbody></tbody>");

      tableInstance.current = new DataTable(tableRef.current, {
        data: tableData,
        columns: columns,
        ordering: true,
        order: [[0, "asc"]],
        paging: false,
        searching: true,
        responsive: true,
        dom: 'rt<"bottom"lip>',
        language: {
          search: "",
          searchPlaceholder: "",
        },
        destroy: true, // Add this option to ensure clean recreation
        columnDefs: [
          {
            targets: "_all",
            className: "dt-center",
          },
        ],
      });

      // Connect search input to the DataTable
      $("#tableSearch").on("keyup", function () {
        tableInstance.current.search(this.value).draw();
      });
    } catch (error) {
      console.error("DataTable initialization error:", error);
      console.error("Selected columns:", columns);
      console.error(
        "Table data sample:",
        tableData.length > 0 ? tableData[0] : "No data"
      );
    }
  };

  // Helper function to generate network color indicator
  const getNetworkIndicator = (network) => {
    let color = "";
    if (network === "Facebook") color = "#36a2eb";
    else if (network === "GoogleAds") color = "#ffce56";
    else if (network === "Applovin") color = "#ff6384";
    else color = "#4bc0c0";

    return `<span class="platform-indicator" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; background-color: ${color}"></span>`;
  };

  // Helper function to format LTV cells
  const formatLtvCell = (value, percent) => {
    return `<div class="ltv-value">$${value.toFixed(2)}</div>
            <div class="ltv-percent">${percent.toFixed(2)}%</div>`;
  };

  // Open metrics editor modal
  const handleOpenMetricsEditor = () => {
    setShowMetricsModal(true);
  };

  // Save selected metrics and close modal
  const handleSaveMetrics = () => {
    // Simply reinitialize the table - the useEffect will pick up the changes
    // from availableMetrics and rerender the table
    initializeTable();
    setShowMetricsModal(false);
  };

  // Toggle metric selection
  const toggleMetric = (id) => {
    setAvailableMetrics(
      availableMetrics.map((metric) =>
        metric.id === id && !metric.fixed
          ? { ...metric, selected: !metric.selected }
          : metric
      )
    );
  };

  return (
    <Card>
      <Card.Body>
        <h2 className="mb-4">Network</h2>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="search-container">
            <InputGroup>
              <InputGroup.Text>Search:</InputGroup.Text>
              <FormControl id="tableSearch" />
            </InputGroup>
          </div>
          <Button
            className="edit-metrics-btn"
            onClick={handleOpenMetricsEditor}
          >
            EDIT METRICS
          </Button>
        </div>

        {/* Main DataTable */}
        <table
          id="networkTable"
          ref={tableRef}
          className="display responsive nowrap"
          style={{ width: "100%" }}
        ></table>

        {/* Metrics Editor Modal */}
        <Modal
          show={showMetricsModal}
          onHide={() => setShowMetricsModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Visible Metrics</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Select which metrics you want to display in the table:</p>
            <ListGroup>
              {availableMetrics.map((metric) => (
                <ListGroup.Item
                  key={metric.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <Form.Check
                    type="checkbox"
                    id={`metric-${metric.id}`}
                    label={metric.title}
                    checked={metric.selected}
                    onChange={() => toggleMetric(metric.id)}
                    disabled={metric.fixed}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowMetricsModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveMetrics}>
              Apply Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default NetworkTable;
