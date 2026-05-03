import UserModel from "@/models/UserModel";

export const getUserById = async (id) => {
  try {
    if (!id) {
      return new Error("Id not provieded");
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return new Error("User not Found");
    }
    return user;
  } catch (error) {
    return new Error("Server Error");
  }
};
