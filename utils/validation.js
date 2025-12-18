import validate from "validate.js";

export function validateUser(data) {
    // user schema
    var constraint = {
        username: {
            presence: {
                allowEmpty: false,
            },
        },
        password: {
            presence: {
                allowEmpty: false,
            },
        },
        role_id: {
            presence: {
                allowEmpty: false,
            },
        },
    };

    return validate(data, constraint, { format: "flat" });
}
