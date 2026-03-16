// Getting each article
const [...articles] = document.querySelectorAll("article");
// Getting the inputs in each article
const all_da_inputs = articles.map((article) =>
  article.querySelectorAll("input"),
);
const next = /** @type {HTMLButtonElement} */ (document.querySelector(".next"));
const back = /** @type {HTMLButtonElement} */ (document.querySelector(".back"));
const reset = /** @type {HTMLButtonElement} */ (
  document.querySelector(".back-to-start")
);

let current_section = 0;

// Page nagivation with next, back, back to start
next.addEventListener("click", () => {
  navigate(current_section + 1);
});

back.addEventListener("click", () => {
  navigate(current_section - 1);
});

reset.addEventListener("click", () => {
  navigate(0);
});

// Step Counter JS
const arrayOfSteps = document.querySelectorAll(".stepItem");
for (const stepButton of arrayOfSteps) {
  stepButton.addEventListener("click", () => {
    // navTo attribute is a string; convert to number so current_section stays numeric
    navigate(Number(stepButton.getAttribute("navTo")));
  });
}

// Setting sections to be visible or not visible based on current_section variable
/**
 * @param {number} section
 */
function navigate(section) {
  // coerce to number and clamp into valid range
  section = Number(section);
  if (!Number.isFinite(section)) return;
  section = Math.max(0, Math.min(section, articles.length - 1));

  if (section === current_section) {
    return;
  }

  articles[current_section].classList.remove("current");
  articles[(current_section = section)].classList.add("current");

  // Hide next button if on last page
  if (current_section === articles.length - 1) {
    next.classList.add("hidden");
  } else {
    next.classList.remove("hidden");
  }
  // Hide back button if on last page
  if (current_section === 0) {
    back.classList.add("hidden");
  } else {
    back.classList.remove("hidden");
  }

  // Change images of step counter
  for (const stepButton of arrayOfSteps) {
    const buttonImg = stepButton.children[0];
    // coerce navTo to number for reliable comparison
    const navToAttr = Number(stepButton.getAttribute("navTo"));

    // Make sure not to change the first one since that's always filled
    if (!Number.isFinite(navToAttr) || navToAttr === 0) continue;
    if (navToAttr <= current_section) {
      // For sections we're on or past, fill image in
      const filledImg = buttonImg.getAttribute("filled");
      if (filledImg) buttonImg.setAttribute("src", filledImg);
    } else {
      // For sections we're not at yet, unfill image
      const unfilledImg = buttonImg.getAttribute("unfilled");
      if (unfilledImg) buttonImg.setAttribute("src", unfilledImg);
    }
    // Note in HTML for coding functionality for future icons
  }
}

// Add all the values in each input on the section
/**
 * @param {NodeListOf<HTMLInputElement>} inputs
 */

function sum(inputs) {
  const arr = Array.from(inputs);
  if (arr.length === 0) return 0;

  const article = arr[0].closest("article");
  if (article && article.classList.contains("income")) {
    return 0;
  }

  return arr.reduce((total, input) => {
    const n = Number(input.value);
    return total + (Number.isFinite(n) ? n : 0);
  }, 0);
}

// Donut chart
const canvas = document.querySelector("canvas");
let current_chart = null;

function update() {
  current_chart?.destroy();
  // compute dataset once, use placeholder if all values are zero
  const labels = Array.from(document.querySelectorAll("article"))
    .map((a) =>
      (a.querySelector("h2") || a.firstElementChild).textContent.trim(),
    )
    .filter((item) => item !== "Income");
  function randomizer() {
    const arrRandom = Array(3)
      .fill()
      .map(() => Math.floor(Math.random() * 1000));
    const sum = arrRandom.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
    return sum;
  }
  const dataset = all_da_inputs.map((inputs) => sum(inputs)).slice(1);
  const hasAnyValue = dataset.some((v) => Number.isFinite(v) && v > 0);
  const dataToUse = hasAnyValue
    ? dataset
    : [...Array(8).fill().map(randomizer)];

  current_chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Monthly (USD)",
          data: dataToUse,
          backgroundColor: [
            "#457b9d",
            "#e63946",
            "#1bedca",
            "#f3722c",
            "#2a9d8f",
            "#e8727b",
            "#9d2a6f",
            "#f1faee",
          ],
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: hasAnyValue ? "Monthly Budget" : "Randomized Chart",
          color: "#000000",
          font: {
            family: ["Sora", "sans-serif"],
            size: 35,
            weight: "bolder",
            lineHeight: 1.2,
          },
        },
      },
    },
  });

  updateWantsNeedsSavings();
}

