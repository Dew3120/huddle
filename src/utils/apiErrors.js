export function getFieldErrors(error) {
  if (!Array.isArray(error?.details)) {
    return {};
  }

  return error.details.reduce((fieldErrors, detail) => {
    if (detail.field) {
      return {
        ...fieldErrors,
        [detail.field]: detail.message,
      };
    }

    return fieldErrors;
  }, {});
}

export function getErrorMessage(error, fallback) {
  return error?.message ?? fallback;
}
