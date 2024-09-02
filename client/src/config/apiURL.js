const {
	REACT_APP_API_SCHEME: scheme,
	REACT_APP_API_HOST: host,
	REACT_APP_API_PORT: port,
	REACT_APP_API_BASE_PATH: path,
} = process.env;

const BASE = `${scheme}://${host}:${port}`;
const API_URL = `${BASE}/${path}`;

export const SOCKET_IO_URL = BASE;

export default API_URL;
