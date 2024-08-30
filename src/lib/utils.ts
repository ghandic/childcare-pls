import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge.
 * @param {...ClassValue[]} inputs - The class names to merge.
 * @returns {string} - The merged class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const stringToFloat = (s: string) => {
  const cleaned = s.replace(/[^0-9.]/g, "");
  if (cleaned === "") {
    return 0;
  } else {
    return parseFloat(cleaned);
  }
};

export const asAU = (n: number) => {
  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
  });
};

/**
 * Calculates the tax based on the given income.
 * @param {number} income - The income to calculate tax for.
 * @returns {number} - The calculated tax.
 */
function calculateTax(income: number): number {
  let tax;

  if (income <= 18200) {
    tax = 0;
  } else if (income <= 45000) {
    tax = (income - 18200) * 0.19;
  } else if (income <= 120000) {
    tax = 5092 + (income - 45000) * 0.325;
  } else if (income <= 180000) {
    tax = 29467 + (income - 120000) * 0.37;
  } else {
    tax = 51667 + (income - 180000) * 0.45;
  }

  return tax;
}

/**
 * Calculates the Medicare levy based on the given income.
 * @param {number} income - The income to calculate the Medicare levy for.
 * @returns {number} - The calculated Medicare levy.
 */
function calculateMedicareLevy(income: number): number {
  return income * 0.02;
}

/**
 * Calculates the take-home pay after tax and Medicare levy deductions.
 * @param {number} preTaxIncome - The pre-tax income.
 * @returns {number} - The take-home pay.
 */
export function calculateTakeHomePay(preTaxIncome: number): number {
  const incomeTax = calculateTax(preTaxIncome);
  const medicareLevy = calculateMedicareLevy(preTaxIncome);

  const totalDeductions = incomeTax + medicareLevy;
  const takeHomePay = preTaxIncome - totalDeductions;

  return takeHomePay;
}

/**
 * Calculates the Child Care Subsidy (CCS) percentage based on family income.
 * @param {number} familyIncome - The family income.
 * @returns {number} - The CCS percentage.
 */
function calculateCCSPercentage(familyIncome: number): number {
  if (familyIncome <= 80000) {
    return 0.9;
  } else if (familyIncome <= 530000) {
    return 0.9 - ((familyIncome - 80000) / 5000) * 0.01;
  } else {
    return 0;
  }
}

/**
 * Gets the maximum subsidized hours per week based on activity hours per fortnight.
 * @param {number} activityHoursPerFortnight - The activity hours per fortnight.
 * @returns {number} - The maximum subsidized hours per week.
 */
function getMaxSubsidizedHoursPerWeek(
  activityHoursPerFortnight: number
): number {
  if (activityHoursPerFortnight <= 16) {
    return 18;
  } else if (activityHoursPerFortnight <= 48) {
    return 36;
  } else {
    return 50;
  }
}

export type ChildCareType =
  | "centre-based"
  | "family-day-care"
  | "outside-school-hours"
  | "in-home-care"
  | "nannying";

/**
 * Gets the hourly rate cap based on the child care type for 2023-2024.
 * @param {ChildCareType} childcareType - The type of child care.
 * @returns {number} - The hourly rate cap.
 * @throws {Error} - If the child care type is invalid.
 */
function getHourlyRateCap(childcareType: ChildCareType | undefined): number {
  switch (childcareType) {
    case "centre-based":
      return 13.73;
    case "family-day-care":
      return 12.72;
    case "outside-school-hours":
      return 13.73;
    case "in-home-care":
      return 37.78; // This is per family, not per child
    default:
      return 0;
  }
}

/**
 * Calculates the family income and required hours per week of child care.
 * @param {number} income1 - The income of the first person.
 * @param {number} income2 - The income of the second person.
 * @param {number} workHoursPerDay1 - The number of working hours per day for the first person.
 * @param {number} workHoursPerDay1 - The number of working hours per day for the second person.
 * @param {number} workDaysPerWeek1 - The number of working days per week for the first person.
 * @param {number} workDaysPerWeek2 - The number of working days per week for the second person.
 * @param {number} daysOffPerWeek1 - The number of days off per week for the first person.
 * @param {number} daysOffPerWeek2 - The number of days off per week for the second person.
 * @returns {{ familyIncome: number, requiredChildCareHoursPerWeek: number, activityHoursPerFortnight: number }} - The family income and required child care hours.
 */
