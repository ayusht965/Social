const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

//update user
router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        //if user wants to update password
        if (req.body.password) {
            try {
                //generate new password
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
                } catch (err) {
                    return res.status(500).json(err);
                    }
            }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
                });
            res.status(200).json('Account has been updated');
            } catch (err) {
                return res.status(500).json(err);
                }
        } else {
            return res.status(403).json('You can update only your account');
            }
    });


//delete user
router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json('Account has been deleted');
            } catch (err) {
                return res.status(500).json(err);
                }
        } else {
            return res.status(403).json('You can delete only your account');
            }
    });
//get a user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        //we don't want to send password
        const {password, updatedAt, ...other} = user._doc;
        res.status(200).json(other);
        } catch (err) {
            res.status(500).json(err);
            }
    });
//follow a user
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            //find user
            const user = await User.findById(req.params.id);
            //find current user
            const currentUser = await User.findById(req.body.userId);
            //if user is not followed yet
            if (!user.followers.includes(req.body.userId)) {
                //add user to followers
                await user.updateOne({$push: {followers: req.body.userId}});
                //add current user to followings
                await currentUser.updateOne({$push: {followings: req.params.id}});
                res.status(200).json('User has been followed');
                } else {
                    res.status(403).json('You already follow this user');
                    }
            } catch (err) {
                res.status(500).json(err);
                }
        } else {
            res.status(403).json('You cannot follow yourself');
            }
    });
    //unfollow a user
    router.put('/:id/unfollow', async (req, res) => {
        if (req.body.userId !== req.params.id) {
            try {
                //find user
                const user = await User.findById(req.params.id);
                //find current user
                const currentUser = await User.findById(req.body.userId);
                //if user is followed
                if (user.followers.includes(req.body.userId)) {
                    //remove user from followers
                    await user.updateOne({$pull: {followers: req.body.userId}});
                    //remove current user from followings
                    await currentUser.updateOne({$pull: {followings: req.params.id}});
                    res.status(200).json('User has been unfollowed');
                    } else {
                        res.status(403).json('You cannot unfollow a user which you don\'t follow');
                        }
                } catch (err) {
                    res.status(500).json(err);
                    }
            } else {
                res.status(403).json('You cannot unfollow yourself');
                }
        });


module.exports = router;