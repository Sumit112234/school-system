import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "helper"],
      required: [true, "Role is required"],
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
 
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (exclude sensitive data)
UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    avatar: this.avatar,
    phone: this.phone,
    address: this.address,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
