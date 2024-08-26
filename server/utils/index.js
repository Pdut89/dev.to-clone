const jwt = require('jsonwebtoken')
const DataUriParser = require('datauri/parser')
const path = require('path')

require('dotenv').config()
const { JWT_KEY } = process.env

const { cloudinary } = require('../config/cloudinary')

const parser = new DataUriParser()

const uploadToCloudinary = async (file) => {
	try {
		const extName = path.extname(file.originalname).toString()
		const file64 = parser.format(extName, file.buffer)

		const uploadedResponse = await cloudinary.uploader.upload(file64.content, {
			upload_preset: 'ml_default',
		})
		return uploadedResponse.url
	} catch (error) {
		console.log(error)
	}
}

const createJWTtoken = (id, email) => {
	try {
		const jwtToken = jwt.sign(
			//takes payload (the data you want to encode)
			{ userId: id, email: email },
			JWT_KEY,
			{ expiresIn: '1h' } //token expires in 1 hr
		)
		return jwtToken
	} catch (error) {
		console.log(error) //return err ('Signup failed, please try again', 500)
		//'Login failed, please try again', 500)
	}
}

exports.uploadToCloudinary = uploadToCloudinary
exports.createJWTtoken = createJWTtoken
