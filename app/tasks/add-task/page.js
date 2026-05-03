"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const TaskForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const initialFormState = {
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    date: "",
    dueDate: "",
    tag: "",
    estimateMinutes: "",
    assignedTo: "self",
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title) return alert("Title is required");

      const res = await axios.post("/api/tasks", formData);

      console.log(res);
      setFormData(initialFormState);
      toast.success("Task Created!");
      router.push("/tasks");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg p-8 shadow-2xl text-gray-900"
      >
        <h2 className="text-xl font-medium mb-6">New task</h2>

        {/* Task Title */}
        <div className="mb-4">
          <label className="block text-md text-black mb-2">Task title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Review onboarding prototype"
            className="w-full bg-white border border-indigo-400 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-700 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-md text-black mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add more context..."
            rows="4"
            className="w-full bg-white border border-indigo-400 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-700 transition-colors"
          />
        </div>

        {/* Priority & Status Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-md text-black mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-white border border-indigo-400 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-700 transition-colors"
            >
              <option value="">Select priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-md text-black mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-white border border-indigo-400 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-700 transition-colors"
            >
              <option value="todo">To do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Due Date & Tag Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-md text-black mb-2">Start Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-white border border-indigo-400 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-700 transition-colors"
            />
          </div>
          <div>
            <label className="block text-md text-black mb-2">Due date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full bg-white border border-indigo-400 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-700 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-md text-black mb-2">
            Tags / Projects
          </label>
          <input
            type="text"
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            placeholder="e.g. Design"
            className="w-full bg-white border border-indigo-400 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-700 transition-colors"
          />
        </div>
        {/* Assigned To */}
        <div>
          <label className="block text-md text-black mb-2">Assigned to</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-white border border-indigo-400 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-700 transition-colors"
          >
            <option value="self">Self</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 gap-3">
          <button
            type="button"
            onClick={() => setFormData(initialFormState)}
            className="px-5 py-2 rounded-lg border border-sky-300 text-gray-600 text-sm font-medium hover:bg-sky-100 transition-all duration-200"
          >
            Clear
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 shadow-sm"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
