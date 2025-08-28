pragma circom 2.0.0;
include "circomlib/circuits/comparators.circom";

template AgeCheck() {
    signal input birthYear;
    signal input currentYear;
    signal output isOver18;
    
    // Calculate the threshold year
    signal threshold;
    threshold <== currentYear - 18;
    
    // Use LessEqThan from circomlib (32-bit comparison)
    component ageCheck = LessEqThan(32);
    ageCheck.in[0] <== birthYear;
    ageCheck.in[1] <== threshold;
    
    // Output the result (1 if birthYear <= threshold, 0 otherwise)
    isOver18 <== ageCheck.out;
}

component main {public [currentYear]} = AgeCheck();