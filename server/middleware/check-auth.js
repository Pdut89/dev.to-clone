const jwt = require('jsonwebtoken')
require('dotenv').config()
const { JWT_KEY } = process.env
const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
	if (req.method === 'OPTIONS') {
		return next() //allow the request to continue
	}
	try {
		const token = req.headers?.authorization?.split(' ')?.[1] //Authorization: 'Bearer TOKEN'
		// const isCustomAuth = token.length < 500 //> 500 = Google auth
		if (!token) {
			throw new Error('Token missing from auth headers.')
		}

		const decodedToken = jwt.verify(token, JWT_KEY)
		req.userData = { userId: decodedToken.userId } //add data to request

		// let decodedToken
		// if (isCustomAuth) {
		// 	decodedToken = jwt.verify(token, JWT_KEY)
		// 	req.userData = { userId: decodedToken.userId } //add data to request
		// } else {
		// 	decodedToken = jwt.decode(token)
		// 	req.userData = { userId: decodedToken?.sub } //add data to request
		// }
		next() //let the request continue
	} catch (error) {
		console.error(error)
		return next(new HttpError('Authentication failed!', 403))
	}
}
