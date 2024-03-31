const Post = require('../dataModels/Post.model');
const User = require('../dataModels/User.model');
const Vote = require('../dataModels/Vote.model');
const fs = require('fs');

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate('author', 'name');
        return res.json(posts);
    } 
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

const getPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId).populate('author', 'name');
        if(!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        return res.json(post);
    } 
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

const getPostImage = async (req, res) => {
    try {
        const image = req.params.image;
        return res.sendFile(image, { root: './uploads' });
    }
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

const getSearchedPosts = async (req, res) => {
    try {
      const { searchTerm } = req.params;
      const posts = await Post.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { body: { $regex: searchTerm, $options: 'i' } }
        ]
      }).populate('author', 'name');
      return res.json(posts);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  };

const createPost = async (req, res) => {
    try {
        const { title, body } = req.body;
        var images = [];
        if(req.files){ 
            req.files.forEach((file) => {
                images.push(file.filename);
            });
        }
        const authorEmail = req.user.email;
        const author = await User.findOne({ email: authorEmail }).select('_id');
        const post = new Post({ title, body, author, images });
        await post.save();
        return res.json({ msg: 'Post created successfully' });
    } 
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, body } = req.body;
        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        const userEmail = req.user.email;
        const user = await User.findOne({ email: userEmail }).select('_id');
        if(post.author.toString() !== user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        if(post.title !== title) {
            post.title = title;
        }
        if(post.body !== body) {
            post.body = body;
        }
        await post.save();
        return res.json({ msg: 'Post updated successfully' });
    } 
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

const upvotePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userEmail = req.user.email;
        const user = await User.findOne({ email: userEmail }).select('_id');
        const vote = await Vote.findOne({ user: user, post: postId });
        if(vote) {
            vote.voteType = 'upvote';
            await vote.save();
            return res.json({ msg: 'Upvote updated successfully' });
        }
        else {
            const newVote = new Vote({ user: user, post: postId, voteType: 'upvote' });
            await newVote.save();
            return res.json({ msg: 'Upvote added successfully' });
        }
    } 
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

const downvotePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userEmail = req.user.email;
        const user = await User.findOne({ email: userEmail }).select('_id');
        const vote = await Vote.findOne({ user: user, post: postId });
        if(vote) {
            vote.voteType = 'downvote';
            await vote.save();
            return res.json({ msg: 'Downvote updated successfully' });
        }
        else {
            const newVote = new Vote({ user: user, post: postId, voteType: 'downvote' });
            await newVote.save();
            return res.json({ msg: 'Downvote added successfully' });
        }
    } 
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

const getVotes = async (req, res) => {
    try {
        const { postId } = req.params;
        const votes = await Vote.find({ post: postId }).populate('user', 'name');
        const upvotes = votes.filter(vote => vote.voteType === 'upvote');
        const downvotes = votes.filter(vote => vote.voteType === 'downvote');
        return res.json({ upvotes, downvotes });
    } 
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        console.log(postId);
        console.log(post);
        if(!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        post.images.forEach(image => {
            fs.unlink(`./uploads/${image}`, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        });
        await post.deleteOne();
        return res.json({ msg: 'Post deleted successfully' });
    } 
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

module.exports = {
    getAllPosts,
    getPost,
    getPostImage,
    getSearchedPosts,
    createPost,
    updatePost,
    upvotePost,
    downvotePost,
    getVotes,
    deletePost
};