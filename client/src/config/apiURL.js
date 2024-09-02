const {
	REACT_APP_API_SCHEME: scheme = "http",
	REACT_APP_API_HOST: host = "localhost",
	REACT_APP_API_PORT: port = 5001,
	REACT_APP_API_BASE_PATH: path = "api",
} = process.env;

const BASE = `${scheme}://${host}:${port}`;
const API_URL = `${BASE}/${path}`;

export const SOCKET_IO_URL = BASE;

export default API_URL;
