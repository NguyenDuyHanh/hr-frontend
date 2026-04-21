import localStorageService from "./services/localStorageService";
import { SystemConfigCode } from "./LocalConstants";

const APPLICATION_PATH = "/";

export const getSystemConfig = (key) => {
    const data = localStorageService.getItem("sysConfig") || {};
    if (data === null || data === undefined) return null;
    return data?.[key] !== null && data?.[key] !== undefined ? data?.[key] : null;
};

const ConstantList = {
    AUTH_MODE: window.Configs?.AUTH_MODE || "Keycloak",
    ROOT_PATH: window.Configs?.ROOT_PATH || APPLICATION_PATH,
    ACTIVE_LAYOUT: window.Configs?.ACTIVE_LAYOUT || "layout1",
    API_ENPOINT: window.Configs?.API_ENPOINT || "http://localhost:8075",
    LOGIN_PAGE: APPLICATION_PATH + "session/signin",
    HOME_PAGE: APPLICATION_PATH + "home",
    LOGOUT_URL: window.Configs?.LOGOUT_URL,
    REDIRECT_URL: window.Configs?.REDIRECT_URL,
    API_EN_POINT_EMR: window.Configs?.API_EN_POINT_EMR || "https://emr-api.globits.net",
    API_EN_POINT_HR: window.Configs?.API_EN_POINT_HR || "https://hrlinhanh-api.smarthospital247.com/api",
    EMR_URL: window.Configs?.EMR_URL || "https://emr.globits.net",
    HR_URL: window.Configs?.HR_URL || "https://hr.smarthospital247.com",
    ELEARNING_URL: window.Configs?.HR_URL || "https://elearning.smarthospital247.com",
    PRODUCT_TYPE: window.Configs?.PRODUCT_TYPE || "Medicine",
};

export default ConstantList;
