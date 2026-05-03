"use client";

import { setIsUpdate } from "@/store/notesSlice";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

function page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isUpdate } = useSelector((s) => s.notes);
  // console.log("isUpdate", isUpdate);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const { slug } = useParams();

  const fetchNoteBySlug = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/notes/slug/${slug}`);
      if (res.data.success) {
        let currNote = res.data.note;
        setNote(currNote);
        //  console.log("Note", currNote);
        setFormData({
          title: currNote.title,
          content: currNote.content,
          tags: currNote.tags,
        });
      }
    } catch (error) {
      toast.error("Failed to load note");
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchNoteBySlug();
    } else {
      dispatch(setIsUpdate(false));
    }
  }, [slug]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateNote = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/notes/${note._id}`, formData);

      setFormData({ title: "", content: "", tags: "" });
      toast.success("Note Updated!");
      router.push("/notes");
    } catch (error) {
      toast.error("Error Occured", error.message);
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-orange-100 border border-gray-200 rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          ✨ Create Note
        </h1>

        <form onSubmit={updateNote} className="flex flex-col gap-4">
          <input
            type="text"
            name="title"
            placeholder="Title..."
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 outline-none transition"
            value={formData.title}
            onChange={handleChange}
          />

          <textarea
            name="content"
            placeholder="Write something meaningful..."
            rows={4}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 outline-none transition"
            value={formData.content}
            onChange={handleChange}
          />

          <input
            type="text"
            name="tags"
            placeholder="Tags (design, code...)"
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 outline-none transition"
            value={formData.tags}
            onChange={handleChange}
          />

          <button className="bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition shadow-sm">
            Update Note
          </button>
        </form>
      </div>
    </div>
  );
}

export default page;
