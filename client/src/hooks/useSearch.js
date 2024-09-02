import { useContext } from "react";
import queryString from "query-string";
import { useHttpClient } from "./useHttpClient";
import { SearchContext } from "../context/search";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import API_URL from "../config/apiURL";

const useSearch = () => {
	const { setSearchValue, setSearchResults } = useContext(SearchContext);

	const { sendReq } = useHttpClient();
	const history = useHistory();

	const search = async (value) => {
		if (value) {
			setSearchValue(value);
			try {
				const data = await list({ search: value || undefined });
				setSearchResults(data);
				history.push(`/search/?query=${value}`);
			} catch (error) {
				console.error(error);
			}
		} else {
			setSearchResults([]);
		}
	};

	const list = async (params) => {
		const query = queryString.stringify(params);
		try {
			const responseData = await sendReq(`${API_URL}/posts/search?${query}`);
			return responseData.posts;
		} catch (error) {
			console.error(error);
		}
	};
	return { search };
};

export default useSearch;
