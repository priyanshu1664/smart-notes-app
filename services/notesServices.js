import NotesModel from "@/models/NotesModel";

export const getAllNotes = async () => {
  return await NotesModel.find().sort({ createdAt: -1 });
};
export const getUserNotes = async (id) => {
  return await NotesModel.find({ userId: id }).sort({ createdAt: -1 });
};

export const getNoteById = async (id) => {
  return await NotesModel.findById(id);
};
export const getNoteBySlug = async (slug) => {
  return await NotesModel.findOne({ slug });
};

export const createNote = async ({
  title,
  content,
  tagsArray,
  slug,
  userId,
}) => {
  return await NotesModel.create({
    title,
    content,
    tags: tagsArray,
    slug,
    userId,
  });
};

export const deleteNoteById = async (id) => {
  return await NotesModel.findByIdAndDelete(id);
};

export async function uniqueSlug(title) {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-"); // spaces → hyphen
  let slug = baseSlug;

  let existingSlug = await NotesModel.findOne({ slug });
  let counter = 1;
  while (existingSlug) {
    slug = `${baseSlug}-${counter}`;
    existingSlug = await NotesModel.findOne({ slug });
    counter++;
  }
  return slug;
}
