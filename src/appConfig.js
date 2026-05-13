import localStorageService from "./services/localStorageService";

const APPLICATION_PATH = "/";

export const getSystemConfig = (key) => {
    const data = localStorageService.getItem("sysConfig") || {};
    if (data === null || data === undefined) return null;
    return data?.[key] !== null && data?.[key] !== undefined ? data?.[key] : null;
};

const ConstantList = {
    ROOT_PATH: window.Configs?.ROOT_PATH || APPLICATION_PATH,
    API_ENPOINT: window.Configs?.API_ENPOINT || "http://localhost:8080",
};

export default ConstantList;
