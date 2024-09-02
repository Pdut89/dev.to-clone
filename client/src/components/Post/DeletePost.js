import React, { useContext, useState } from 'react'
import {
	useHistory,
	useParams,
} from 'react-router-dom/cjs/react-router-dom.min'
import { AuthContext } from '../../context/auth'
import useHttpClient from '../../hooks/useHttpClient'
import DeletionModal from '../Modal/DeletionModal'
import ErrorModal from '../Modal/ErrorModal'
import API_URL from '../../config/apiURL'

export const DeletePost = ({ authorId }) => {
	const { sendReq, error, clearError } = useHttpClient()
	const history = useHistory()
	const { titleURL, postId } = useParams()
	const { currentUser } = useContext(AuthContext)
	const currentUserId = currentUser && currentUser.userId
	const [showConfirmModal, setShowConfirmModal] = useState(false)

	const showDeleteWarningHandler = () => {
		setShowConfirmModal(true)
	}

	const cancelDeleteWarningHandler = () => {
		setShowConfirmModal(false)
	}

	const confirmDeleteWarningHandler = () => {
		handleDelete()
	}

	const handleDelete = async () => {
		try {
			await sendReq(
				`${API_URL}/posts/${titleURL}/${postId}`,
				'DELETE',
				JSON.stringify({ author: currentUserId }),
				{
					'Content-Type': 'application/json',
					Authorization: `Bearer ${currentUser.token}`,
				}
			)
			history.push('/')
		} catch (err) {}
	}
	return (
		<>
			<ErrorModal error={error} onClose={clearError} />

			<DeletionModal
				onClose={() => setShowConfirmModal(false)}
				show={showConfirmModal}
				cancelDeleteHandler={cancelDeleteWarningHandler}
				confirmDeleteHandler={confirmDeleteWarningHandler}
			/>
			{currentUserId === authorId && (
				<button className='btn auth__delete' onClick={showDeleteWarningHandler}>
					Delete Post
				</button>
			)}
		</>
	)
}
