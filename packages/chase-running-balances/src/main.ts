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

// The smallest subtree that contains both nodes. We observe this so any
// re-render of the activity tile (period switch, pagination) is caught.
function lowestCommonAncestor(a: Node, b: Node): Element | null {
  const ancestors = new Set<Node>();
  for (let n: Node | null = a; n; n = n.parentNode) ancestors.add(n);
  for (let n: Node | null = b; n; n = n.parentNode) {
    if (ancestors.has(n) && n instanceof Element) return n;
  }
  return null;
}

// Build (or rebuild) the balance column from the current DOM. Idempotent: it
// strips its own prior output first, so it's safe to call on every change.
// Returns the container to watch for the next change, or null if the activity
// view isn't present.
function renderBalances(): Element | null {
  const balanceEl = document.querySelector<HTMLElement>(
    ".activity-tile__recon-bar-balance",
  );
  if (!balanceEl) {
    // Normal for full-range views ("All transactions", "Year to date", etc.):
    // Chase shows no statement balance there, so there's nothing to anchor a
    // running total on. Skip quietly.
    log("No balance to anchor on (not a statement view), skipping");
    return null;
  }

  const currentBalance = parseAmount(balanceEl.textContent?.trim() ?? "0");
  const balanceCents = Math.round(currentBalance * 100);
  log("Current balance:", formatAmount(balanceCents));

  const tables = document.querySelectorAll("table.mds-activity-table");
  if (!tables[1]) {
    warn(`Expected 2 activity tables, found ${tables.length}`);
    return null;
  }
  const postedTable = tables[1];

  // Strip our prior output so a rebuild starts clean.
  for (const el of postedTable.querySelectorAll(
    ".running-balance-header, .running-balance-cell",
  )) {
    el.remove();
  }

  // Add header for the Balance column
  const headerRow = postedTable.querySelector("tr");
  if (!headerRow) {
    warn("No header row found in posted table");
    return null;
  }
  const balanceHeader = document.createElement("th");
  balanceHeader.scope = "col";
  balanceHeader.className =
    "running-balance-header mds-activity-table__column-header mds-activity-table__column-header--right";
  balanceHeader.style.minWidth = "120px";
  balanceHeader.innerHTML = '<span style="padding: 0 16px;">Balance</span>';
  headerRow.insertBefore(balanceHeader, headerRow.lastElementChild);

  // Process each transaction row
  const rows =
    postedTable.querySelectorAll<HTMLTableRowElement>("tr[data-values]");
  let runningCents = balanceCents;
  for (const row of rows) {
    addBalanceToRow(row, runningCents);
    runningCents -= getRowAmountCents(row);
  }
  log("Processed", rows.length, "rows");

  return lowestCommonAncestor(balanceEl, postedTable) ?? document.body;
}

let contentObserver: MutationObserver | null = null;
let observedContainer: Element | null = null;
let rebuildTimer: ReturnType<typeof setTimeout> | null = null;

// Re-render, pausing observation so our own DOM writes don't trigger us.
function rebuild() {
  contentObserver?.disconnect();
  const container = renderBalances();
  // A period switch tears out the posted table and loads the replacement a
  // beat later, so renderBalances() can return null mid-transition (and full
  // range views like "Year to date" have no balance to anchor on at all). Keep
  // the last known-good container in those cases: it's the activity tile, which
  // survives the swap, so staying attached to it means we still catch the new
  // table when it arrives. Dropping it would leave the observer dead until the
  // next URL change.
  if (container) observedContainer = container;
  // Re-arm on the current container. Switching periods swaps the table's rows
  // but not the tile, so the container stays put; account switches change the
  // URL and re-run main(), which re-resolves it.
  if (contentObserver && observedContainer?.isConnected) {
    contentObserver.observe(observedContainer, {
      childList: true,
      subtree: true,
    });
  }
}

// Chase re-renders the activity table in place when you pick a different
// period or page in more rows, with no URL change. Watch the tile's DOM and
// rebuild when its rows change. Debounced so a burst of mutations coalesces
// into one rebuild.
function scheduleRebuild() {
  if (rebuildTimer !== null) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    rebuildTimer = null;
    rebuild();
  }, 200);
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

let runId = 0;

async function main() {
  const id = ++runId;
  log("Script started");
  try {
    await waitForElement(".activity-tile__recon-bar-balance");
    // Small delay to ensure the table is fully rendered
    await new Promise((r) => setTimeout(r, 500));
    // A newer navigation may have superseded this run while we were waiting.
    // Bail so a stale run can't clobber the current view's balances.
    if (id !== runId) {
      log("Superseded before render, skipping");
      return;
    }
    // One observer for the page's lifetime; rebuild() re-points it each run.
    if (!contentObserver) {
      contentObserver = new MutationObserver(scheduleRebuild);
    }
    rebuild();
    log("Done");
  } catch (e) {
    warn("Failed to initialize:", e);
  }
}

// Chase's dashboard is a SPA: navigating between accounts swaps the DOM via the
// History API without a full page load, so TamperMonkey never re-fires the
// script. Detect in-page navigation ourselves and re-run.
function watchForNavigation(onNavigate: () => void) {
  let lastUrl = location.href;
  const check = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    log("Navigation detected:", lastUrl);
    onNavigate();
  };

  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function (this: History, ...args) {
      const result = original.apply(this, args);
      check();
      return result;
    };
  }
  window.addEventListener("popstate", check);
}

main();
watchForNavigation(main);
