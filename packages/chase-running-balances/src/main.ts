const PREFIX = "[Chase Running Balances]";

function log(...args: unknown[]) {
  console.log(PREFIX, ...args);
}

function warn(...args: unknown[]) {
  console.warn(PREFIX, ...args);
}

function parseAmount(raw: string): number {
  const negative = raw.startsWith("-");
  const num = Number(raw.replace(/[^0-9.]/g, ""));
  return negative ? -num : num;
}

function formatAmount(cents: number): string {
  const abs = Math.abs(cents / 100);
  const formatted = `$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return cents < 0 ? `-${formatted}` : formatted;
}

function extractAmount(dataValues: string): string {
  const match = dataValues.match(/-?\$[\d,]+\.\d{2}/);
  return match ? match[0] : "$0";
}

function addBalanceToRow(row: HTMLTableRowElement, runningCents: number) {
  const isDashed = !row.classList.contains("mds-activity-table__row--solid");
  const balanceCell = document.createElement("td");
  balanceCell.className = `running-balance-cell mds-activity-table__row-value mds-activity-table__row-value--right${isDashed ? " mds-activity-table__row-value--dashed" : ""}`;
  balanceCell.style.fontVariantNumeric = "tabular-nums";
  balanceCell.style.whiteSpace = "nowrap";

  const balanceText = document.createElement("div");
  balanceText.className = "mds-activity-table__row-value--text";
  balanceText.textContent = formatAmount(runningCents);
  balanceCell.appendChild(balanceText);

  row.insertBefore(balanceCell, row.lastElementChild);
}

function getRowAmountCents(row: HTMLTableRowElement): number {
  const dataValues = row.getAttribute("data-values") ?? "";
  const amountStr = extractAmount(dataValues);
  return Math.round(parseAmount(amountStr) * 100);
}

function addRunningBalances() {
  const balanceEl = document.querySelector<HTMLElement>(
    ".activity-tile__recon-bar-balance",
  );
  if (!balanceEl) {
    warn("Balance element not found (.activity-tile__recon-bar-balance)");
    return;
  }

  const currentBalance = parseAmount(balanceEl.textContent?.trim() ?? "0");
  const balanceCents = Math.round(currentBalance * 100);
  log("Current balance:", formatAmount(balanceCents));

  const tables = document.querySelectorAll("table.mds-activity-table");
  if (!tables[1]) {
    warn(`Expected 2 activity tables, found ${tables.length}`);
    return;
  }
  const postedTable = tables[1];

  // Remove previous additions if re-running
  const stale = postedTable.querySelectorAll(
    ".running-balance-header, .running-balance-cell",
  );
  if (stale.length > 0) {
    log("Removing", stale.length, "stale balance elements");
    for (const el of stale) el.remove();
  }

  // Add header for the Balance column
  const headerRow = postedTable.querySelector("tr");
  if (!headerRow) {
    warn("No header row found in posted table");
    return;
  }
  if (!headerRow.querySelector(".running-balance-header")) {
    const balanceHeader = document.createElement("th");
    balanceHeader.scope = "col";
    balanceHeader.className =
      "running-balance-header mds-activity-table__column-header mds-activity-table__column-header--right";
    balanceHeader.style.minWidth = "120px";
    balanceHeader.innerHTML = '<span style="padding: 0 16px;">Balance</span>';
    headerRow.insertBefore(balanceHeader, headerRow.lastElementChild);
  }

  // Process each transaction row
  const rows =
    postedTable.querySelectorAll<HTMLTableRowElement>("tr[data-values]");
  let runningCents = balanceCents;

  for (const row of rows) {
    addBalanceToRow(row, runningCents);
    runningCents -= getRowAmountCents(row);
  }
  log("Processed", rows.length, "rows");

  // Watch for new rows added by "See more activity" pagination
  const observer = new MutationObserver(() => {
    const allRows =
      postedTable.querySelectorAll<HTMLTableRowElement>("tr[data-values]");
    const newRows = postedTable.querySelectorAll<HTMLTableRowElement>(
      "tr[data-values]:not(:has(.running-balance-cell))",
    );
    if (newRows.length === 0) return;

    log("Pagination detected:", newRows.length, "new rows");

    // Recalculate from the last row that has a balance to find the
    // running total for the new rows
    let cents = balanceCents;
    for (const row of allRows) {
      const existing = row.querySelector(".running-balance-cell");
      if (existing) {
        cents -= getRowAmountCents(row);
        continue;
      }
      addBalanceToRow(row, cents);
      cents -= getRowAmountCents(row);
    }
    log("Total rows after pagination:", allRows.length);
  });
  observer.observe(postedTable, { childList: true, subtree: true });
  log("Watching for pagination changes");
}

function waitForElement(selector: string, timeout = 10000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    log("Waiting for", selector);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);
  });
}

async function main() {
  log("Script started");
  try {
    await waitForElement(".activity-tile__recon-bar-balance");
    // Small delay to ensure the table is fully rendered
    await new Promise((r) => setTimeout(r, 500));
    addRunningBalances();
    log("Done");
  } catch (e) {
    warn("Failed to initialize:", e);
  }
}

main();
