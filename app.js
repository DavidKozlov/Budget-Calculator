// Getting each article
const [...articles] = document.querySelectorAll('article');
// Getting the inputs in each article
const all_da_inputs = articles.map(article =>
    article.querySelectorAll('input')
);
const next = /** @type {HTMLButtonElement} */ (document.querySelector('.next'));
const back = /** @type {HTMLButtonElement} */ (document.querySelector('.back'));
const reset = /** @type {HTMLButtonElement} */ (
    document.querySelector('.back-to-start')
);

let current_section = 0;

// Page nagivation with next, back, back to start
next.addEventListener('click', () => {
    navigate(current_section + 1);
});

back.addEventListener('click', () => {
    navigate(current_section - 1);
});

reset.addEventListener('click', () => {
    navigate(0);
});


// Step Counter JS
const arrayOfSteps = document.querySelectorAll(".stepItem")
for (const stepButton of arrayOfSteps) {
    stepButton.addEventListener("click", () => {
        navigate(stepButton.getAttribute("navTo"))
    })
}

// Setting sections to be visible or not visible based on current_section variable
/**
 * @param {number} section
 */
function navigate(section) {
    if (section === current_section) {
        return;
    }
    articles[current_section].classList.remove('current');
    articles[(current_section = section)].classList.add('current');
    
    // Hide next button if on last page
    if (current_section === articles.length - 1) {
        next.classList.add('hidden');
    } else {
        next.classList.remove('hidden');
    }
    // Hide back button if on last page
    if (current_section === 0) {
        back.classList.add('hidden');
    } else {
        back.classList.remove('hidden');
    }

    // Change inmages of step counter
    for (const stepButton of arrayOfSteps) {
        const buttonImg = stepButton.children[0]

        // Yes, I used a strange method for filling and unfilling images. 
            // I had to export new images for unfilled icons
        // Make sure we're not changing the first one since that's always filled
        if (stepButton.getAttribute("navTo") != 0) {
            if (stepButton.getAttribute("navTo") <= current_section) {
                 // For sections we're on or past, fill image in
                const filledImg = buttonImg.getAttribute("filled")
                buttonImg.setAttribute("src", filledImg)
            } else {
                 // For sections we're not at yet, unfill image
                const unfilledImg = buttonImg.getAttribute("unfilled")
                buttonImg.setAttribute("src", unfilledImg)
            }
        }

        // I have a note in HTML for coding functionality for future icons
    }
}

// Add all the values in each input on the section
/**
 * @param {NodeListOf<HTMLInputElement>} inputs
 */

function sum(inputs) {

    const arr = Array.from(inputs);
    if (arr.length === 0) return 0;

    const article = arr[0].closest('article');
    if (article && article.classList.contains('income')) {
        return 0;
    }

    return arr.reduce((total, input) => {
        const n = Number(input.value);
        return total + (Number.isFinite(n) ? n : 0);
    }, 0);
}

// Donut chart
const canvas = document.querySelector('canvas');
let current_chart = null;

function update() {
    current_chart?.destroy();
    current_chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: document
                .querySelectorAll('article')
                .values()
                .map(article => article.firstElementChild.textContent),
            datasets: [
                {
                    label: 'Monthly (USD)',
                    data: all_da_inputs.map(inputs => sum(inputs))
                }
            ]
        }
    });

    // Update wants/needs/savings summary beneath the chart
    updateWantsNeedsSavings();
}

/**
 * Compute Wants/Needs/Savings totals and render into the
 * .wantsNeedsSavings section. Compares against 50/30/20 targets.
 *
 * Catagories:
 * - Article class names map to categories: needs = housing, health, loans
 * - wants = auto, education, giving, misc
 * - savings = savings
 * - Targets are 50% (needs), 30% (wants), 20% (savings)
 * - Acceptable range is ±10 percentage points (e.g. needs: 40% - 60%)
 */
function updateWantsNeedsSavings() {
    const clamp = v => (Number.isFinite(v) ? v : 0);

    function sumInputs(nodeList) {
        return Array.from(nodeList || []).reduce((t, input) => {
            const n = Number(input.value);
            return t + (Number.isFinite(n) ? n : 0);
        }, 0);
    }

    const incomeArticle = document.querySelector('article.income');
    const incomeTotal = incomeArticle ? sumInputs(incomeArticle.querySelectorAll('input')) : 0;

    const category = (cls) => {
        const art = document.querySelector(`article.${cls}`);
        return art ? sumInputs(art.querySelectorAll('input')) : 0;
    }

    const needs = clamp(category('housing') + category('health') + category('loans'));
    const wants = clamp(category('auto') + category('education') + category('giving') + category('misc'));
    const savings = clamp(category('savings'));

    const totalExpenses = needs + wants + savings;
    const denom = incomeTotal > 0 ? incomeTotal : (totalExpenses > 0 ? totalExpenses : 1);

    const percent = (value) => (value / denom) * 100;

    const needsPct = percent(needs);
    const wantsPct = percent(wants);
    const savingsPct = percent(savings);

    const targets = { needs: 50, wants: 30, savings: 20 };
    const acceptable = 10; // percentage points

    const container = document.querySelector('.wantsNeedsSavings');
    if (!container) return;

    // Prepare three lines (matching HTML order: 50 / 30 / 20)
    const createLine = (label, amount, pct, target) => {
        const out = document.createElement('div');
        out.className = 'wns-line';

        const labelEl = document.createElement('div');
        labelEl.className = 'wns-label';
        labelEl.textContent = label;

        const valueEl = document.createElement('div');
        valueEl.className = 'wns-value';
        valueEl.textContent = `$${amount.toLocaleString(undefined, {maximumFractionDigits:2})} — ${pct.toFixed(1)}%`;

        // mark out-of-range
        if (Math.abs(pct - target) > acceptable) {
            valueEl.classList.add('out-of-range');
        } else {
            valueEl.classList.remove('out-of-range');
        }

        const targetEl = document.createElement('div');
        targetEl.className = 'wns-target';
        targetEl.textContent = `Target: ${target}% (±${acceptable}%)`;

        // layout: label left, value middle, target right (value will be emphasized)
        out.appendChild(labelEl);
        out.appendChild(valueEl);
        out.appendChild(targetEl);
        return out;
    }

    // clear existing content in the child divs and re-populate
    const needsDiv = container.querySelector('.p50');
    const wantsDiv = container.querySelector('.p30');
    const savingsDiv = container.querySelector('.p20');

    if (needsDiv) {
        needsDiv.innerHTML = '';
        needsDiv.appendChild(createLine('Needs', needs, needsPct, targets.needs));
    }
    if (wantsDiv) {
        wantsDiv.innerHTML = '';
        wantsDiv.appendChild(createLine('Wants', wants, wantsPct, targets.wants));
    }
    if (savingsDiv) {
        savingsDiv.innerHTML = '';
        savingsDiv.appendChild(createLine('Savings', savings, savingsPct, targets.savings));
    }
}

// Whenever you input something, update donut chart
document.body.addEventListener('input', () => {
    update();
});

update();
