// controller/User.js

const bcrypt = require('bcryptjs');
const { findUserById, createUser, findUserByUsername, updateUser } = require('../model/User');
const {signJwt} = require("../middleware/auth");
const {findArticles} = require("../model/Article");

const register = async (req, res) => {
    const { username, password, avatar_url } = req.body;

    // 默认角色为 'normal'
    const role = 'normal';

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required.', code: 4000 });
    }

    findUserByUsername(username, (err, user) => {
        if (user) {
            return res.status(400).send({ message: 'Username already exists.', code: 4001});
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        createUser(username, hashedPassword, role, avatar_url, (err, user) => {
            if (err) {
                return res.status(500).send('There was a problem registering the user.');
            }
            res.status(201).send({ id: user.id });
        });
    });
};

const login = async (req, res) => {
    const { username, password } = req.body;

    findUserByUsername(username, (err, user) => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send({ auth: false, token: null, message: 'Invalid username or password.'});
        }

        // 生成JWT
        const token = signJwt(user)

        res.status(200).send({ auth: true, token, avatar_url: user.avatar_url, role: user.role, id: user.id});
    });
};

const getUserInfo = (req, res) => {
    const userId = req.params.id;

    findUserById(userId, (err, user) => {
        if (err) {
            return res.status(500).send({ message: 'Error fetching user.' });
        }

        // omit password
        res.status(200).send({ user: { id: user.id, username: user.username, avatar_url: user.avatar_url, role: user.role } });
    });
}

// const updateUserProfile = async (req, res) => {
//     const { userId, username, avatar_url } = req.body;
//     updateUser({userId, username, avatar_url}, (err) => {
//         if (err) {
//             return res.status(500).send('There was a problem updating the user profile.');
//         }
//         res.status(200).send({message: 'User profile updated successfully.'});
//     });
// };
//
// const updatePassword = async (req, res) => {
//     const { userId, oldPassword, newPassword } = req.body;
//
//     findUserById(userId, (err, user) => {
//         if (!user || !bcrypt.compareSync(oldPassword, user.password)) {
//             return res.status(401).send({ message: 'Invalid old password.', code: 4012 });
//         }
//
//         const hashedPassword = bcrypt.hashSync(newPassword, 8);
//         updateUser(userId, undefined, hashedPassword, undefined, (err) => {
//             if (err) {
//                 return res.status(500).send('There was a problem updating the password.');
//             }
//             res.status(200).send('Password updated successfully.');
//         });
//     });
// };


module.exports = { register, login, getUserInfo };
