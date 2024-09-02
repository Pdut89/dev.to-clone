import React from 'react'
import { AiOutlineTwitter } from '@react-icons/all-files/ai/AiOutlineTwitter'
import API_URL from '../../config/apiURL'

const TwitterLogin = () => {
	const handleClick = async () => {
		window.open(API_URL, '_self')
	}
	return (
		<button className='btn btn__social btn--tw' onClick={handleClick}>
			<i>
				<AiOutlineTwitter />
			</i>
			Continue with Twitter
		</button>
	)
}

export default TwitterLogin