export function calculateFamilyIncomeAndChildCare(
  income1: number,
  income2: number,
  workHoursPerDay1: number,
  workHoursPerDay2: number,
  workDaysPerWeek1: number,
  workDaysPerWeek2: number,
  daysOffPerWeek1: number,
  daysOffPerWeek2: number
): {
  familyIncome: number;
  requiredChildCareHoursPerWeek: number;
  activityHoursPerFortnight: number;
} {
  const newIncome1 =
    (income1 * Math.max(0, workDaysPerWeek1 - daysOffPerWeek1)) /
    workDaysPerWeek1;
  const newIncome2 =
    (income2 * Math.max(0, workDaysPerWeek2 - daysOffPerWeek2)) /
    workDaysPerWeek2;
  console.log(
    "Math.max(0, workDaysPerWeek1 - daysOffPerWeek1), workDaysPerWeek1",
    Math.max(0, workDaysPerWeek1 - daysOffPerWeek1),
    workDaysPerWeek1
  );

  console.log("newIncome1, newIncome2", newIncome1, newIncome2);

  // Calculate the total working hours per week for both individuals
  const totalReplacementHoursPerWeek1 =
    workHoursPerDay1 * (workDaysPerWeek1 - daysOffPerWeek1);
  const totalReplacementHoursPerWeek2 =
    workHoursPerDay2 * (workDaysPerWeek2 - daysOffPerWeek2);
  console.log(
    "workHoursPerDay1 * (workDaysPerWeek1 - daysOffPerWeek1);",
    workHoursPerDay1,
    workDaysPerWeek1,
    daysOffPerWeek1
  );

  const activityHoursPerWeek1 = workHoursPerDay1 * workDaysPerWeek1;
  const activityHoursPerWeek2 = workHoursPerDay2 * workDaysPerWeek2;

  return {
    familyIncome: newIncome1 + newIncome2,
    requiredChildCareHoursPerWeek: Math.min(
      totalReplacementHoursPerWeek1,
      totalReplacementHoursPerWeek2
    ),
    activityHoursPerFortnight:
      2 * (activityHoursPerWeek1 + activityHoursPerWeek2),
  };
}

/**
 * Calculates the Child Care Subsidy (CCS) for a given set of parameters.
 *
 * @param income1 - The income of the first parent.
 * @param income2 - The income of the second parent.
 * @param workHoursPerDay1 - The number of work hours per day for the first parent.
 * @param workHoursPerDay2 - The number of work hours per day for the second parent.
 * @param workDaysPerWeek1 - The number of work days per week for the first parent.
 * @param workDaysPerWeek2 - The number of work days per week for the second parent.
 * @param daysOffPerWeek1 - The number of days off per week for the first parent.
 * @param daysOffPerWeek2 - The number of days off per week for the second parent.
 * @param hourlyChildcareRate - The hourly rate for childcare.
 * @param childcareType - The type of childcare.
 * @param weeksWithoutChildcare - The number of weeks per year without childcare (e.g., holidays).
 * @returns {{ weeklySubsidy: number, weeklyFamilyCost: number }} - The weekly subsidy amount for Child Care Subsidy (CCS) and the cost to the family for the number of childcare hours after CCS.
 */
export function calculateCCS(
  income1: number, // Fixed
  income2: number, // Fixed
  workHoursPerDay1: number, // Fixed
  workHoursPerDay2: number, // Fixed
  workDaysPerWeek1: number, // Fixed
  workDaysPerWeek2: number, // Fixed
  daysOffPerWeek1: number, // Variable
  daysOffPerWeek2: number, // Variable
  hourlyChildcareRate: number, // Variable
  childcareType: ChildCareType | undefined, // Variable
  weeksWithoutChildcare: number // New parameter for weeks without childcare
): { weeklySubsidy: number; familyCost: number } {
  const {
    familyIncome,
    activityHoursPerFortnight,
    requiredChildCareHoursPerWeek,
  } = calculateFamilyIncomeAndChildCare(
    income1,
    income2,
    workHoursPerDay1,
    workHoursPerDay2,
    workDaysPerWeek1,
    workDaysPerWeek2,
    daysOffPerWeek1,
    daysOffPerWeek2
  );

  console.log(
    "familyIncome,activityHoursPerFortnight,requiredChildCareHoursPerWeek",
    familyIncome,
    activityHoursPerFortnight,
    requiredChildCareHoursPerWeek
  );

  const hourlyRateCap = getHourlyRateCap(childcareType);
  const ccsPercentage = calculateCCSPercentage(familyIncome);
  const maxSubsidizedHours = getMaxSubsidizedHoursPerWeek(
    activityHoursPerFortnight
  );

  // Ensure that the subsidy is calculated only for the eligible hours
  const eligibleHours = Math.min(
    requiredChildCareHoursPerWeek,
    maxSubsidizedHours
  );

  const subsidizedRate =
    Math.min(hourlyChildcareRate, hourlyRateCap) * ccsPercentage;
  const weeklySubsidy = subsidizedRate * eligibleHours;

  // Adjust the weekly family cost to account for weeks without childcare
  const adjustedFamilyCost =
    (hourlyChildcareRate * requiredChildCareHoursPerWeek - weeklySubsidy) *
    (52 - weeksWithoutChildcare);

  console.log(`(hourlyChildcareRate(${hourlyChildcareRate}) * requiredChildCareHoursPerWeek(${requiredChildCareHoursPerWeek}) - weeklySubsidy(${weeklySubsidy})) *
    (52 - weeksWithoutChildcare(${weeksWithoutChildcare})) = ${adjustedFamilyCost}`);

  return { weeklySubsidy, familyCost: adjustedFamilyCost };
}

