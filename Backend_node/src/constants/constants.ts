const now = new Date();
export const LOGGER_FOLDER_NAME = "logs";

const datetime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
export const LOGGER_FILE_NAME = datetime.replace(/:/g, '-') + ".log"; // Replace colons for Windows compatibility

export default {
    LOGGER_FOLDER_NAME,
    LOGGER_FILE_NAME
};