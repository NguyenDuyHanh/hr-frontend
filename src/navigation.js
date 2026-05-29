let navigateFn = null;

export const setNavigate = (fn) => {
  navigateFn = fn;
};

export const navigateTo = (path, options = {}) => {
  if (navigateFn) {
    navigateFn(path, options);
  } else {
    window.location.href = path;
  }
};
