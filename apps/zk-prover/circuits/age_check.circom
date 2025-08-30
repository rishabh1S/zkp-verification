pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * Checks if a person is of a minimum age.
 * Verifies the constraint: currentYear - birthYear >= minAge
 */
template AgeCheck() {
    // Private input
    signal input birthYear;
    signal input currentYear;
    signal input minAge;

    // Output (becomes public)
    signal output isOverMinAge;

    // 1. Calculate the age
    signal age;
    age <== currentYear - birthYear;

    // 2. Check if age >= minAge
    component comparator = LessEqThan(16);
    comparator.in[0] <== minAge;
    comparator.in[1] <== age;

    // 3. Enforce and expose the result
    comparator.out === 1;
    isOverMinAge <== comparator.out;
}

component main = AgeCheck();