const nannyDiscountAdditionalChild = 0.25;
/**
 * Calculates the nanny rate based on the base rate, number of children, and discount percentage.
 *
 * @param baseRate - The base rate for the nanny.
 * @param numberOfChildren - The number of children the nanny will be taking care of.
 * @param discountPercentage - The discount percentage to be applied to the base rate for each additional child. Default is 0.25.
 * @returns The total nanny rate.
 */
function calculateNannyRate(
  baseRate: number,
  numberOfChildren: number,
  discountPercentage: number = nannyDiscountAdditionalChild
) {
  let totalRate = baseRate;

  for (let i = 2; i <= numberOfChildren; i++) {
    totalRate += baseRate * (1 - discountPercentage);
  }

  return totalRate;
}

const assumedNannyHoursPerDay = 8;

/**
 * Calculates the take-home pay for nannying based on the given parameters.
 * @param {number} nannyingRate - The hourly rate for nannying.
 * @param {number} income - The income of the person.
 * @param {number} daysNannyingPerWeek - The number of days the person will work as a nanny.
 * @returns {number} - The take-home pay for nannying.
 */
function calculateNannyingIncome(
  nannyingRate: number,
  numberOfChildren: number,
  daysNannyingPerWeek: number
): number {
  const discountedNannyRate = calculateNannyRate(
    nannyingRate,
    numberOfChildren
  );

  const nannyingIncome =
    discountedNannyRate * daysNannyingPerWeek * assumedNannyHoursPerDay;
  return nannyingIncome;
}

/**
 * Calculates the amount of parental leave entitlement based on the number of days worked, weeks of paid parental leave, and pre-tax income.
 * @param {number} daysWorkingPerWeek - The number of days worked per week.
 * @param {number} weeksPaidLeave - The number of weeks of paid parental leave entitlement.
 * @param {number} preTaxIncome - The pre-tax income.
 * @returns {number} - The amount of parental leave entitlement.
 */
function calculateParentalLeaveEntitlement(
  daysWorkingPerWeek: number,
  weeksPaidLeave: number,
  preTaxIncome: number
): number {
  const weeklyRate = preTaxIncome / 52;
  const parentalLeaveEntitlement =
    (daysWorkingPerWeek / 5) * weeksPaidLeave * weeklyRate;
  return parentalLeaveEntitlement;
}

export type CalculateParentalLeaveEntitlement = {
  income1: number;
  income2: number;
  workHoursPerDay1: number;
  workHoursPerDay2: number;
  workDaysPerWeek1: number;
  workDaysPerWeek2: number;
  daysOffPerWeek1: number;
  daysOffPerWeek2: number;
  hourlyChildcareRate: number;
  childcareType: ChildCareType | undefined;
  nannyingRate: number;
  numberOfChildrenToNanny: number;
  daysNannyingPerWeek1: number;
  daysNannyingPerWeek2: number;
  weeksWithoutChildcare: number;
  numberOfChildrenInChildcare: number;
  weeksPaidParentalLeave1: number;
  weeksPaidParentalLeave2: number;
  expectingAnotherBaby: boolean;
};

