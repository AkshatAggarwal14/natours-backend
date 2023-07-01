const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

exports.signup = catchAsync(async (req, res, next) => {
    //! Wrong as anyone can POST role: 'admin' to attain admin privileges
    // const newUser = await User.create(req.body);

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    //! To generate secret
    // node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            //! this will still display 'password' even though select: false
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    // this document has access to email, password

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        // now we are logged in using this token!
        token,
    });
});

// routes are protected using .protect middleware
exports.protect = catchAsync(async (req, res, next) => {
    // Getting token and check if its there

    let token;
    // usually in headers as 'Authorization:Bearer <token>'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please log in to get access',
                401
            )
        );
    }

    // Verify token and handle 'TokenExpiredError' & 'JsonWebTokenError'
    const decodedPayload = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
    );
    // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    //     console.log(decoded.id);
    // });

    // Check if user still exists
    const currentUser = await User.findById(decodedPayload.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token no longer exists!',
                401
            )
        );
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
        return next(
            new AppError(
                'User recently changed password! Please log in again.',
                401
            )
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});
