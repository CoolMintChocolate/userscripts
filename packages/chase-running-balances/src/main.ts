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

function addRunningBalances() {
  const balanceEl = document.querySelector<HTMLElement>(
    ".activity-tile__recon-bar-balance",
  );
  if (!balanceEl) return;

  const currentBalance = parseAmount(balanceEl.textContent?.trim() ?? "0");
  const balanceCents = Math.round(currentBalance * 100);

  const tables = document.querySelectorAll("table.mds-activity-table");
  const postedTable = tables[1];
  if (!postedTable) return;

  // Remove previous additions if re-running
  for (const el of postedTable.querySelectorAll(
    ".running-balance-header, .running-balance-cell",
  )) {
    el.remove();
  }

  // Add header for the Balance column
  const headerRow = postedTable.querySelector("tr");
  if (!headerRow) return;

  const balanceHeader = document.createElement("th");
  balanceHeader.scope = "col";
  balanceHeader.className =
    "running-balance-header mds-activity-table__column-header mds-activity-table__column-header--right";
  balanceHeader.style.minWidth = "120px";
  balanceHeader.innerHTML = '<span style="padding: 0 16px;">Balance</span>';
  // Insert before the last column (Action)
  headerRow.insertBefore(balanceHeader, headerRow.lastElementChild);

  // Process each transaction row
  const rows =
    postedTable.querySelectorAll<HTMLTableRowElement>("tr[data-values]");
  let runningCents = balanceCents;

  for (const row of rows) {
    const dataValues = row.getAttribute("data-values") ?? "";
    const amountStr = extractAmount(dataValues);
    const amountCents = Math.round(parseAmount(amountStr) * 100);

    const isDashed = !row.classList.contains("mds-activity-table__row--solid");
    const balanceCell = document.createElement("td");
    balanceCell.className = `running-balance-cell mds-activity-table__row-value mds-activity-table__row-value--right${isDashed ? " mds-activity-table__row-value--dashed" : ""}`;
    balanceCell.style.fontVariantNumeric = "tabular-nums";
    balanceCell.style.whiteSpace = "nowrap";

    const balanceText = document.createElement("div");
    balanceText.className = "mds-activity-table__row-value--text";
    balanceText.textContent = formatAmount(runningCents);
    balanceCell.appendChild(balanceText);

    // Insert before the action cell (last td)
    row.insertBefore(balanceCell, row.lastElementChild);

    // Subtract charge (positive amount) from running balance for next row
    // Credits (negative amounts) add back to balance
    runningCents -= amountCents;
  }
}

function waitForElement(selector: string, timeout = 10000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

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
  await waitForElement(".activity-tile__recon-bar-balance");
  // Small delay to ensure the table is fully rendered
  await new Promise((r) => setTimeout(r, 500));
  addRunningBalances();
}

main();
