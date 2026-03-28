const RUNNING_BALANCE_CLASS = "amex-userscript-running-balance";
const LOG_PREFIX = "[amex-running-balances]";

function parseAmount(text: string): number {
  // Handles "$3,859.43", "-$179.16", "($179.16)" (parentheses = negative)
  const clean = text
    .replace(/[$,\s]/g, "")
    .replace(/^\((.+)\)$/, "-$1");
  return parseFloat(clean);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function injectRunningBalances(): boolean {
  const balanceEl = document.querySelector(
    '[data-testid="myca-activity-balances-vitals_totalBalance"] [data-testid="formatted-number"]'
  );
  if (!balanceEl?.textContent) {
    console.debug(`${LOG_PREFIX} Total balance element not found, skipping.`);
    return false;
  }

  const rows = document.querySelectorAll<HTMLElement>(
    '[data-testid="transaction-table-row"]'
  );
  if (rows.length === 0) {
    console.debug(`${LOG_PREFIX} No transaction rows found, skipping.`);
    return false;
  }

  // Remove previously injected elements before recalculating
  let removed = 0;
  for (const el of document.querySelectorAll(`.${RUNNING_BALANCE_CLASS}`)) {
    el.remove();
    removed++;
  }
  if (removed > 0) {
    console.debug(`${LOG_PREFIX} Removed ${removed} previously injected labels.`);
  }

  const totalBalance = parseAmount(balanceEl.textContent);
  if (Number.isNaN(totalBalance)) {
    console.warn(`${LOG_PREFIX} Could not parse total balance: "${balanceEl.textContent}"`);
    return false;
  }

  const pendingEl = document.querySelector(
    '[data-testid="myca-activity-balances-vitals_pendingBalances"] [data-testid="formatted-number"]'
  );
  const pendingBalance = pendingEl?.textContent ? parseAmount(pendingEl.textContent) : 0;
  if (Number.isNaN(pendingBalance)) {
    console.warn(`${LOG_PREFIX} Could not parse pending balance: "${pendingEl?.textContent}", treating as 0.`);
  }

  const adjustedTotal = totalBalance + (Number.isNaN(pendingBalance) ? 0 : pendingBalance);
  console.log(`${LOG_PREFIX} Total balance: ${formatCurrency(totalBalance)}, pending: ${formatCurrency(pendingBalance)}, adjusted: ${formatCurrency(adjustedTotal)}, processing ${rows.length} transaction(s).`);

  let runningBalance = adjustedTotal;
  let injected = 0;

  for (const row of rows) {
    const amountEl = row.querySelector('[data-testid="transaction-amount"]');
    if (!amountEl?.textContent) continue;

    const amount = parseAmount(amountEl.textContent);
    if (Number.isNaN(amount)) {
      console.warn(`${LOG_PREFIX} Could not parse transaction amount: "${amountEl.textContent}", skipping row.`);
      continue;
    }

    runningBalance -= amount;

    const label = document.createElement("em");
    label.className = RUNNING_BALANCE_CLASS;
    label.textContent = formatCurrency(runningBalance);
    label.style.cssText = "display: block; font-size: 0.85em; color: inherit; margin-top: 4px; padding-top: 4px; border-top: 1px solid currentColor; text-align: center;";
    amountEl.parentElement?.insertAdjacentElement("afterend", label);
    injected++;
  }

  console.log(`${LOG_PREFIX} Done. Injected running balances for ${injected} transaction(s).`);
  return true;
}

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (injectRunningBalances()) {
      console.log(`${LOG_PREFIX} Success — disconnecting observer.`);
      observer.disconnect();
    }
  }, 300);
});

console.log(`${LOG_PREFIX} Observer started, waiting for transactions to load.`);
observer.observe(document.body, { childList: true, subtree: true });
