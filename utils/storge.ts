import { File } from "expo-file-system";
import { supabase } from "./supabase";

// Upload Image to Supabase function
export const uploadImage = async (userId: string, imageUri: string) => {
  try {
    const fileExtension = imageUri.split(".").pop() || "jpg"; // Get the file extension e.g jpg, png, jpeg...
    const fileName = `${userId}/${Date.now()}.${fileExtension}`; // Create a unique file name
    const file = new File(imageUri); //Get the file object. It contains the name, timestamp, size, etc
    const bytes = await file.bytes(); // convert the file to bytes to keep the values consistent

    const { error } = await supabase.storage
      .from("book_image") // Name of the storage bucket
      .upload(fileName, bytes, {
        // upload(name, file)
        contentType: `image/${fileExtension}`,
        upsert: true, // Allows to update and insert
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage //Get the data and change the name to urlData
      .from("book_image")
      .getPublicUrl(fileName); //This turns the uploaded file (fileName) into a shareable link..."https://vdygyvhf"

    return `${urlData.publicUrl}?t=${Date.now()}`; // returns a unique shareable link
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
