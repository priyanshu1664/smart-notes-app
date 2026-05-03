import { combineReducers, configureStore } from "@reduxjs/toolkit";
import notesReducer from "./notesSlice";
import userReducer from "./userSlice";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";

const rootReducer = combineReducers({ notes: notesReducer, user: userReducer });

const persistedConfig = {
  key: "root",
  storage,
  whiteList: ["user", "notes"],
};

const persistedReducer = persistReducer(persistedConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddlware) =>
    getDefaultMiddlware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export default store;
