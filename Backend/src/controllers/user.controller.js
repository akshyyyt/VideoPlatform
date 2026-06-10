import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshToken = async function(userId){
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.accessToken = accessToken;

        await user.save({validateBeforeSave: false}); // Since while saving it will want other fields too, so it bypass it validateBeforeSave 

        return {
            accessToken,
            refreshToken
        }
    } catch (err) {
        console.log(err)
        throw new ApiError(500, 'Internal Server Error');
    }
}

const registerUser = asyncHandler( async (req, res) => {

    // Get user details from frontend
    const { fullname, email, username, password  } = req.body;

    // Validation - not empty
    if (
        [fullname, email, username, password].some((field) => field?.trim() == "")
    ) {
        throw new ApiError(400, 'All fields are mandatory!');
    };

    // Check if already exist
    const existedUser = await User.findOne({
        $or: [ {email}, { username } ] // Checks multiple
    })

    if (existedUser) {
        throw new ApiError(409, 'User already exist!');
    };

    // Save images in local, check for avatar
    const avatarLocalPath = req?.files.avatar?.[0].path; // We get the path of uploaded file.
    const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath){
        throw new ApiError(400, 'Avator not found!');
    }

    // upload them on cloudinaary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar){
        throw new ApiError(500, 'Something went wrong while uploading the file')
    }

    // create user object and create entry in DB
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // Checking if entry is made in DB or not. Remove refresh token and pass from response
    const createdUser = await User.findById(user._id)
    .select("-password -refreshToken");

    if (!createdUser){
        throw new ApiError(500, 'DB Entry not created');
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User Registered Succesfully!')
    )
})

const loginUser = asyncHandler( async(req, res) => {
    // req body se data
    const { email, username, password } = req.body;

    // username or email, find username or email, check pass
    if (!(email || username)){
        throw new ApiError(404, 'Username or email is required');
    }


    const user = await User.findOne({
        $or: [{email}, {username}]
    });

    if (!user){
        throw ApiError(404, "Invalid Credentials");
    }

    // password check
    const isPassValid = await user.isPasswordCorrect(password);

    if (!isPassValid){
        throw ApiError(404, "Invalid Credentials");
    }

    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // also removing some field by making db call
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // send cookie
    const options = {
        httpOnly: true,
        secure: true
    } // by default user can modify it on frontend but now only can be modified by server

    // response
    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
                },
                'User Logged In'
            ))
})

const logOut = asyncHandler( async (req, res) => { 
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {
            accessToken: undefined
            }
        },
        {
            returnDocument: "after" // Give the updated value in response
        } 
    )

    const options = {
        httpOnly: true,
        secure: true
    }  

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, 'User Logged Out')
    )
}) 

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorized Request');

    const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if(!user) throw new ApiError(401, 'Invalid Refresh Token');

    if(incomingRefreshToken != user?.refreshToken){
        throw new ApiError(401, 'Refresh Token is expired or used');
    }

    const { accessToken, newRefreshToken  } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json( new ApiResponse(200, {
        "accessToken": accessToken,
        "refreshToken": newRefreshToken
        },
        "Access Token Refreshed"
    ))

})

const changeCurrentPass = asyncHandler( async(res, req) => {
    const { oldPass, newPass } = req.body;

    // If user is able to change passs, then he's logged in. Ie we have user by middle ware 
    const user = await User.findById(req.user?._id);

    const isPassCorrect = await user.isPasswordCorrect(oldPass)

    if (!isPassCorrect){
        throw new ApiError(400, 'Invalid Password');
    };

    user.password = newPass;
    await user.save({validateBeforeSave: false}); 

    return res.status(200)
    .json(new ApiResponse(200, {}, 'Password Changed'))
})

export {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken
};