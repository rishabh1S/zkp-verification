pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * Checks if a person is of a minimum age.
 * Verifies the constraint: currentYear - birthYear >= minAge
 */
template AgeCheck() {
    // ## Inputs
    // Private inputs (the witness)
    signal input birthYear;
    signal input currentYear;

    // Public input (known by both prover and verifier)
    signal input minAge;

    // ## Logic
    // 1. Calculate the age
    signal age;
    age <== currentYear - birthYear;

    // 2. Check if age is greater than or equal to minAge.
    // We use the LessEq comparator from circomlib to check: minAge <= age
    // The bit-width `16` is sufficient for year values (up to 65535).
    component comparator = LessEqThan(16);
    comparator.in[0] <== minAge;
    comparator.in[1] <== age;

    // 3. Constrain the output of the check to be true (1)
    // This enforces the rule for the proof to be valid.
    comparator.out === 1;
}

component main = AgeCheck();