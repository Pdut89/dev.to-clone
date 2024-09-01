import React, { useState, useEffect } from 'react'
import { useHttpClient } from '../../hooks/useHttpClient'
import ErrorModal from '../../components/Modal/ErrorModal'
import TagList from './TagList'
import './Tags.css'
import API_URL from '../../config/apiURL'

const Tags = () => {
	const [loadedTags, setLoadedTags] = useState([])
	const { isLoading, sendReq, error, clearError } = useHttpClient()

	useEffect(() => {
		const fetchTags = async () => {
			try {
				const responseData = await sendReq(`${API_URL}/tags/`)
				setLoadedTags(responseData.tags)
			} catch (err) {}
		}
		fetchTags()
	}, [sendReq])
	return (
		<>
			<ErrorModal error={error} onClose={clearError} />
			<TagList isLoading={isLoading} tags={loadedTags} />
		</>
	)
}

export default Tags
