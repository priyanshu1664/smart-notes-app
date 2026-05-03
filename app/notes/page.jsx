"use client";

import { Plus, Search, Trash2, Edit3, Eye, Tag } from "lucide-react";

import { setIsUpdate } from "@/store/notesSlice";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

function Notes() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // 📡 Fetch Notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/notes");
      if (res.data.success) setNotes(res.data.notes);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 🔍 Filter Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const q = search.toLowerCase();
      return (
        note.title?.toLowerCase().includes(q) ||
        note.content?.toLowerCase().includes(q) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [notes, search]);

  // 🗑 Delete
  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;

    const original = [...notes];
    setNotes(notes.filter((n) => n._id !== id));

    try {
      await axios.delete(`/api/notes/${id}`);
      toast.success("Deleted");
    } catch (err) {
      setNotes(original);
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-orange-50 min-h-screen">
      {/*  HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4 ">
        <div>
          <h1 className="text-3xl font-bold text-orange-900">My Notes</h1>
          <p className="text-md text-gray-800">
            {notes.length} notes • Stay organized
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔍 Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
            <input
              type="text"
              placeholder="Search notes..."
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none w-64 bg-white shadow-sm"
            />
          </div>

          {/* ➕ Add Note */}
          <Link
            href="/notes/add-note"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </Link>
        </div>
      </div>

      {/* 📚 NOTES GRID */}
      {loading ? (
        <div className="text-center text-black py-20">Loading...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-orange-200 text-orange-400">
          No notes found
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="group bg-white p-5 rounded-xl border border-orange-200 shadow-sm hover:shadow-md hover:border-orange-600 transition-all"
            >
              {/* TITLE */}
              <h2 className="text-xl font-semibold text-orange-900 truncate">
                {note.title}
              </h2>

              {/* CONTENT */}
              <p className="text-md text-orange-800 mt-2 line-clamp-3">
                {note.content}
              </p>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mt-4">
                {note.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between mt-5">
                {/* View */}
                <Link
                  href={`/notes/${note.slug}`}
                  className="text-orange-600 hover:text-orange-800 transition"
                  title="View"
                >
                  <Eye className="w-5 h-5" />
                </Link>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  {/* Edit */}
                  <button
                    onClick={() => {
                      dispatch(setIsUpdate(true));
                      router.push(`/notes/add-note/${note.slug}`);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteNote(note._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-[13px] text-orange-800 mt-4">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notes;