// Resize Functionality
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    myResizeEndFunction();
  }, 250);
});
function myResizeEndFunction() {
  update();
}

/*
 Compute Wants/Needs/Savings totals and render into the
 .wantsNeedsSavings section. Compares against 50/30/20 targets.

 Catagories:
 - Article class names map to categories: needs = housing, health, loans
 - wants = auto, education, giving, misc
 - savings = savings
 - Targets are 50% (needs), 30% (wants), 20% (savings)
 - Acceptable range is ±10 percentage points
*/
function updateWantsNeedsSavings() {
  const clamp = (v) => (Number.isFinite(v) ? v : 0);

  function sumInputs(nodeList) {
    return Array.from(nodeList || []).reduce((t, input) => {
      const n = Number(input.value);
      return t + (Number.isFinite(n) ? n : 0);
    }, 0);
  }

  const incomeArticle = document.querySelector("article.income");
  const incomeTotal = incomeArticle
    ? sumInputs(incomeArticle.querySelectorAll("input"))
    : 0;

  const category = (cls) => {
    const art = document.querySelector(`article.${cls}`);
    return art ? sumInputs(art.querySelectorAll("input")) : 0;
  };

  const needs = clamp(
    category("housing") + category("health") + category("loans"),
  );
  const wants = clamp(
    category("auto") +
      category("education") +
      category("giving") +
      category("misc"),
  );
  const savings = clamp(category("savings"));

  const totalExpenses = needs + wants + savings;
  const denom =
    incomeTotal > 0 ? incomeTotal : totalExpenses > 0 ? totalExpenses : 1;

  const percent = (value) => (value / denom) * 100;

  const needsPct = percent(needs);
  const wantsPct = percent(wants);
  const savingsPct = percent(savings);

  const targets = { needs: 50, wants: 30, savings: 20 };
  const acceptable = 10; // percentage points

  const container = document.querySelector(".wantsNeedsSavings");
  if (!container) return;

  // Prepare three lines (matching HTML order: 50 / 30 / 20)
  const createLine = (label, amount, pct, target) => {
    const out = document.createElement("div");
    out.className = "wns-line";

    const labelEl = document.createElement("div");
    labelEl.className = "wns-label";
    labelEl.textContent = label;

    const valueEl = document.createElement("div");
    valueEl.className = "wns-value";
    valueEl.textContent = `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} — ${pct.toFixed(1)}%`;

    // mark out-of-range
    if (Math.abs(pct - target) > acceptable) {
      valueEl.classList.add("out-of-range");
    } else {
      valueEl.classList.remove("out-of-range");
    }

    const targetEl = document.createElement("div");
    targetEl.className = "wns-target";
    targetEl.textContent = `Target: ${target}% (±${acceptable}%)`;

    // layout: label left, value middle, target right (value will be emphasized)
    out.appendChild(labelEl);
    out.appendChild(valueEl);
    out.appendChild(targetEl);
    return out;
  };

  // clear existing content in the child divs and re-populate
  const needsDiv = container.querySelector(".p50");
  const wantsDiv = container.querySelector(".p30");
  const savingsDiv = container.querySelector(".p20");

  if (needsDiv) {
    needsDiv.innerHTML = "";
    needsDiv.appendChild(createLine("Needs", needs, needsPct, targets.needs));
  }
  if (wantsDiv) {
    wantsDiv.innerHTML = "";
    wantsDiv.appendChild(createLine("Wants", wants, wantsPct, targets.wants));
  }
  if (savingsDiv) {
    savingsDiv.innerHTML = "";
    savingsDiv.appendChild(
      createLine("Savings", savings, savingsPct, targets.savings),
    );
  }
}

// Whenever you input something, update donut chart
document.body.addEventListener("input", () => {
  update();
});

// Local Storage

function saveTasks() {
  const inputs = articles.map(article =>
    Array.from(article.querySelectorAll("input")).map(input => input.value)
  );

  localStorage.setItem("storageInputs", JSON.stringify(inputs));
}
function loadTasks() {
  const load = localStorage.getItem("storageInputs");
  if (!load) return;
  try {
    const values = JSON.parse(load);

    articles.forEach((article, i) => {
      const inputs = article.querySelectorAll("input");

      inputs.forEach((input, j) => {
        if (values[i] && values[i][j] !== undefined) {
          input.value = values[i][j];
        }
      });
    });
  } catch (error) {
    console.error("Failed to parse saved tasks", error);
  }
}

loadTasks();
update();

document.body.addEventListener("input", saveTasks);