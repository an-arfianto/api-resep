import validate from "validate.js";

export function validateUser(data) {
    // user schema
    var constraint = {
        name: {
            presence: {
                allowEmpty: false,
            },
        },
        description: {
            presence: {
                allowEmpty: false,
            },
        },
        website: {
            presence: {
                allowEmpty: false,
            },
            url: true,
        },
        phone: {
            presence: {
                allowEmpty: false,
            },
        },
        email: {
            presence: {
                allowEmpty: false,
            },
            email: true,
        },
        address: {
            presence: {
                allowEmpty: false,
            },
        },
    };

    return validate(data, constraint, { format: "flat" });
}
