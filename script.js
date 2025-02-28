// Store the original data
let originalData;
let dataTable;
let spendChart;
let revenueChart;

// Initialize the dashboard
$(document).ready(function () {
  // Load the data
  originalData = data;
  processData(data);

  // Set up event listeners for filters
  $("#dateFilter, #platformFilter, #metricFilter").on("change", function () {
    applyFilters();
  });

  // Add this event handler after your other listeners
  $("#stackToggle").on("change", function () {
    const isStacked = $(this).prop("checked");

    // Update chart stacking option
    spendChart.options.scales.x.stacked = isStacked;
    spendChart.options.scales.y.stacked = isStacked;
    spendChart.update();

    // Optionally update revenue chart too if needed
    revenueChart.options.scales.x.stacked = isStacked;
    revenueChart.options.scales.y.stacked = isStacked;
    revenueChart.update();
  });

  // Add this event handler
  $("#tableSearch").on("keyup", function () {
    dataTable.search($(this).val()).draw();
  });
});

// Process the JSON data
function processData(data) {
  const tableData = [];
  const dates = Object.keys(data.data).filter((date) => date !== "Total");
  const platforms = ["Facebook", "GoogleAds", "Applovin", "total"];

  // Process data for table
  dates.forEach((date) => {
    platforms.forEach((platform) => {
      if (data.data[date][platform]) {
        const platformData = data.data[date][platform];
        const roi = (
          ((platformData.cohort_revenue_d30 - platformData.spend) /
            platformData.spend) *
          100
        ).toFixed(2);

        tableData.push({
          date: date,
          platform: platform === "total" ? "Total" : platform,
          spend: platformData.spend,
          revenueD0: platformData.cohort_revenue_d0,
          revenueD1: platformData.cohort_revenue_d1,
          revenueD7: platformData.cohort_revenue_d7,
          revenueD30: platformData.cohort_revenue_d30,
          installs: platformData.installs,
          retentionD1: (platformData.ret_d1 * 100).toFixed(2) + "%",
          retentionD7: (platformData.ret_d7 * 100).toFixed(2) + "%",
          roi: roi + "%",
        });
      }
    });
  });

  // Initialize DataTable
  dataTable = $("#performanceTable").DataTable({
    data: tableData,
    columns: [
      { data: "date" },
      { data: "platform" },
      {
        data: "spend",
        render: function (data) {
          return "$" + data.toLocaleString();
        },
      },
      {
        data: "revenueD0",
        render: function (data) {
          return "$" + data.toLocaleString();
        },
      },
      {
        data: "revenueD1",
        render: function (data) {
          return "$" + data.toLocaleString();
        },
      },
      {
        data: "revenueD7",
        render: function (data) {
          return "$" + data.toLocaleString();
        },
      },
      {
        data: "revenueD30",
        render: function (data) {
          return "$" + data.toLocaleString();
        },
      },
      {
        data: "installs",
        render: function (data) {
          return data.toLocaleString();
        },
      },
      { data: "retentionD1" },
      { data: "retentionD7" },
      { data: "roi" },
    ],
    pageLength: 10,
    responsive: true,
    order: [
      [0, "asc"],
      [1, "asc"],
    ],
    columnDefs: [
      {
        targets: "_all",
        className: "dt-head-center",
      },
    ],
    columnDefs: [
      {
        targets: 1,
        render: function (data, type, row) {
          let color = "";
          if (data === "Facebook") color = "#36a2eb";
          else if (data === "GoogleAds") color = "#ffce56";
          else if (data === "Applovin") color = "#ff6384";
          else color = "#4bc0c0";

          return `<span class="platform-indicator" style="background-color:${color}"></span>${data}`;
        },
      },
    ],
  });

  // Update summary metrics
  updateSummaryMetrics(data);

  // Initialize charts
  initializeCharts(data);
}

// Update the summary metrics cards
function updateSummaryMetrics(data) {
  let totalSpend = 0;
  let totalRevenue = 0;
  let totalInstalls = 0;

  // Sum up all platform totals across all dates
  const dates = Object.keys(data.data).filter((date) => date !== "Total");
  dates.forEach((date) => {
    const platforms = ["Facebook", "GoogleAds", "Applovin"];
    platforms.forEach((platform) => {
      if (data.data[date][platform]) {
        totalSpend += data.data[date][platform].spend;
        totalRevenue += data.data[date][platform].cohort_revenue_d30;
        totalInstalls += data.data[date][platform].installs;
      }
    });
  });

  const averageROI = (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(
    2
  );

  // Update the DOM
  $("#totalSpend").text("$" + totalSpend.toLocaleString());
  $("#totalRevenue").text("$" + totalRevenue.toLocaleString());
  $("#totalInstalls").text(totalInstalls.toLocaleString());
  $("#averageROI").text(averageROI + "%");
}

// Initialize the charts
function initializeCharts(data) {
  const dates = Object.keys(data.data).filter((date) => date !== "Total");
  const platforms = ["Facebook", "GoogleAds", "Applovin"];

  // Prepare data for charts
  const spendData = {
    labels: dates,
    datasets: platforms.map((platform, index) => {
      return {
        label: platform,
        data: dates.map((date) => data.data[date][platform]?.spend || 0),
        backgroundColor: getColor(index, 0.7),
        borderColor: getColor(index, 1),
        borderWidth: 1,
      };
    }),
  };

  const revenueData = {
    labels: dates,
    datasets: platforms.map((platform, index) => {
      return {
        label: platform,
        data: dates.map(
          (date) => data.data[date][platform]?.cohort_revenue_d30 || 0
        ),
        backgroundColor: getColor(index, 0.7),
        borderColor: getColor(index, 1),
        borderWidth: 1,
      };
    }),
  };

  // Create spend chart
  const spendCtx = document.getElementById("spendChart").getContext("2d");
  spendChart = new Chart(spendCtx, {
    type: "line",
    data: spendData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Marketing Spend by Platform",
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
          stacked: true,
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: "Spend ($)",
          },
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    },
  });

  // Create revenue chart
  const revenueCtx = document.getElementById("revenueChart").getContext("2d");
  revenueChart = new Chart(revenueCtx, {
    type: "line",
    data: revenueData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Daily Revenue",
        },
        legend: {
          position: "bottom",
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
          grid: {
            display: true,
            color: "rgba(0,0,0,0.05)",
          },
        },
        y: {
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
    },
  });
}

