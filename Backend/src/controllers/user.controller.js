import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/apiResponse.js';

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
    const avatarLocalPath = req?.files.avatar[0].path; // We get the path of uploaded file.
    const coverImageLocalPath = req?.files?.coverImage[0]?.path;

    if (!avatarLocalPath){
        throw new ApiError(400, 'Avator not found!');
    }

    // upload them on cloudinaary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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

export default registerUser;