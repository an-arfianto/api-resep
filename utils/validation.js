import validate from "validate.js";
import ErrorResponse from "./errorResponse.js";

// custom validators
validate.validators.type = function (value, options) {
    if (options === "array") {
        if (!Array.isArray(value)) {
            return "harus berupa array";
        }
    }
    return null;
};

// validasi middleware
export function validateRequest(schema) {
    return (req, res, next) => {
        const errors = validate(req.body, schema, { format: "flat" });

        if (errors) {
            return next(new ErrorResponse(errors.join(", "), 400));
        }

        next();
    };
}

// Validation schema
export const schema = {
    // registrasi
    user: {
        username: {
            presence: {
                allowEmpty: false,
                message: "^Username tidak boleh kosong",
            },
            length: {
                minimum: 3,
                maximum: 50,
                message: "^Username minimal 3-50 karakter",
            },
        },
        password: {
            presence: {
                allowEmpty: false,
                message: "^Password tidak boleh kosong",
            },
            length: {
                minimum: 6,
                message: "^Password minimal 6 karakter",
            },
        },
        role_id: {
            presence: {
                allowEmpty: false,
                message: "^Role ID tidak boleh kosong",
            },
            numericality: {
                onlyInteger: true,
                greaterThan: 0,
                message: "^Role ID harus berupa angka positif",
            },
        },
    },

    // login
    login: {
        username: {
            presence: {
                allowEmpty: false,
                message: "^Username tidak boleh kosong",
            },
        },
        password: {
            presence: {
                allowEmpty: false,
                message: "^Password tidak boleh kosong",
            },
        },
    },
};
