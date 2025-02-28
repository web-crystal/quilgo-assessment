import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { Card, InputGroup, FormControl, Button } from "react-bootstrap";
import { data } from "../data";
import $ from "jquery";
import "datatables.net-dt";

const NetworkTable = () => {
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [filterText, setFilterText] = useState("");
  const jQueryTableRef = useRef(null);

  useEffect(() => {
    // Process data for the table
    const platforms = ["Applovin", "Facebook", "GoogleAds", "total"];
    const aggregatedData = platforms.map((platform) => {
      const platformData = data.data.Total[platform];
      return {
        id: platform,
        network: platform === "total" ? "total" : platform,
        spend: platformData.spend,
        cpi: platformData.cpi,
        ltv90: platformData.ltv90,
        installs: platformData.installs,
        ltv0u: {
          value: platformData.cohort_revenue_d0,
          percent: platformData.ret_d1 * 100,
        },
        ltv1u: {
          value: platformData.cohort_revenue_d1,
          percent: platformData.ret_d2 * 100,
        },
        ltv2u: {
          value: platformData.cohort_revenue_d2,
          percent: platformData.ret_d3 * 100,
        },
        ltv3u: {
          value: platformData.cohort_revenue_d3,
          percent: platformData.ret_d7 * 100,
        },
        ltv7u: {
          value: platformData.cohort_revenue_d7,
          percent: platformData.ret_d14 * 100,
        },
      };
    });

    setTableData(aggregatedData);

    // Optional: You can initialize a jQuery DataTable here if needed
    // This is an example of how you might integrate jQuery DataTables
    if (jQueryTableRef.current) {
      const table = $(jQueryTableRef.current).DataTable({
        // jQuery DataTables configuration options
        paging: false,
        searching: true,
        // Add more options as needed
      });

      // Clean up function
      return () => {
        if (table) {
          table.destroy();
        }
      };
    }
  }, []);

  const getNetworkIndicator = (network) => {
    let color = "";
    if (network === "Facebook") color = "#36a2eb";
    else if (network === "GoogleAds") color = "#ffce56";
    else if (network === "Applovin") color = "#ff6384";
    else color = "#4bc0c0";

    return (
      <span
        className="platform-indicator"
        style={{ backgroundColor: color }}
      ></span>
    );
  };

  const toggleRowExpansion = (platform) => {
    setExpandedRows((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const ExpandableComponent = ({ data }) => {
    const platform = data.network;
    const dates = Object.keys(data.data).filter((date) => date !== "Total");

    return (
      <div className="p-3">
        <table className="table">
          <thead>
            <tr className="child-row">
              <th>Date</th>
              <th>Spend</th>
              <th>CPI</th>
              <th>LTV90</th>
              <th>Installs</th>
              <th>ltv0u</th>
              <th>ltv1u</th>
              <th>ltv2u</th>
              <th>ltv3u</th>
              <th>ltv7u</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => {
              const platformData = data.data[date][platform];
              return (
                <tr key={date} className="child-row">
                  <td>{date}</td>
                  <td>{platformData.spend.toLocaleString()}</td>
                  <td>{platformData.cpi}</td>
                  <td>{platformData.ltv90.toFixed(2)}</td>
                  <td>{platformData.installs.toLocaleString()}</td>
                  <td>
                    <div className="ltv-value">
                      ${platformData.cohort_revenue_d0.toFixed(2)}
                    </div>
                    <div className="ltv-percent">
                      {(platformData.ret_d1 * 100).toFixed(2)}%
                    </div>
                  </td>
                  <td>
                    <div className="ltv-value">
                      ${platformData.cohort_revenue_d1.toFixed(2)}
                    </div>
                    <div className="ltv-percent">
                      {(platformData.ret_d2 * 100).toFixed(2)}%
                    </div>
                  </td>
                  <td>
                    <div className="ltv-value">
                      ${platformData.cohort_revenue_d2.toFixed(2)}
                    </div>
                    <div className="ltv-percent">
                      {(platformData.ret_d3 * 100).toFixed(2)}%
                    </div>
                  </td>
                  <td>
                    <div className="ltv-value">
                      ${platformData.cohort_revenue_d3.toFixed(2)}
                    </div>
                    <div className="ltv-percent">
                      {(platformData.ret_d7 * 100).toFixed(2)}%
                    </div>
                  </td>
                  <td>
                    <div className="ltv-value">
                      ${platformData.cohort_revenue_d7.toFixed(2)}
                    </div>
                    <div className="ltv-percent">
                      {(platformData.ret_d14 * 100).toFixed(2)}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const columns = [
    {
      name: "Network",
      selector: (row) => row.network,
      cell: (row) => (
        <div>
          <span
            className="expand-btn"
            onClick={() => toggleRowExpansion(row.id)}
          >
            {expandedRows[row.id] ? "-" : "+"}
          </span>
          {getNetworkIndicator(row.network)}
          {row.network.charAt(0).toUpperCase() + row.network.slice(1)}
        </div>
      ),
    },
    {
      name: "Spend",
      selector: (row) => row.spend,
      format: (row) => row.spend.toLocaleString(),
    },
    {
      name: "CPI",
      selector: (row) => row.cpi,
    },
    {
      name: "LTV90",
      selector: (row) => row.ltv90,
      format: (row) => row.ltv90.toFixed(2),
    },
    {
      name: "Installs",
      selector: (row) => row.installs,
      format: (row) => row.installs.toLocaleString(),
    },
    {
      name: "ltv0u",
      selector: (row) => row.ltv0u,
      cell: (row) => (
        <div>
          <div className="ltv-value">${row.ltv0u.value.toFixed(2)}</div>
          <div className="ltv-percent">{row.ltv0u.percent.toFixed(2)}%</div>
        </div>
      ),
    },
    {
      name: "ltv1u",
      selector: (row) => row.ltv1u,
      cell: (row) => (
        <div>
          <div className="ltv-value">${row.ltv1u.value.toFixed(2)}</div>
          <div className="ltv-percent">{row.ltv1u.percent.toFixed(2)}%</div>
        </div>
      ),
    },
    {
      name: "ltv2u",
      selector: (row) => row.ltv2u,
      cell: (row) => (
        <div>
          <div className="ltv-value">${row.ltv2u.value.toFixed(2)}</div>
          <div className="ltv-percent">{row.ltv2u.percent.toFixed(2)}%</div>
        </div>
      ),
    },
    {
      name: "ltv3u",
      selector: (row) => row.ltv3u,
      cell: (row) => (
        <div>
          <div className="ltv-value">${row.ltv3u.value.toFixed(2)}</div>
          <div className="ltv-percent">{row.ltv3u.percent.toFixed(2)}%</div>
        </div>
      ),
    },
    {
      name: "ltv7u",
      selector: (row) => row.ltv7u,
      cell: (row) => (
        <div>
          <div className="ltv-value">${row.ltv7u.value.toFixed(2)}</div>
          <div className="ltv-percent">{row.ltv7u.percent.toFixed(2)}%</div>
        </div>
      ),
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) => expandedRows[row.id],
      style: {
        backgroundColor: "#f9f9f9",
      },
    },
  ];

  return (
    <Card>
      <Card.Body>
        <h2 className="mb-4">Network</h2>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="search-container">
            <InputGroup>
              <InputGroup.Text>Search:</InputGroup.Text>
              <FormControl
                id="tableSearch"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </InputGroup>
          </div>
          <Button className="edit-metrics-btn">EDIT METRICS</Button>
        </div>

        {/* React Data Table Component */}
        <DataTable
          columns={columns}
          data={tableData}
          noHeader
          pagination={false}
          conditionalRowStyles={conditionalRowStyles}
          expandableRows
          expandableRowsComponent={ExpandableComponent}
          expandableRowExpanded={(row) => expandedRows[row.id]}
          onRowExpandToggled={(expanded, row) => {
            toggleRowExpansion(row.id);
          }}
          fixedHeader
          fixedHeaderScrollHeight="500px"
          highlightOnHover
          filterText={filterText}
        />

        {/* Optional: jQuery DataTable (hidden by default, just showing implementation) */}
        <div style={{ display: "none" }}>
          <table ref={jQueryTableRef} className="display">
            <thead>
              <tr>
                <th>Network</th>
                <th>Spend</th>
                <th>CPI</th>
                <th>LTV90</th>
                <th>Installs</th>
                <th>ltv0u</th>
                <th>ltv1u</th>
                <th>ltv2u</th>
                <th>ltv3u</th>
                <th>ltv7u</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td>{row.network}</td>
                  <td>{row.spend}</td>
                  <td>{row.cpi}</td>
                  <td>{row.ltv90}</td>
                  <td>{row.installs}</td>
                  <td>{row.ltv0u.value}</td>
                  <td>{row.ltv1u.value}</td>
                  <td>{row.ltv2u.value}</td>
                  <td>{row.ltv3u.value}</td>
                  <td>{row.ltv7u.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default NetworkTable;
