"use client";

import { setIsUpdate } from "@/store/notesSlice";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { MdOutlinePushPin, MdOutlineContentCopy } from "react-icons/md";

function Notes() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { slug } = useParams();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNoteBySlug = async (slug) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/notes/slug/${slug}`);
      if (res.data.success) setNote(res.data.note);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      router.push("/notes");
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (slug) fetchNoteBySlug(slug);
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto gap-2">
        {loading ? (
          <h1 className="text-center text-gray-400 text-lg animate-pulse">
            Loading note...
          </h1>
        ) : !note ? (
          <h1 className="text-center text-gray-400 text-lg">No note found</h1>
        ) : (
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl shadow-xl p-8 transition hover:shadow-2xl flex flex-col gap-2">
            {/* TITLE */}
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {note.title}
            </h1>

            {/* META */}
            <p className="text-sm text-gray-400 mt-2">
              Personal Note • {new Date(note.createdAt).toLocaleDateString()}
            </p>

            {/* DIVIDER */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3"></div>

            {/* CONTENT */}
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
              {note.content}
            </p>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 mt-6">
              {note.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="bg-orange-50 text-orange-600 text-sm font-medium px-3 py-1 rounded-full border border-orange-200"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center mt-10">
              {/* LEFT */}
              <div className="flex gap-3 flex-row items-center text-gray-400 text-sm">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:text-black hover:bg-gray-100 transition">
                  <MdOutlinePushPin className="text-lg" />
                  <span>Pin</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:text-black hover:bg-gray-100 transition">
                  <MdOutlineContentCopy className="text-lg" />
                  <span>Copy</span>
                </button>
              </div>
              {/* RIGHT */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    dispatch(setIsUpdate(true));
                    router.push(`/notes/add-note/${note.slug}`);
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition shadow-md active:scale-95"
                >
                  Update
                </button>

                <button
                  onClick={() => deleteNote(note._id)}
                  className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow-md active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;
