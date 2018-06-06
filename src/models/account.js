const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const { generateToken } = require('../lib/token');

const Account = new Schema({
    profile: {
        username: String,
        thumbnail: {
            type: String,
            default: '/static/images/default_thumbnail.png'
        }
    },
    email: {
        type: String
    },
    // 소셜 계정으로 회원가입을 할 경우에는 각 서비스에 제공되는 id와 accessToken을 저장합니다.
    social: {
        facebook: {
            id: String,
            accessToken: String
        },
        google: {
            id: String,
            accessToken: String
        }
    },
    password: String, // 로컬계정의 경우 비밀번호를 해싱 합니다.
    thoughtCount: {
        type: Number,
        default: 0
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

function hash(password) {
    return crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex');
}

Account.statics.findByUser = function (username) {
    return this.findOne({ 'profile.username': username }).exec();
};

Account.statics.findByEmail = function (email) {
    return this.findOne({ email }).exec();
};

Account.statics.findByEmailOrUsername = function ({ username, email }) {
    return this.findOne({
        // $or 연산자를 통해 둘중에 하나를 만족하는 데이터를 찾습니다.
        $or: [
            {
                'profile.username': username
            },
            { email }
        ]
    }).exec();
};

Account.statics.localRegister = function ({ username, email, password }) {
    const account = new this({
        profile: {
            username
        },
        email,
        password: hash(password)
    });

    return account.save();
};

// 함수로 전달받은 password의 해시값과 데이터에 담겨있는 해시값을 비교합니다.
Account.methods.validatePassword = function (password) {
    const hashed = hash(password);
    return this.password === hashed;
};

Account.methods.generateToken = function() {
    // JWT 에 담을 내용
    const payload = {
        _id: this._id,
        profile: this.profile
    };

    return generateToken(payload, 'account');
};

module.exports = mongoose.model('Account', Account); // 실제 DB상에는 Accouts와 같이 복수형으로 생성 됩니다.