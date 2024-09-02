import React, { useState, useEffect } from 'react'
import ErrorModal from '../../components/Modal/ErrorModal'
import useHttpClient from '../../hooks/useHttpClient'
import PostList from '../PostList/PostList'
import API_URL from '../../config/apiURL'
const Posts = ({ cover }) => {
	const [loadedPosts, setLoadedPosts] = useState([])
	const { isLoading, sendReq, error, clearError } = useHttpClient()
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const responseData = await sendReq(`${API_URL}/posts`)
				setLoadedPosts(responseData.posts)
			} catch (err) {}
		}
		fetchPosts()
	}, [sendReq])

	return (
		<>
			<ErrorModal error={error} onClose={clearError} />
			{loadedPosts && (
				<PostList isLoading={isLoading} items={loadedPosts} cover={cover} />
			)}
		</>
	)
}

export default Posts