/**
 * Calculates the total take-home pay with childcare.
 *
 * @param income1 - The income of the first parent.
 * @param income2 - The income of the second parent.
 * @param workHoursPerDay1 - The work hours per day of the first parent.
 * @param workHoursPerDay2 - The work hours per day of the second parent.
 * @param workDaysPerWeek1 - The work days per week of the first parent.
 * @param workDaysPerWeek2 - The work days per week of the second parent.
 * @param daysOffPerWeek1 - The days off per week of the first parent.
 * @param daysOffPerWeek2 - The days off per week of the second parent.
 * @param hourlyChildcareRate - The hourly childcare rate.
 * @param childcareType - The type of childcare.
 * @param nannyingRate - The nannying rate.
 * @param numberOfChildrenToNanny - The number of children to nanny.
 * @param daysNannyingPerWeek1 - The days nannying per week of the first parent.
 * @param daysNannyingPerWeek2 - The days nannying per week of the second parent.
 * @param weeksWithoutChildcare - The number of weeks without childcare.
 * @param numberOfChildrenInChildcare - The number of children in childcare.
 * @param weeksPaidParentalLeave1 - The number of weeks of paid parental leave for the first parent.
 * @param weeksPaidParentalLeave2 - The number of weeks of paid parental leave for the second parent.
 * @param expectingAnotherBaby - Indicates if the family is expecting another baby.
 * @returns The total take-home pay with childcare.
 */
