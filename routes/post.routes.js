const express = require("express");
const router = express.Router();
const {ensureAuthenticated} = require("../middlewares/auth.middleware");
const { uploadImage } = require("../middlewares/images.middleware");
const {
    getAllPosts,
    getPost,
    getPostImage,
    getSearchedPosts,
    createPost,
    updatePost,
    upvotePost,
    downvotePost,
    getVotes,
} = require("../controllers/post.controllers");

router.get('/posts', getAllPosts);
router.get('/image/:image', getPostImage);
router.get('/post/:postId', getPost);
router.get('/searchpost/:searchTerm', getSearchedPosts);

router.post('/post', ensureAuthenticated, uploadImage.array('images'), createPost);
router.put('/post/:postId', ensureAuthenticated, updatePost);

router.post('/upvote/:postId', ensureAuthenticated, upvotePost);
router.post('/downvote/:postId', ensureAuthenticated, downvotePost);
router.get('/votes/:postId', getVotes);

module.exports = router;