// Apply the selected filters
function applyFilters() {
  const dateFilter = $("#dateFilter").val();
  const platformFilter = $("#platformFilter").val();
  const metricFilter = $("#metricFilter").val();

  // Filter table data
  dataTable.columns(0).search(dateFilter === "all" ? "" : dateFilter);
  dataTable.columns(1).search(platformFilter === "all" ? "" : platformFilter);
  dataTable.draw();

  // Update charts based on filters
  updateCharts(dateFilter, platformFilter, metricFilter);
}

// Update charts based on filters
function updateCharts(dateFilter, platformFilter, metricFilter) {
  const dates = Object.keys(originalData.data).filter(
    (date) => date !== "Total"
  );
  const filteredDates = dateFilter === "all" ? dates : [dateFilter];
  const platforms =
    platformFilter === "all"
      ? ["Facebook", "GoogleAds", "Applovin"]
      : [platformFilter];

  // Update spend chart
  spendChart.data.labels = filteredDates;
  spendChart.data.datasets = platforms.map((platform, index) => {
    return {
      label: platform,
      data: filteredDates.map(
        (date) => originalData.data[date][platform]?.spend || 0
      ),
      backgroundColor: getColor(index, 0.7),
      borderColor: getColor(index, 1),
      borderWidth: 1,
    };
  });
  spendChart.update();

  // Update revenue chart - select appropriate revenue metric based on filter
  let revenueMetric = "cohort_revenue_d30";
  let revenueTitle = "Revenue (D30)";

  if (metricFilter === "roi") {
    // For ROI, we'll calculate it from d30 revenue and spend
    revenueChart.data.datasets = platforms.map((platform, index) => {
      return {
        label: platform,
        data: filteredDates.map((date) => {
          const platformData = originalData.data[date][platform];
          if (!platformData) return 0;
          return (
            ((platformData.cohort_revenue_d30 - platformData.spend) /
              platformData.spend) *
            100
          );
        }),
        backgroundColor: getColor(platforms.indexOf(platform), 0.7),
        borderColor: getColor(platforms.indexOf(platform), 1),
        borderWidth: 2,
        fill: false,
      };
    });

    revenueChart.options.scales.y.title.text = "ROI (%)";
    revenueChart.options.scales.y.ticks.callback = function (value) {
      return value.toFixed(2) + "%";
    };
    revenueChart.options.plugins.title.text = "Return on Investment (D30)";
    revenueChart.options.plugins.tooltip.callbacks.label = function (context) {
      return context.dataset.label + ": " + context.raw.toFixed(2) + "%";
    };
  } else {
    // For revenue or spend, show the relevant metric
    const metric = metricFilter === "revenue" ? "cohort_revenue_d30" : "spend";
    const title =
      metricFilter === "revenue" ? "Revenue (D30)" : "Marketing Spend";

    revenueChart.data.datasets = platforms.map((platform, index) => {
      return {
        label: platform,
        data: filteredDates.map(
          (date) => originalData.data[date][platform]?.[metric] || 0
        ),
        backgroundColor: getColor(platforms.indexOf(platform), 0.7),
        borderColor: getColor(platforms.indexOf(platform), 1),
        borderWidth: 2,
        fill: false,
      };
    });

    revenueChart.options.scales.y.title.text = title + " ($)";
    revenueChart.options.scales.y.ticks.callback = function (value) {
      return "$" + value.toLocaleString();
    };
    revenueChart.options.plugins.title.text = title + " by Platform";
    revenueChart.options.plugins.tooltip.callbacks.label = function (context) {
      return context.dataset.label + ": $" + context.raw.toLocaleString();
    };
  }

  revenueChart.update();

  // Update summary metrics based on filters
  updateFilteredSummaryMetrics(filteredDates, platforms);
}

// Update summary metrics based on applied filters
function updateFilteredSummaryMetrics(filteredDates, platforms) {
  let totalSpend = 0;
  let totalRevenue = 0;
  let totalInstalls = 0;

  filteredDates.forEach((date) => {
    platforms.forEach((platform) => {
      if (originalData.data[date][platform]) {
        totalSpend += originalData.data[date][platform].spend;
        totalRevenue += originalData.data[date][platform].cohort_revenue_d30;
        totalInstalls += originalData.data[date][platform].installs;
      }
    });
  });

  const averageROI = (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(
    2
  );

  // Update the DOM
  $("#totalSpend").text("$" + totalSpend.toLocaleString());
  $("#totalRevenue").text("$" + totalRevenue.toLocaleString());
  $("#totalInstalls").text(totalInstalls.toLocaleString());
  $("#averageROI").text(averageROI + "%");
}

// Helper function to get colors for chart elements
function getColor(index, alpha) {
  const colors = [
    `rgba(54, 162, 235, ${alpha})`, // Blue for Facebook
    `rgba(255, 193, 7, ${alpha})`, // Yellow for GoogleAds
    `rgba(220, 53, 69, ${alpha})`, // Red for Applovin
  ];

  return colors[index % colors.length];
}
