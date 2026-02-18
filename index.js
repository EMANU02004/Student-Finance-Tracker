let totalAmount = document.getElementById("total-amount");
let userAmount = document.getElementById("user-amount");
const checkAmountButton = document.getElementById("check-amount");
const totalAmountButton = document.getElementById("total-amount-button");
const productTitle = document.getElementById("product-title");
const errorMessage = document.getElementById("budget-error");
const productTitleError = document.getElementById("product-title-error");
const productCostError = document.getElementById("product-cost-error");
const amount = document.getElementById("amount");
const expenditureValue = document.getElementById("expenditure-value");
const balanceValue = document.getElementById("balance-amount");
const list = document.getElementById("list");
const currencySelect = document.getElementById("currency-select");
const productCategory = document.getElementById("product-category");
let tempAmount = 0;
let currency = "$";

// Show custom input when Other is selected
productCategory.addEventListener("change", () => {
    if (productCategory.value === "Other") {
        productTitle.classList.remove("hide");
    } else {
        productTitle.classList.add("hide");
        productTitle.value = "";
    }
});

// Budget Functions

currencySelect.addEventListener("change", () => {
    currency = currencySelect.value;
});

totalAmountButton.addEventListener("click", () => {
    tempAmount = totalAmount.value;
    // Bad input
    if (tempAmount === "" || tempAmount < 0) {
        errorMessage.classList.remove("hide");
    } else {
        errorMessage.classList.add("hide");
        // Set bidget
        amount.innerHTML = currency + tempAmount;
        balanceValue.innerText = currency + (tempAmount - expenditureValue.innerText.replace(/[^0-9.-]/g, ""));
        // Clear input
        totalAmount.value = "";
    }
});

// Disable edit and delete button function

const disableButtons = (bool) => {
    let editButtons = document.getElementsByClassName("edit");
    Array.from(editButtons).forEach((element) => {
        element.disabled = bool;
    });
};

// Modify list elements function

const modifyElement = (element, edit = false) => {
    let parentDiv = element.parentElement;
    let currentBalance = balanceValue.innerText.replace(/[^0-9.-]/g, "");
    let currentExpense = expenditureValue.innerText.replace(/[^0-9.-]/g, "");
    let parentAmount = parentDiv.querySelector(".amount").innerText.replace(/[^0-9.-]/g, "");
    if (edit) {
        let parentText = parentDiv.querySelector(".product").innerText;
        productTitle.value = parentText;
        userAmount.value = parentAmount;
        disableButtons(true);
    }

    balanceValue.innerText = currency + (parseInt(currentBalance) + parseInt(parentAmount));
    expenditureValue.innerText = currency + (parseInt(currentExpense) - parseInt(parentAmount));
    parentDiv.remove();
};

// Create list function

const listCreator = (expenseName, expenseValue) => {
    let subListContent = document.createElement("div");
    subListContent.classList.add("sublist-content", "flex-space");
    list.appendChild(subListContent);
    subListContent.innerHTML = `<p class="product">${expenseName}</p><p class="amount">${currency}${expenseValue}</p>`;
    let editButton = document.createElement("button");
    editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
    editButton.style.fontSize = "1.2em";
    editButton.addEventListener("click", () => {
        modifyElement(editButton, true);
    });
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
    deleteButton.style.fontSize = "1.2em";
    deleteButton.addEventListener("click", () => {
        modifyElement(deleteButton);
    });
    subListContent.appendChild(editButton);
    subListContent.appendChild(deleteButton);
    document.getElementById("list").appendChild(subListContent);
};

// Add expenses function

checkAmountButton.addEventListener("click", () => {
 
    let expenseName = productCategory.value === "Other" ? productTitle.value : productCategory.value;
    
    // Check empty
    if (!userAmount.value || !expenseName) {
        productTitleError.classList.remove("hide");
        return false;
    }
    productTitleError.classList.add("hide");
    // Enable buttons
    disableButtons(false);
    //Expense
    let expenditure = parseInt(userAmount.value);
    // Total expense (existing + new)
    let sum = parseInt(expenditureValue.innerText.replace(/[^0-9.-]/g, "")) + expenditure;
    expenditureValue.innerText = currency + sum;
    // Total balance = budget - total expense
    const totalBalance = tempAmount - sum;
    balanceValue.innerText = currency + totalBalance;
    //Create list
    listCreator(expenseName, userAmount.value);
    //Clear inputs
    productCategory.value = "";
    productTitle.value = "";
    productTitle.classList.add("hide");
    userAmount.value = "";
});