export function calculateTotalTakeHomePayWithChildcare({
  income1,
  income2,
  workHoursPerDay1,
  workHoursPerDay2,
  workDaysPerWeek1,
  workDaysPerWeek2,
  daysOffPerWeek1,
  daysOffPerWeek2,
  hourlyChildcareRate,
  childcareType,
  nannyingRate,
  numberOfChildrenToNanny,
  daysNannyingPerWeek1,
  daysNannyingPerWeek2,
  weeksWithoutChildcare,
  numberOfChildrenInChildcare,
  weeksPaidParentalLeave1,
  weeksPaidParentalLeave2,
  expectingAnotherBaby,
}: CalculateParentalLeaveEntitlement): {
  withChildren: number;
  childCareCost: number;
  parentalLeavePayment: number;
  explanation: string;
} {
  const incomeAdjusted1 =
    income1 * ((workDaysPerWeek1 - daysOffPerWeek1) / workDaysPerWeek1);
  const incomeAdjusted2 =
    income2 * ((workDaysPerWeek2 - daysOffPerWeek2) / workDaysPerWeek2);
  console.log("incomeAdjusted1", incomeAdjusted1);
  console.log("incomeAdjusted2", incomeAdjusted1);

  const nannyingIncome1 =
    calculateNannyingIncome(
      nannyingRate,
      numberOfChildrenToNanny,
      daysNannyingPerWeek1
    ) * 52;
  console.log("nannyingIncome1", nannyingIncome1);

  const nannyingIncome2 =
    calculateNannyingIncome(
      nannyingRate,
      numberOfChildrenToNanny,
      daysNannyingPerWeek2
    ) * 52;
  console.log("nannyingIncome2", nannyingIncome2);

  const totalIncome1 = incomeAdjusted1 + nannyingIncome1;
  const totalIncome2 = incomeAdjusted2 + nannyingIncome2;

  const { familyCost } = calculateCCS(
    totalIncome1,
    totalIncome2,
    workHoursPerDay1,
    workHoursPerDay2,
    workDaysPerWeek1,
    workDaysPerWeek2,
    daysOffPerWeek1,
    daysOffPerWeek2,
    hourlyChildcareRate,
    childcareType,
    weeksWithoutChildcare
  );
  console.log("familyCost", familyCost);
  const parentalLeaveEntitlement1 = calculateParentalLeaveEntitlement(
    workDaysPerWeek1,
    weeksPaidParentalLeave1,
    income1
  );
  const parentalLeaveEntitlement2 = calculateParentalLeaveEntitlement(
    workDaysPerWeek2,
    weeksPaidParentalLeave2,
    income2
  );

  const totalTakeHomePay =
    calculateTakeHomePay(totalIncome1) + calculateTakeHomePay(totalIncome2);
  console.log("totalTakeHomePay", totalTakeHomePay);
  const totalTakeHomePayPlusParentalLeave =
    calculateTakeHomePay(
      (expectingAnotherBaby ? parentalLeaveEntitlement1 : 0) + totalIncome1
    ) +
    calculateTakeHomePay(
      (expectingAnotherBaby ? parentalLeaveEntitlement2 : 0) + totalIncome2
    );

  const discountedNannyRate = calculateNannyRate(
    nannyingRate,
    numberOfChildrenToNanny
  );
  let explanation = [];
  if (daysOffPerWeek1 > 0) {
    explanation.push(
      `<strong>Adjusted Income for Person 1:</strong> income(${asAU(income1)}) * ((workDaysPerWeek(${workDaysPerWeek1}) - daysOffPerWeek(${daysOffPerWeek1})) / workDaysPerWeek(${workDaysPerWeek1})) = ${asAU(incomeAdjusted1)};`
    );
  }
  if (daysOffPerWeek2 > 0) {
    explanation.push(
      `<strong>Adjusted Income for Person 2:</strong> income(${asAU(income2)}) * ((workDaysPerWeek(${workDaysPerWeek2}) - daysOffPerWeek(${daysOffPerWeek2})) / workDaysPerWeek(${workDaysPerWeek2})) = ${asAU(incomeAdjusted2)};`
    );
  }
  if (daysNannyingPerWeek1 + daysNannyingPerWeek2 > 0) {
    explanation.push(
      `<strong>Effective Nannying Rate:</strong> nannyingBaseRate(${asAU(nannyingRate)}) + (discount of ${nannyDiscountAdditionalChild * 100}% for each additional child)[${numberOfChildrenToNanny - 1}] = ${asAU(discountedNannyRate)}`
    );
  }
  if (daysNannyingPerWeek1 > 0) {
    explanation.push(
      `<strong>Nannying Income for Person 1:</strong> discountedNannyRate(${asAU(discountedNannyRate)}) * daysNannyingPerWeek(${daysNannyingPerWeek1}) * nannyHoursPerDay(${assumedNannyHoursPerDay}) * 52 weeks = ${asAU(nannyingIncome1)}`
    );
  }
  if (daysNannyingPerWeek2 > 0) {
    explanation.push(
      `<strong>Nannying Income for Person 2:</strong> discountedNannyRate(${asAU(discountedNannyRate)}) * daysNannyingPerWeek(${daysNannyingPerWeek2}) *  * nannyHoursPerDay(${assumedNannyHoursPerDay}) * 52 weeks = ${asAU(nannyingIncome2)}`
    );
  }
  explanation = explanation.concat([
    `<strong>Total Income for Person 1:</strong> ${asAU(totalIncome1)}${daysNannyingPerWeek1 > 0 || daysOffPerWeek1 > 0 ? `(${daysOffPerWeek1 > 0 ? "Adjusted Income" : ""}${daysNannyingPerWeek1 > 0 ? " + Nannying Income" : ""})` : ""}`,
    `<strong>Total Income for Person 2:</strong> ${asAU(totalIncome2)}${daysNannyingPerWeek2 > 0 || daysOffPerWeek2 > 0 ? `(${daysOffPerWeek2 > 0 ? "Adjusted Income" : ""}${daysNannyingPerWeek2 > 0 ? " + Nannying Income" : ""})` : ""}`,
    `<strong>Family Income:</strong> totalIncomePerson1(${asAU(totalIncome1)}) + totalIncomePerson2(${asAU(totalIncome2)}) = ${asAU(totalIncome1 + totalIncome2)}`,
    `<strong>Family Cost of childcare after CCS (adjusted based on family income, child care type and hours):</strong> ${asAU(familyCost)}`,
    `<strong>Total Take Home for Person 1 (Income After Tax):</strong> ${asAU(calculateTakeHomePay(totalIncome1))}`,
    `<strong>Total Take Home for Person 2 (Income After Tax):</strong> ${asAU(calculateTakeHomePay(totalIncome2))}`,
    `<strong>Family Take Home:</strong> takeHomePerson1(${asAU(calculateTakeHomePay(totalIncome1))}) + takeHomePerson2(${asAU(calculateTakeHomePay(totalIncome2))}) = ${asAU(totalTakeHomePay)}`,
    `<strong>Family Take Home After Childcare:</strong> totalTakeHomePay(${asAU(totalTakeHomePay)}) - familyCostAfterCCS(${asAU(familyCost)}) * numberOfChildrenInChildcare(${numberOfChildrenInChildcare}) = ${asAU(totalTakeHomePay - familyCost * numberOfChildrenInChildcare)}`,
  ]);

  return {
    withChildren: totalTakeHomePay - familyCost * numberOfChildrenInChildcare,
    parentalLeavePayment: totalTakeHomePayPlusParentalLeave - totalTakeHomePay,
    childCareCost: familyCost * numberOfChildrenInChildcare,
    explanation: explanation.map((e, index) => `${index + 1}. ${e}`).join("\n"),
  };
}
