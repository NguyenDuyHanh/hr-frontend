import localStorageService from "./services/localStorageService";

const APPLICATION_PATH = "/";

export const getSystemConfig = (key) => {
    const data = localStorageService.getItem("sysConfig") || {};
    if (data === null || data === undefined) return null;
    return data?.[key] !== null && data?.[key] !== undefined ? data?.[key] : null;
};

const ConstantList = {
    ROOT_PATH: import.meta.env.VITE_ROOT_PATH || APPLICATION_PATH,
    API_ENPOINT: import.meta.env.VITE_API_ENDPOINT || "http://localhost:8080/api",
};

export default ConstantList;
