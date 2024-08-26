const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const Post = require('../models/post')
const User = require('../models/user')

const { uploadToCloudinary } = require('../utils')
const { createTags, updateTags } = require('./tags')

const {
	likeNotification,
	removeLikeNotification,
} = require('../controllers/notifications')

const getAllPosts = async (req, res, next) => {
	try {
		const posts = await Post.find()
			.sort({ date: 'desc' })
			.populate('author')
			.populate('tags')

		res.json({
			posts: posts.map((post) => post.toObject({ getters: true })),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Could not fetch posts, please try again', 500))
	}
}

const getPostById = async (req, res, next) => {
	try {
		const { postId } = req.params
		const post = await Post.findById(postId)
			.populate('author')
			.populate('comments')
			.populate('tags')
		//findById works directly on the contructor fn

		//post is a special mongoose obj; convert it to normal JS obj using toObject
		//get rid of "_" in "_id" using { getters: true }

		if (!post) {
			return next(new HttpError('Could not find post for the provided ID', 404))
		}
		res.json({ post: post.toObject({ getters: true }) })
	} catch (error) {
		console.error(error)
		//stop execution in case of error
		return next(new HttpError('Something went wrong with the server', 500))
	}
}

const getPostsByUserId = async (req, res, next) => {
	try {
		const { userId } = req.params
		const posts = await Post.find({ author: userId }).populate('author')

		if (!posts || posts.length === 0) {
			//forward the error to the middleware and stop execution
			return next(new HttpError('Could not find posts for the user ID', 404))
		}
		res.json({ posts: posts.map((post) => post.toObject({ getters: true })) })
	} catch (error) {
		console.error(error)
		return next(new HttpError('Fetching posts failed. Please try again', 500))
	}
}

const createPost = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return next(new HttpError('Invalid inputs passed, please try again!', 422))
	}

	try {
		const { title, body, tags, titleURL, author } = req.body

		const user = await User.findById(author) //check if the user ID exists

		if (!user) {
			return next(new HttpError('Could not find user for provided ID', 404))
		}

		const imageUrl = await uploadToCloudinary(req.file)
		const createdPost = await Post.create({
			title,
			image: imageUrl,
			body,
			titleURL,
			author,
		})

		// Create tags
		await createTags(JSON.parse(tags), createdPost)
		user.posts.push(createdPost) // Add post id to the corresponding user
		await user.save() // Save the updated user

		res.status(201).json({
			post: createdPost.populate('author').toObject({ getters: true }),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Creating post failed, please try again', 500))
	}
}

const updatePost = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return next(new HttpError('Invalid inputs passed, please try again!', 422))
	}

	try {
		const { postId } = req.params
		const { body } = req

		const post = await Post.findById(postId).populate('tags')

		if (post.author.toString() !== req.body.author) {
			return next(new HttpError('You are not allowed to update the post', 401))
		}

		if (req.file) {
			const imageUrl = await uploadToCloudinary(req.file)
			req = { ...req, body: { ...body, image: imageUrl } }
		}

		Object.keys(req.body).map((key) => {
			if (key !== 'tags') post[key] = req.body[key]
		})

		await updateTags(JSON.parse(req.body.tags), post)

		await post.save()
		res.status(200).json({
			post: post.toObject({ getters: true }),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Could not update post.', 500))
	}
}

const deletePost = async (req, res, next) => {
	try {
		const { postId } = req.params
		// Retrieve the post and populate the author
		const post = await Post.findById(postId).populate('author')
		// Check if the post exists
		if (!post) {
			return next(
				new HttpError('Could not find post for the provided ID.', 404)
			)
		}

		// Verify that the user is authorized to delete the post
		if (post.author.id.toString() !== req.body.author) {
			return next(
				new HttpError('You are not allowed to delete this post.', 401)
			)
		}

		await post.remove()
		post.author.posts.pull(post)
		await post.author.save()

		// Send success response
		res.status(200).json({ message: 'Deleted post successfully.' })
	} catch (error) {
		// Handle errors that occur outside of the transaction
		console.error(error)
		return next(new HttpError('Could not delete post.', 500))
	}
}

const likePost = async (req, res, next) => {
	try {
		const { postId, userId } = req.body
		const post = await Post.findByIdAndUpdate(
			postId,
			{ $addToSet: { likes: userId } },
			{ new: true }
		)
		const authorId = post.author.toString()
		if (authorId !== userId) {
			await likeNotification(userId, postId, authorId, next)
		}

		res.status(200).json({
			post: post.toObject({ getters: true }),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Like failed!', 500))
	}
}

const unlikePost = async (req, res, next) => {
	try {
		const { postId, userId } = req.body
		const post = await Post.findByIdAndUpdate(
			postId,
			{ $pull: { likes: userId } },
			{ new: true }
		)
		const authorId = post.author.toString()

		if (authorId !== userId) {
			await removeLikeNotification(userId, postId, authorId, next)
		}

		res.status(200).json({
			post: post.toObject({ getters: true }),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Unlike failed!', 500))
	}
}

const bookmarkPost = async (req, res, next) => {
	try {
		const { postId, userId } = req.body
		const post = await Post.findByIdAndUpdate(
			postId,
			{
				$addToSet: { bookmarks: userId },
			},
			{ new: true }
		)

		res.status(200).json({
			post: post.toObject({ getters: true }),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Could not bookmark post', 500))
	}
}

const unbookmarkPost = async (req, res, next) => {
	try {
		const { postId, userId } = req.body
		const post = await Post.findByIdAndUpdate(
			postId,
			{
				$pull: { bookmarks: userId },
			},
			{ new: true }
		)

		res.status(200).json({
			post: post.toObject({ getters: true }),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Could not un-bookmark post', 500))
	}
}

const unicornPost = async (req, res, next) => {
	try {
		const { postId, userId } = req.body
		let post = await Post.findByIdAndUpdate(
			postId,
			{
				$addToSet: { unicorns: userId },
			},
			{ new: true }
		)

		res.status(200).json({
			post: post.toObject({ getters: true }),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Could not unicorn post', 500))
	}
}

const ununicornPost = async (req, res, next) => {
	try {
		const { postId, userId } = req.body
		const post = await Post.findByIdAndUpdate(
			postId,
			{
				$pull: { unicorns: userId },
			},
			{ new: true }
		)

		res.status(200).json({
			post: post.toObject({ getters: true }),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Could not un-unicorn post', 500))
	}
}

const getSearchResults = async (req, res, next) => {
	const query = {}
	if (!req.query.search) return

	try {
		const options = '$options'
		query.title = { $regex: req.query.search, [options]: 'i' }
		const posts = await Post.find(query).populate('author').populate('tags')
		res.status(201).json({
			posts: posts.map((post) => post.toObject({ getters: true })),
		})
	} catch (error) {
		console.error(error)
		return next(new HttpError('Search failed, please try again', 400))
	}
}

const getBookmarks = async (req, res, next) => {
	try {
		const { userId } = req.params
		const posts = await Post.find({ bookmarks: userId })
			.populate('tags')
			.populate('author')
		res.json({
			posts: posts.map((post) => post.toObject({ getters: true })),
		})
	} catch (error) {
		console.error(error)
		return next(
			new HttpError('Fetching posts failed. Please try again later', 500)
		)
	}
}

exports.getAllPosts = getAllPosts
exports.getPostById = getPostById
exports.getPostsByUserId = getPostsByUserId
exports.createPost = createPost
exports.updatePost = updatePost
exports.deletePost = deletePost
exports.likePost = likePost
exports.unlikePost = unlikePost
exports.bookmarkPost = bookmarkPost
exports.unbookmarkPost = unbookmarkPost
exports.unicornPost = unicornPost
exports.ununicornPost = ununicornPost
exports.getBookmarks = getBookmarks
exports.getSearchResults = getSearchResults
